import type { UpdateProvider } from './update-provider.js';
import type { AssetInfo, BinaryProviderInfo, BinaryDisposable } from '../api/BinaryProviderInfo.js';
import * as fs from 'fs';
import * as path from 'path';
import { isAlphanumeric, isWindows } from '../../util.js';

export interface BinaryProvider {
  name: string;
  updater: UpdateProvider;
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
  protected count = 0;
  private readonly storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  protected generateProviderId(): string {
    const providerId = `${this.count}`;
    this.count += 1;
    return providerId;
  }

  registerProvider(provider: BinaryProvider): BinaryDisposable {
    if (!isAlphanumeric(provider.name))
      throw new Error('The provider name can only be alphanumeric since it used as name for the binary.');

    const providerId = this.generateProviderId();
    this.providers.set(providerId, provider);
    return {
      providerId: providerId,
      dispose: () => this.unregisterProvider(providerId),
    };
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
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

  async checkUpdates(providerIds?: string[], limit = 10): Promise<UpdateInfo[]> {
    return Promise.all(
      Array.from(this.providers.entries()).reduce((previousValue, [providerId, binaryProvider]) => {
        if (providerIds !== undefined && !providerIds?.includes(providerId)) return previousValue;

        previousValue.push(
          binaryProvider.updater.getCandidateVersions(limit).then(versions => ({
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

    // perform install using update provider
    await provider.updater.performInstall(assetInfo, destFile);

    // save on persistent storage the information related to the installed version
    await this.setOrUpdateBinaryInstalled({ providerId: providerId, assetInfo: assetInfo, path: destFile });
  }
}
