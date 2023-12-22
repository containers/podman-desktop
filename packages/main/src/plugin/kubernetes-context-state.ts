import type { Informer, ObjectCache, V1Deployment, V1Pod, V1ReplicaSet } from '@kubernetes/client-node';

export interface ContextInternalState {
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
