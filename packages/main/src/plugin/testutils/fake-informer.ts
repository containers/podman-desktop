import type { ErrorCallback, KubernetesObject, ObjectCallback } from '@kubernetes/client-node';

export class FakeInformer {
  private onCb: Map<string, ObjectCallback<KubernetesObject>>;
  private offCb: Map<string, ObjectCallback<KubernetesObject>>;
  private onErrorCb: Map<string, ErrorCallback>;

  constructor(
    private resourcesCount: number,
    private connectResponse: Error | undefined,
  ) {
    this.onCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.offCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.onErrorCb = new Map<string, ErrorCallback>();
  }
  async start(): Promise<void> {
    this.onErrorCb.get('connect')?.(this.connectResponse);
    if (this.connectResponse === undefined) {
      for (let i = 0; i < this.resourcesCount; i++) {
        this.onCb.get('add')?.({});
      }
    }
  }
  stop() {}
  on(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ) {
    switch (verb) {
      case 'error':
      case 'connect':
        this.onErrorCb.set(verb, cb as ErrorCallback);
        break;
      default:
        this.onCb.set(verb, cb as ObjectCallback<KubernetesObject>);
    }
  }
  off(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ) {
    this.offCb.set(verb, cb);
  }
  get() {}
  list() {}
}
