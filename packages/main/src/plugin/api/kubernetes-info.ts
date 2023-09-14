/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

// Below are "UIInfo" interfaces only meant for basic representation within the "listing" parts of the UI.
// this helps easily create tables as well as search through them without having to deal with the full
// Kubernetes API objects.

// Pods "UI" Readable interface
export interface PodUIInfo {
  name: string;
  namespace: string;
  node: string;
  containers: ContainerUIInfo[];
  status: string;
  age: string;
  restarts: number;
  qos: string;
  terminating: boolean;
}

// Add more if applicable (right now just need name and image)
export interface ContainerUIInfo {
  name: string;
  image: string;
  // Container statuses do not sometimes show / are ready as they are located
  // in the metadata under containerStatuses.
  // thus these are OPTIONAL.
  // source: https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#containerstatus-v1-core
  // we will use ContainerState to simplify matters, so the only choices are:
  // running, terminated, waiting
  state?: string;
}

export interface DeploymentUIInfo {
  name: string;
  namespace: string;
  replicas: number;
  ready: number;
  age: string;
}

export interface ConfigMapUIInfo {
  name: string;
  namespace: string;
  age: string;
  keys: string[];
}

// Kubernetes Persistent Volume Claim
export interface PVCUIInfo {
  name: string;
  namespace: string;
  age: string;
  size: string;
  storageClass: string;
}

// Kubernetes services
export interface ServiceUIInfo {
  name: string;
  namespace: string;
  age: string;
  type: string;
  clusterIP: string;
  externalIP: string;
  ports: string[];
}

// Kubernetes ingress
export interface IngressUIInfo {
  name: string;
  namespace: string;
  age: string;
  loadBalancers: string[];
  hosts: string[];
}
