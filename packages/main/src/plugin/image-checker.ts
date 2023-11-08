import type {
  Disposable,
  ImageCheckResult,
  ImageCheckerProvider,
  ImageCheckerProviderMetadata,
} from '@podman-desktop/api';
import type { ApiSenderType } from './api.js';
import type { ImageCheckerExtensionInfo, ImageCheckerInfo } from './api/image-checker-info.js';

export interface ImageCheckerProviderWithMetadata {
  id: string;
  label: string;
  provider: ImageCheckerProvider;
}

export class ImageCheckerImpl {
  private _imageCheckerProviders: Map<string, ImageCheckerProviderWithMetadata> = new Map<
    string,
    ImageCheckerProviderWithMetadata
  >();

  constructor(private apiSender: ApiSenderType) {}

  registerImageCheckerProvider(
    extensionInfo: ImageCheckerExtensionInfo,
    provider: ImageCheckerProvider,
    metadata?: ImageCheckerProviderMetadata,
  ): Disposable {
    const label = metadata?.label ?? extensionInfo.label;
    const idBase = `${extensionInfo.id}-`;
    let id: string = '';
    for (let i = 0; ; i++) {
      const newId = idBase + i;
      if (!this._imageCheckerProviders.get(newId)) {
        id = newId;
        break;
      }
    }
    if (id === '') {
      throw new Error(`Unable to register an image checker for extension '${extensionInfo.id}'.`);
    }
    this._imageCheckerProviders.set(id, {
      id,
      label,
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
        label: el.label,
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
