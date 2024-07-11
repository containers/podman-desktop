/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

// export core modules
export * from './globalSetup/global-setup';
export * from './runner/podman-desktop-runner';
export * from './setupFiles/extended-hooks-utils';
export * from './setupFiles/setup-registry';
export type { RunnerTestContext } from './testContext/runner-test-context';
export * from './utility/cleanup';
export * from './utility/operations';
export * from './utility/platform';
export * from './utility/wait';

// exports Podman Desktop Page Object Module
export * from './model/core/platforms';
export * from './model/core/states';
export * from './model/core/types';
export * from './model/pages/authentication-page';
export * from './model/pages/base-page';
export * from './model/pages/build-image-page';
export * from './model/pages/container-details-page';
export * from './model/pages/containers-page';
export * from './model/pages/create-pod-page';
export * from './model/pages/dashboard-page';
export * from './model/pages/extension-card-page';
export * from './model/pages/extension-catalog-card-page';
export * from './model/pages/extension-details-page';
export * from './model/pages/extensions-page';
export * from './model/pages/image-details-page';
export * from './model/pages/image-edit-page';
export * from './model/pages/images-page';
export * from './model/pages/main-page';
export * from './model/pages/onboarding-page';
export * from './model/pages/play-kube-yaml-page';
export * from './model/pages/podman-machine-details-page';
export * from './model/pages/podman-onboarding-page';
export * from './model/pages/pods-details-page';
export * from './model/pages/pods-page';
export * from './model/pages/pull-image-page';
export * from './model/pages/registries-page';
export * from './model/pages/resources-page';
export * from './model/pages/resources-podman-connections-page';
export * from './model/pages/run-image-page';
export * from './model/pages/settings-bar';
export * from './model/pages/settings-page';
export * from './model/pages/welcome-page';
export * from './model/workbench/navigation';
export * from './model/workbench/status-bar';
