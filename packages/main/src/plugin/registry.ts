import { Disposable } from '/@/plugin/types/disposable.js';

export abstract class Registry<T> {
  protected providers = new Map<string, T>();
  protected count = 0;

  protected generateProviderId(): string {
    const providerId = `${this.count}`;
    this.count += 1;
    return providerId;
  }

  registerProvider(provider: T): Disposable {
    const providerId = this.generateProviderId();
    this.providers.set(providerId, provider);
    return Disposable.create(() => {
      this.unregisterProvider(providerId);
    });
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }
}
