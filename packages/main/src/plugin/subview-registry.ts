import type { ApiSenderType } from '/@/plugin/api.js';
import { Registry } from '/@/plugin/registry.js';
import { Disposable } from './types/disposable.js';
import type { SubviewInfo } from '/@/plugin/api/subviewInfo.js';

export class SubviewRegistry extends Registry<SubviewInfo, string> {
  protected subviews: Map<string, SubviewInfo> = new Map();

  constructor(private apiSender: ApiSenderType) {
    super();
  }

  listSubviews(): SubviewInfo[] {
    return Array.from(this.subviews.values());
  }

  register(item: SubviewInfo): Disposable {
    this.subviews.set(item.id, item);
    this.apiSender.send('subview-register');
    return new Disposable(() => {
      this.unregister(item.id);
    });
  }

  unregister(id: string): void {
    this.subviews.delete(id);
    this.apiSender.send('subview-unregister');
  }
}
