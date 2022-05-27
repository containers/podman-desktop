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
import type * as extensionApi from '@tmpwip/extension-api';
import { ipcRenderer } from 'electron';

export class ProgressElection {
  withProgress<R>(
    task: (progress: extensionApi.Progress<{ message?: string; increment?: number }>) => Promise<R>,
  ): Promise<R> {
    return task({
      report: value => {
        ipcRenderer.send('window:set-progress', value);
      },
    });
  }
}
