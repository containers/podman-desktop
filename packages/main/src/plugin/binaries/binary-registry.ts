import { Registry } from '../registry.js';
import type { UpdateProvider } from '/@/plugin/binaries/update-provider.js';

export interface BinaryProvider {
  name: string;
  updater: UpdateProvider;
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

  constructor(storagePath: string) {
    super();
    this.storagePath = storagePath;
  }

  async checkUpdates(): Promise<[BinaryProvider, AssetInfo[]][]> {
    return Promise.all(
      Array.from(this.providers.entries()).map(entry => {
        const provider = entry[1];
        return provider.updater.getVersions().then(versions => [provider, versions] as [BinaryProvider, AssetInfo[]]);
      }),
    );
  }

  public async validateUpdate(providerId: string, assetInfo: AssetInfo) {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error('The provider does not exist.');

    return provider.updater.performInstall(assetInfo, this.storagePath);
  }
}
