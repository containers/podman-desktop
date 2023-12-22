import type {
  Informer,
  KubernetesObject,
  ObjectCache,
  V1Deployment,
  V1Pod,
  V1ReplicaSet,
} from '@kubernetes/client-node';
import { AppsV1Api, CoreV1Api, KubeConfig, makeInformer } from '@kubernetes/client-node';
import type { KubeContext } from './kubernetes-context.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ApiSenderType } from './api.js';

interface ContextInternalState {
  podInformer?: Informer<V1Pod> & ObjectCache<V1Pod>;
  deploymentInformer?: Informer<V1Deployment> & ObjectCache<V1Deployment>;
  replicasetInformer?: Informer<V1ReplicaSet> & ObjectCache<V1ReplicaSet>;
}

export interface ContextState {
  reachable: boolean;
  podsCount: number;
  deploymentsCount: number;
  replicasetsCount: number;
}

export class ContextsState {
  private kubeConfig = new KubeConfig();
  private contextsState = new Map<string, ContextState>();
  private contextsInternalState = new Map<string, ContextInternalState>();

  constructor(
    private readonly configurationRegistry: ConfigurationRegistry,
    private readonly apiSender: ApiSenderType,
  ) {}

  async update(enabled: boolean | undefined, kubeconfig: KubeConfig) {
    this.kubeConfig = kubeconfig;
    if (enabled) {
      // Add informers for new contexts
      for (const context of this.kubeConfig.contexts) {
        if (this.contextsInternalState.get(context.name) === undefined) {
          this.contextsState.set(context.name, {
            reachable: false,
            podsCount: 0,
            deploymentsCount: 0,
            replicasetsCount: 0,
          });
          const informers = this.createKubeContextInformers(context);
          if (informers) {
            this.contextsInternalState.set(context.name, informers);
          }
        }
      }
      // Delete informers for removed contexts
      for (const [name, state] of this.contextsInternalState) {
        if (!this.kubeConfig.contexts.find(c => c.name === name)) {
          await state.podInformer?.stop();
          await state.deploymentInformer?.stop();
          await state.replicasetInformer?.stop();
          this.contextsInternalState.delete(name);
          this.contextsState.delete(name);
        }
      }
    } else {
      for (const state of this.contextsInternalState.values()) {
        await state.podInformer?.stop();
        await state.deploymentInformer?.stop();
        await state.replicasetInformer?.stop();
      }
      this.contextsInternalState.clear();
      this.contextsState.clear();
      this.dispatchContextsState();
    }
    console.log('==> # informers', this.contextsInternalState.size, this.contextsState.size);
  }

  private createKubeContextInformers(context: KubeContext): ContextInternalState | undefined {
    const kc = new KubeConfig();
    const cluster = this.kubeConfig.clusters.find(c => c.name === context.cluster);
    const user = this.kubeConfig.users.find(u => u.name === context.user);
    if (!cluster || !user) {
      return;
    }
    kc.loadFromOptions({
      clusters: [cluster],
      users: [user],
      contexts: [context],
      currentContext: context.name,
    });

    const ns = context.namespace ?? 'default';
    return {
      podInformer: this.createPodInformer(kc, ns, context),
      deploymentInformer: this.createDeploymentInformer(kc, ns, context),
      replicasetInformer: this.createReplicasetInformer(kc, ns, context),
    };
  }

  private createPodInformer(kc: KubeConfig, ns: string, context: KubeContext): Informer<V1Pod> & ObjectCache<V1Pod> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = () => k8sApi.listNamespacedPod(ns);
    const informer = makeInformer(kc, `/api/v1/namespaces/${ns}/pods`, listFn);

    informer.on('add', (_obj: V1Pod) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.podsCount++;
      }
      this.dispatchContextsState();
    });

    informer.on('delete', (_obj: V1Pod) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.podsCount--;
      }
      this.dispatchContextsState();
    });
    informer.on('error', (err: unknown) => {
      console.error(`==> ${context.name}: error`, err);
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.reachable = err === undefined;
      }
      this.dispatchContextsState();
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
    informer.on('connect', (err: unknown) => {
      console.error(`==> ${context.name}: connect`, err);
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.reachable = err === undefined;
      }
      this.dispatchContextsState();
    });
    this.restartInformer(informer, context);
    return informer;
  }

  private createDeploymentInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Deployment> & ObjectCache<V1Deployment> {
    const k8sApi = kc.makeApiClient(AppsV1Api);
    const listFn = () => k8sApi.listNamespacedDeployment(ns);
    const informer = makeInformer(kc, `/apis/apps/v1/namespaces/${ns}/deployments`, listFn);

    informer.on('add', (_obj: V1Deployment) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.deploymentsCount++;
      }
      this.dispatchContextsState();
    });

    informer.on('delete', (_obj: V1Deployment) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.deploymentsCount--;
      }
      this.dispatchContextsState();
    });
    informer.on('error', (_err: unknown) => {
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
    this.restartInformer(informer, context);
    return informer;
  }

  private createReplicasetInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1ReplicaSet> & ObjectCache<V1ReplicaSet> {
    const k8sApi = kc.makeApiClient(AppsV1Api);
    const listFn = () => k8sApi.listNamespacedReplicaSet(ns);
    const informer = makeInformer(kc, `/apis/apps/v1/namespaces/${ns}/replicasets`, listFn);

    informer.on('add', (_obj: V1ReplicaSet) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.replicasetsCount++;
      }
      this.dispatchContextsState();
    });

    informer.on('delete', (_obj: V1ReplicaSet) => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.replicasetsCount--;
      }
      this.dispatchContextsState();
    });
    informer.on('error', (_err: unknown) => {
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
    this.restartInformer(informer, context);
    return informer;
  }

  private restartInformer(informer: Informer<KubernetesObject> & ObjectCache<KubernetesObject>, context: KubeContext) {
    const kubernetesConfiguration = this.configurationRegistry.getConfiguration('kubernetes');
    const liveContextsInfo = kubernetesConfiguration.get<boolean>('LiveContextsInfo');
    if (!liveContextsInfo) {
      return;
    }

    informer
      .start()
      .then(() => {})
      .catch((err: unknown) => {
        console.log('==> catched err', err);
        const previous = this.contextsState.get(context.name);
        if (previous) {
          previous.reachable = err === undefined;
        }
        this.dispatchContextsState();
        // Restart informer after 5sec
        setTimeout(() => {
          this.restartInformer(informer, context);
        }, 5000);
      });
  }

  private dispatchContextsState() {
    this.apiSender.send(`kubernetes-contexts-state-update`, this.contextsState);
  }

  public getContextsState(): Map<string, ContextState> {
    return this.contextsState;
  }
}
