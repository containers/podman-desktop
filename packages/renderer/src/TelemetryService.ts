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

  private handlerFlusher: NodeJS.Timeout | undefined;

  public handlePageOpen(pagePath: string) {
    this.handlePageClose();

    this.handlerFlusher = setTimeout(() => {
      if (window.telemetryPage) {
        window.telemetryPage(pagePath)?.catch((error: unknown) => {
          console.error('Failed to send page event', error);
        });
      }
    }, 200);
  }

  // clear timeout
  public handlePageClose() {
    if (this.handlerFlusher) {
      clearTimeout(this.handlerFlusher);
      this.handlerFlusher = undefined;
    }
  }
}
