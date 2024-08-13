/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

// A simpler method of holding all the Kubernetes context information in one place
// for the UI to use.

export interface KubeCluster {
  name: string;
  server: string;
  skipTLSVerify?: boolean;
  tlsServerName?: string;
}

export interface KubeContext {
  name: string;
  cluster: string;
  user: string;
  namespace?: string;
  clusterInfo?: KubeCluster;

  // Is this the current context? Should be true for ONE context in the array list of contexts.
  currentContext?: boolean;

  // Optional BASE64 encoded icon to be used in the UI.
  icon?: string;
  // error to display in case of deletion (or other operation) error
  error?: string;
}
