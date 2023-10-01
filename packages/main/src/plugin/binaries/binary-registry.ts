import { Registry } from '../registry.js';
import type { UpdateProvider } from '/@/plugin/binaries/update-provider.js';
import type { AssetInfo, BinaryProviderInfo } from '/@/plugin/api/BinaryProviderInfo.js';

export interface BinaryProvider {
  name: string;
  updater: UpdateProvider;
}

export interface BinaryInfo {
  providerId: string;
  path: string;
  version: string;
}

export interface UpdateInfo {
  providerId: string;
  candidates: AssetInfo[];
}

export class BinaryRegistry extends Registry<BinaryProvider> {
  private readonly storagePath: string;

  constructor(storagePath: string) {
    super();
    this.storagePath = storagePath;
  }

  async checkUpdates(providerIds?: string[]): Promise<UpdateInfo[]> {
    return Promise.all(
      Array.from(this.providers.entries()).reduce((previousValue, [providerId, binaryProvider]) => {
        if (providerIds !== undefined && !providerIds?.includes(providerId)) return previousValue;

        previousValue.push(
          binaryProvider.updater.getCandidateVersions().then(versions => ({
            providerId: providerId,
            candidates: versions,
          })),
        );

        return previousValue;
      }, [] as Promise<UpdateInfo>[]),
    );
  }

  public async getBinaryInstalled(_providerIds?: string[]): Promise<BinaryInfo[]> {
    // TODO: create the logic of versioning binary files (local json file?)
    return [];
  }

  public async getBinaryProviderInfos(providerIds?: string[]): Promise<BinaryProviderInfo[]> {
    const updates = await this.checkUpdates(providerIds);
    const binaries = await this.getBinaryInstalled(providerIds);

    return updates.map(({ providerId, candidates }) => {
      const provider = this.providers.get(providerId);
      if (!provider) throw new Error('invalid providerId provided by the checkUpdates method.');

      return {
        providerId,
        name: provider.name,
        installedVersion: binaries.find(binary => binary.providerId === providerId)?.version,
        candidates,
      };
    });
  }

  public async performInstall(providerId: string, assetInfo: AssetInfo) {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error('The provider does not exist.');

    return provider.updater.performInstall(assetInfo, this.storagePath);
  }
}
