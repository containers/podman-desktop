/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { IConfigurationChangeEvent } from '/@/configuration/models.js';
import type { ContributionInfo } from '/@/contribution-info.js';
import type { CheckingState, ContextGeneralState } from '/@/kubernetes-contexts-states.js';
import type { ForwardConfig } from '/@/kubernetes-port-forward-model.js';
import type { NavigationHistoryPushInfo } from '/@/navigation-history-info.js';
import type { PinOption } from '/@/status-bar/pin-option.js';
import type { SystemOverviewStatusInfo } from '/@/system-overview-info.js';
import type { NotificationTaskInfo, TaskInfo } from '/@/taskInfo.js';

/**
 * Defines the channels used by the ApiSender to send messages from the main process to the renderer process.
 * The key of the ApiSenderChannelMap is the channel name, and the value is the type of the data sent on that channel.
 * If the channel does not send any data, the value can be set to never or undefined.
 * This map is used to strongly type the send and receive methods of the ApiSenderType.
 */
export interface ApiSenderChannelMap {
  'app-update-available': boolean;
  'authentication-provider-update': { id: string };
  'build-image-task-delete': number | undefined;
  'build-image-task-update': number | undefined;
  'cli-tool-change': string;
  'cli-tool-create': never;
  'cli-tool-remove': string;
  'color-updated': never;
  'commands-added': never;
  'commands-removed': never;
  'configuration-changed': Omit<IConfigurationChangeEvent, 'scope'>;
  'container-created-event': string;
  'container-die-event': string;
  'container-init-event': string;
  'container-kill-event': string;
  'container-removed-event': string;
  'container-started-event': string;
  'container-stopped-event': string;
  'context-key-removed': { key: string };
  'context-menu:visible': boolean;
  'context-value-updated': { key: string; value: unknown };
  'contribution-register': ContributionInfo[];
  'contribution-unregister': ContributionInfo;
  'dev-tools:open-extension': string;
  'dev-tools:open-webview': string;
  'display-feedback': never;
  'dashboard:system-overview-status': SystemOverviewStatusInfo;
  'documentation-updated': never;
  'enhanced-dashboard-enabled': boolean;
  'explore-features-loaded': never;
  'extension-removed': never;
  'extension-started': never;
  'extension-starting': never;
  'extension-stopped': never;
  'extension-stopping': never;
  'extensions-development-folders-changed': never;
  'extensions-started': never;
  'extensions-updated': never;
  'feature-registry:features-updated': string[];
  'font-update': never;
  'icon-update': never;
  'image-build-event': string;
  'image-checker-provider-remove': { id: string };
  'image-checker-provider-update': { id: string };
  'image-files-provider-remove': { id: string };
  'image-files-provider-update': { id: string };
  'image-loadfromarchive-event': string;
  'image-pull-event': string;
  'image-remove-event': string;
  'image-tag-event': string;
  'image-untag-event': string;
  'install-extension:from-id': string;
  'kubeconfig-update': never;
  'kubernetes-active-resources-count': never;
  'kubernetes-context-update': never;
  'kubernetes-contexts-checking-state-update': Map<string, CheckingState>;
  'kubernetes-contexts-general-state-update': Map<string, ContextGeneralState>;
  'kubernetes-contexts-healths': never;
  'kubernetes-contexts-permissions': never;
  'kubernetes-current-context-configmaps-update': unknown[];
  'kubernetes-current-context-cronjobs-update': unknown[];
  'kubernetes-current-context-deployments-update': unknown[];
  'kubernetes-current-context-events-update': unknown[];
  'kubernetes-current-context-general-state-update': ContextGeneralState;
  'kubernetes-current-context-ingresses-update': unknown[];
  'kubernetes-current-context-jobs-update': unknown[];
  'kubernetes-current-context-nodes-update': unknown[];
  'kubernetes-current-context-persistentvolumeclaims-update': unknown[];
  'kubernetes-current-context-pods-update': unknown[];
  'kubernetes-current-context-routes-update': unknown[];
  'kubernetes-current-context-secrets-update': unknown[];
  'kubernetes-current-context-services-update': unknown[];
  'kubernetes-navigation': { kind: string; name?: string; namespace?: string };
  'kubernetes-port-forwards-update': ForwardConfig[];
  'kubernetes-resources-count': never;
  navigate: unknown;
  'navigation-go-back': never;
  'navigation-go-forward': never;
  'navigation-history-push': NavigationHistoryPushInfo;
  'navigation-searchable-route-update': never;
  'network-event': never;
  'notifications-updated': never;
  onDidChangeConfiguration: unknown;
  'pod-event': never;
  'provider-change': Record<string, never>;
  'provider-container-connection-update-status': never;
  'provider-create': string;
  'provider-delete': string;
  'provider-register-kubernetes-connection': { name: string };
  'provider-register-vm-connection': { name: string };
  'provider-unregister-kubernetes-connection': { name: string };
  'provider-unregister-vm-connection': { name: string };
  'provider:update-status': string;
  'provider:update-version': never;
  'provider:update-warnings': string;
  'refresh-catalog': never;
  'registry-register': unknown;
  'registry-unregister': unknown;
  'registry-update': unknown;
  'navigation-search-provider-items-changed': never;
  'search-bar-enabled': boolean;
  'show-release-notes': never;
  'showCustomPick:add': unknown;
  'showInputBox:add': unknown;
  'showInputBox:cancel': number;
  'showMessageBox:open': unknown;
  'showQuickPick:add': unknown;
  'showQuickPick:cancel': number;
  'starting-extensions': string;
  'status-bar-updated': never;
  'statusbar:pin:update': PinOption[];
  'statusbar:toggle-pin-menu': never;
  'task-created': TaskInfo | NotificationTaskInfo;
  'task-removed': TaskInfo | NotificationTaskInfo;
  'task-updated': TaskInfo | NotificationTaskInfo;
  'toast:handler': { type: string; message: string };
  'toggle-help-menu': never;
  'toggle-task-manager': never;
  'volume-event': never;
  'webview-create': string;
  'webview-delete': string;
  'webview-panel-update:title': { id: string; title: string };
  'webview-post-message': { id: string; message: unknown };
  'webview-update': never;
  'webview-update:html': { id: string; html: string };
  'webview-update:options': { id: string; options: unknown };
}
