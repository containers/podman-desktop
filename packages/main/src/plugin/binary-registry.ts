import type { components } from '@octokit/openapi-types';
import type { Octokit } from '@octokit/rest';
import { Registry } from './registry.js';
import path from 'node:path';
import { isWindows } from '../util.js';
import fs from 'node:fs';

type GitHubRelease = components['schemas']['release'];

export interface BinaryProvider {
  name: string;
  githubRepo: string;
  githubOrganization: string;
  findAsset: (assets: GitHubRelease[]) => Promise<AssetInfo | undefined>;
  postInstall?: (fileInfo: FileInfo) => Promise<void>;
}

export interface FileInfo {
  path: string;
}

export interface AssetInfo {
  id: number;
  name: string;
}

export class BinaryRegistry extends Registry<BinaryProvider> {
  private readonly storagePath: string;
  private readonly octokit: Octokit;

  constructor(octokit: Octokit, storagePath: string) {
    super();
    this.octokit = octokit;
    this.storagePath = storagePath;
  }

  async checkUpdates(): Promise<[BinaryProvider, AssetInfo][]> {
    return Promise.all(Array.from(this.providers.entries()).map(entry => this.getAssetInfo(entry[1]))).then(
      array => array.filter(item => item[1]) as [BinaryProvider, AssetInfo][],
    );
  }

  private async getAssetInfo(binaryProvider: BinaryProvider): Promise<[BinaryProvider, AssetInfo | undefined]> {
    const releases = await this.octokit.repos.listReleases({
      owner: binaryProvider.githubOrganization,
      repo: binaryProvider.githubRepo,
    });

    const asset = await binaryProvider.findAsset(releases.data);
    return [binaryProvider, asset];
  }

  public async validateUpdate(providerId: string, assetInfo: AssetInfo) {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error('The provider does not exist.');

    return this.performInstall(provider, assetInfo);
  }

  private async performInstall(binaryProvider: BinaryProvider, assetInfo: AssetInfo): Promise<void> {
    const asset = await this.octokit.repos.getReleaseAsset({
      owner: binaryProvider.githubOrganization,
      repo: binaryProvider.githubRepo,
      asset_id: assetInfo.id,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    if (!asset) {
      throw new Error(`cannot get release asset of ${binaryProvider.githubOrganization}/${binaryProvider.githubRepo}.`);
    }

    const destFile = path.resolve(this.storagePath, isWindows() ? assetInfo.name + '.exe' : assetInfo.name);
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath);
    }

    fs.appendFileSync(destFile, Buffer.from(asset.data as unknown as ArrayBuffer));
    if (!isWindows()) {
      const stat = fs.statSync(destFile);
      fs.chmodSync(destFile, stat.mode | fs.constants.S_IXUSR);
    }

    if (binaryProvider.postInstall)
      return binaryProvider.postInstall({
        path: destFile,
      });
  }
}
