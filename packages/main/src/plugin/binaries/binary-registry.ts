import type { AssetInfo, BinaryProviderInfo } from '../api/BinaryProviderInfo.js';
import * as fs from 'fs';
import * as path from 'path';
import { isAlphanumeric, isWindows } from '../../util.js';
import { Disposable } from '../types/disposable.js';
import type { UpdateProviderRegistry } from './update-provider-registry.js';

export interface BinaryProvider {
  name: string;
  uri: string;
  onInstalled?(assetInfo: AssetInfo, destFile: string): void;
  onRemoved?(): void;
}

export interface BinaryInfo {
  providerId: string;
  path: string;
  assetInfo: AssetInfo;
}

function isBinaryInfo(obj: unknown): boolean {
  return typeof obj === 'object' && !!obj && 'providerId' in obj && 'path' in obj && 'assetInfo' in obj;
}

export interface UpdateInfo {
  providerId: string;
  candidates: AssetInfo[];
}

export const BINARIES_INFO_FILE = 'binaries.json';

export class BinaryRegistry {
  protected providers = new Map<string, BinaryProvider>();

  constructor(
    private readonly storagePath: string,
    private readonly updateProviderRegistry: UpdateProviderRegistry,
  ) {}

  registerProvider(provider: BinaryProvider): Disposable {
    if (!isAlphanumeric(provider.name))
      throw new Error('The provider name can only be alphanumeric since it used as name for the binary.');

    this.providers.set(provider.uri, provider);
    return Disposable.create(() => this.unregisterProvider(provider.uri));
  }

  unregisterProvider(uri: string): void {
    this.deleteBinary(uri);
    this.providers.delete(uri);
  }

  private getFilename(): string {
    return path.join(this.storagePath, BINARIES_INFO_FILE);
  }
  private loadBinariesInfo(): BinaryInfo[] {
    const filename = this.getFilename();
    if (!fs.existsSync(filename)) return [];

    const content = fs.readFileSync(filename, { encoding: 'utf-8' });

    if (!Array.isArray(content)) throw new Error(`${filename} is malformed.`);

    for (const contentElement of content) {
      if (!isBinaryInfo(contentElement)) throw new Error(`${filename} is malformed.`);
    }

    return JSON.parse(content) as BinaryInfo[];
  }

  private saveBinariesInfo(binariesInfo: BinaryInfo[]): void {
    const filename = this.getFilename();
    fs.writeFileSync(filename, JSON.stringify(binariesInfo), { encoding: 'utf-8' });
  }

  private parseUri(uri: string): URL {
    const url = new URL(uri);
    if (!url.protocol?.endsWith(':') || !url.pathname)
      throw new Error('Invalid uri. It is not recognised. Uri format should be protocol://pathname');

    return url;
  }

  async checkUpdates(providerIds?: string[], limit = 10): Promise<UpdateInfo[]> {
    return Promise.all(
      Array.from(this.providers.entries()).reduce((previousValue, [providerId, binaryProvider]) => {
        if (providerIds !== undefined && !providerIds?.includes(providerId)) return previousValue;

        const parsedUri = this.parseUri(binaryProvider.uri);
        const updater = this.updateProviderRegistry.getProvider(parsedUri.protocol);
        if (updater === undefined) throw new Error(`Cannot find UpdaterProvider for protocol '${parsedUri.protocol}'.`);

        previousValue.push(
          updater.getCandidateVersions(parsedUri, limit).then(versions => ({
            providerId: providerId,
            candidates: versions,
          })),
        );

        return previousValue;
      }, [] as Promise<UpdateInfo>[]),
    );
  }

  public async getBinariesInstalled(_providerIds?: string[]): Promise<BinaryInfo[]> {
    const binariesInfo = this.loadBinariesInfo();
    if (_providerIds) return binariesInfo.filter(binaryInfo => _providerIds.includes(binaryInfo.providerId));
    return binariesInfo;
  }

  public deleteBinary(providerId: string): void {
    let binariesInfos = this.loadBinariesInfo();
    const index = binariesInfos.findIndex(item => item.providerId === providerId);
    if (index !== -1) {
      const toRemove = binariesInfos[index];
      binariesInfos = binariesInfos.slice(index, 1);
      console.warn(`Deleting ${toRemove.path} from system.`);
      fs.rmSync(toRemove.path); // delete
      this.saveBinariesInfo(binariesInfos);
      this.providers.get(toRemove.providerId)?.onRemoved?.();
    }
  }

  public async setOrUpdateBinaryInstalled(binaryInfo: BinaryInfo) {
    const binariesInfos = this.loadBinariesInfo();

    const index = binariesInfos.findIndex(item => item.providerId === binaryInfo.providerId);
    if (index !== -1) {
      binariesInfos[index] = binaryInfo;
      this.saveBinariesInfo(binariesInfos);
    } else {
      this.saveBinariesInfo([...binariesInfos, binaryInfo]);
    }
  }

  public async getBinaryProviderInfos(providerIds?: string[]): Promise<BinaryProviderInfo[]> {
    const updates = await this.checkUpdates(providerIds);
    const binaries = await this.getBinariesInstalled(providerIds);

    return updates.map(({ providerId, candidates }) => {
      const provider = this.providers.get(providerId);
      if (!provider) throw new Error('invalid providerId provided by the checkUpdates method.');

      return {
        providerId,
        name: provider.name,
        installedAsset: binaries.find(binary => binary.providerId === providerId)?.assetInfo,
        candidates,
      };
    });
  }

  public async performInstall(providerId: string, assetInfo: AssetInfo) {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error('The provider does not exist.');

    const destFile = path.resolve(this.storagePath, isWindows() ? provider.name + '.exe' : provider.name);

    console.log(`Provider ${provider.name} will install at ${destFile}.`);

    const parsedUri = this.parseUri(provider.uri);
    const updater = this.updateProviderRegistry.getProvider(parsedUri.protocol);
    if (updater === undefined) throw new Error(`Cannot find UpdaterProvider for protocol ${parsedUri.protocol}.`);

    // perform install using update provider
    await updater.performInstall(parsedUri, assetInfo, destFile);
    provider.onInstalled?.(assetInfo, destFile);

    // save on persistent storage the information related to the installed version
    await this.setOrUpdateBinaryInstalled({ providerId: providerId, assetInfo: assetInfo, path: destFile });
  }
}
