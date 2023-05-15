/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

export class TelemetryService {
  private static instance: TelemetryService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getService(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }

    return TelemetryService.instance;
  }

  private handlerFlusher;

  public handlePageOpen(pagePath: string) {
    if (this.handlerFlusher !== undefined) {
      clearTimeout(this.handlerFlusher);
      this.handlerFlusher = undefined;
    }

    this.handlerFlusher = setTimeout(async () => {
      if (window.telemetryPage) {
        await window.telemetryPage(pagePath);
      }
    }, 200);
  }
}
