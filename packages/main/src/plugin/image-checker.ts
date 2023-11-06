import type { Disposable, ImageCheckResult, ImageCheckerProvider } from '@podman-desktop/api';
import type { ApiSenderType } from './api.js';
import type { ImageCheckerInfo } from './api/image-checker-info.js';

export interface ImageCheckerProviderWithMetadata {
  id: string;
  provider: ImageCheckerProvider;
}

export class ImageCheckerImpl {
  private _imageCheckerProviders: Map<string, ImageCheckerProviderWithMetadata> = new Map<
    string,
    ImageCheckerProviderWithMetadata
  >();

  constructor(private apiSender: ApiSenderType) {}

  registerImageCheckerProvider(id: string, provider: ImageCheckerProvider): Disposable {
    if (this._imageCheckerProviders.get(id)) {
      throw new Error(`An authentication provider with id '${id}' is already registered.`);
    }
    this._imageCheckerProviders.set(id, {
      id,
      provider,
    });
    this.apiSender.send('image-checker-provider-update', { id });
    return {
      dispose: () => {
        this._imageCheckerProviders.delete(id);
      },
    };
  }

  getImageCheckerProviders(): ImageCheckerInfo[] {
    return Array.from(this._imageCheckerProviders.keys()).map(k => {
      const el = this._imageCheckerProviders.get(k)!;
      return {
        id: k,
        categories: el.provider.categories,
        name: el.provider.name,
      };
    });
  }

  checkImage(id: string, image: string): Promise<ImageCheckResult> {
    return new Promise((resolve, reject) => {
      const provider = this._imageCheckerProviders.get(id);
      if (provider === undefined) {
        return reject(new Error('provider not found with id ' + id));
      }
      return resolve(provider.provider.checkImage(image));
    });
  }
}
