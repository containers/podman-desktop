import type { ImageCheck } from '@podman-desktop/api';
import type { ImageCheckerInfo } from '../../../../main/src/plugin/api/image-checker-info';

export interface ProviderUI {
  info: ImageCheckerInfo;
  state: 'running' | 'success' | 'failed';
  error?: Error;
}

export interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}
