/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

// Typical Kubernetes labels and annotations that are used internally by Kubernetes and its ecosystem
// such as Helm, Kubectl, networking and other objects.
export const internalKubernetesKeys = [
  'kubectl.kubernetes.io/last-applied-configuration',
  'kubernetes.io/created-by',
  'deploy.kubernetes.io/revision',
  'deployment.kubernetes.io/desired-replicas',
  'deployment.kubernetes.io/max-replicas',
  'deployment.kubernetes.io/revision',
  'kubernetes.io/service-account.name',
  'kubernetes.io/service-account.uid',
  'pod-template-hash',
  'controller-revision-hash',
  'statefulset.kubernetes.io/pod-name',
  'autoscaling.alpha.kubernetes.io/conditions',
  'autoscaling.alpha.kubernetes.io/current-metrics',
  'autoscaling.alpha.kubernetes.io/metrics',
  // Annotations specific to network policies or CNI plugins
  'cilium.io/',
  'calico.org/',
  'flannel.alpha.coreos.com/',
  // Annotations for Helm charts
  'helm.sh/',
  'meta.helm.sh/',
  // Annotations for managing ingress, for example, with Nginx or Traefik
  'nginx.ingress.kubernetes.io/',
  'traefik.ingress.kubernetes.io/',
  // Annotations for cert-manager
  'cert-manager.io/',
  // Annotations for Kubernetes dashboard
  'kubernetes.io/dashboard/',
  // Other internal or system-level annotations and labels
  'config.kubernetes.io/',
  'field.cattle.io/', // Used by Rancher
  'argocd.argoproj.io/', // Used by ArgoCD
];
