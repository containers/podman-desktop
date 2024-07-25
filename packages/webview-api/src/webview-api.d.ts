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

/**
 * The Podman Desktop Webview API provides a way to interact with Podman Desktop from webviews
 *
 * @example
 * ```typescript
 * import * as webviewApi from '@podman-desktop/webview-api';
 *
 * ```
 *
 * @module @podman-desktop/webview-api
 **/

declare module '@podman-desktop/webview-api' {
  export interface WebviewApi {
    getState(): unknown;
    postMessage(msg: unknown): void;
    setState(newState: unknown): Promise<void>;
  }
}
