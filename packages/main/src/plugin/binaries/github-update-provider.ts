import type { AssetInfo } from '/@/plugin/binaries/update-provider.js';
import { UpdateProvider } from '/@/plugin/binaries/update-provider.js';
import type { Octokit } from '@octokit/rest';
import type { components } from '@octokit/openapi-types';
import { isWindows } from '/@/util.js';
import fs from 'node:fs';

type GitHubRelease = components['schemas']['release'];

export class GithubUpdateProvider extends UpdateProvider {
  constructor(
    private readonly octokit: Octokit,
    private readonly githubOrganization: string,
    private readonly githubRepo: string,
    private readonly assetName: string,
  ) {
    super();
  }
  async performInstall(assetInfo: AssetInfo, destination: string): Promise<void> {
    console.log('performInstall', assetInfo, destination, this.githubOrganization, this.githubRepo);
    const asset = await this.octokit.repos.getReleaseAsset({
      owner: this.githubOrganization,
      repo: this.githubRepo,
      asset_id: assetInfo.id,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    if (!asset) {
      throw new Error(`cannot get release asset of ${this.githubOrganization}/${this.githubRepo}.`);
    }

    fs.appendFileSync(destination, Buffer.from(asset.data as unknown as ArrayBuffer));
    if (!isWindows()) {
      const stat = fs.statSync(destination);
      fs.chmodSync(destination, stat.mode | fs.constants.S_IXUSR);
    }
  }

  private async getAssetInfo(data: GitHubRelease[]): Promise<AssetInfo[]> {
    return data.reduce((previousValue, release) => {
      const asset = release.assets.find(asset => asset.name === this.assetName);
      if (asset)
        return [
          ...previousValue,
          {
            name: `${asset.name} - ${release.name ?? release.tag_name}`,
            id: asset.id,
          },
        ];
      return previousValue;
    }, [] as AssetInfo[]);
  }

  async getCandidateVersions(): Promise<AssetInfo[]> {
    const releases = await this.octokit.repos.listReleases({
      owner: this.githubOrganization,
      repo: this.githubRepo,
    });

    return this.getAssetInfo(releases.data);
  }
}
