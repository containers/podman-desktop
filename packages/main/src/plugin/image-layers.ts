import type nodeTar from 'tar';

export interface ImageLayer {
  id: string;
  history?: string;
  files: nodeTar.ReadEntry[];
}
