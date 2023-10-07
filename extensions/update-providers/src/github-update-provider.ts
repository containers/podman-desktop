import type { Octokit } from '@octokit/rest';
import type { components } from '@octokit/openapi-types';
import * as podmanDesktopAPI from '@podman-desktop/api';
import type { AssetInfo } from '@podman-desktop/api';
import * as fs from 'fs';
import { isWindows } from './util';

type GitHubRelease = components['schemas']['release'];

export const GITHUB_PROTOCOL = 'github';

interface ParsedPathname {
  githubOrganization: string;
  githubRepo: string;
}

export class GithubUpdateProvider extends podmanDesktopAPI.UpdateProvider {
  constructor(private readonly octokit: Octokit) {
    super(GITHUB_PROTOCOL);
  }

  private parseUri(uri: URL): ParsedPathname {
    if (uri.host === undefined) throw new Error('Unknown host in the provided uri.');

    if (!uri.pathname?.startsWith('/')) throw new Error('Malformed pathname in provided uri.');

    return {
      githubOrganization: uri.host,
      githubRepo: uri.pathname.slice(1, uri.pathname.length),
    };
  }

  async performInstall(uri: URL, assetInfo: AssetInfo, destination: string): Promise<void> {
    const { githubOrganization, githubRepo } = this.parseUri(uri);

    const asset = await this.octokit.repos.getReleaseAsset({
      owner: githubOrganization,
      repo: githubRepo,
      asset_id: assetInfo.id,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    if (!asset) {
      throw new Error(`cannot get release asset of ${githubOrganization}/${githubRepo}.`);
    }

    fs.appendFileSync(destination, Buffer.from(asset.data as unknown as ArrayBuffer));
    if (!isWindows()) {
      const stat = fs.statSync(destination);
      fs.chmodSync(destination, stat.mode | fs.constants.S_IXUSR);
    }
  }

  private async getAssetInfo(assetName: string, data: GitHubRelease[]): Promise<AssetInfo[]> {
    return data.reduce((previousValue, release) => {
      const asset = release.assets.find(asset => asset.name === assetName);
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

  async getCandidateVersions(uri: URL, limit?: number): Promise<AssetInfo[]> {
    const { githubOrganization, githubRepo } = this.parseUri(uri);

    if (!uri.searchParams.has('assetName')) throw new Error('Missing searchParam assetName.');

    const releases = await this.octokit.repos.listReleases({
      owner: githubOrganization,
      repo: githubRepo,
      per_page: limit,
    });

    return this.getAssetInfo(uri.searchParams.get('assetName'), releases.data);
  }
}
