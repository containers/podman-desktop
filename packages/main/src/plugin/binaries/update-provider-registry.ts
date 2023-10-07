import type { UpdateProvider } from './update-provider.js';
import { Disposable } from '../types/disposable.js';

export class UpdateProviderRegistry {
  protected providers: Map<string, UpdateProvider> = new Map<string, UpdateProvider>();

  public registerProvider(updateProvider: UpdateProvider): Disposable {
    if (this.providers.has(updateProvider.protocol))
      throw new Error(`An UpdateProvider already exist for the uri protocol ${updateProvider.protocol}.`);

    this.providers.set(updateProvider.protocol, updateProvider);
    return Disposable.create(() => this.unregisterProvider(updateProvider.protocol));
  }

  public unregisterProvider(schema: string) {
    this.providers.delete(schema);
  }

  public getProvider(protocol: string): UpdateProvider | undefined {
    if (protocol.endsWith(':')) return this.providers.get(protocol.slice(0, -1));
    return this.providers.get(protocol);
  }
}
