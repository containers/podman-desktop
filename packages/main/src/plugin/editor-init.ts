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

import type { IConfigurationNode, IConfigurationRegistry } from './configuration-registry.js';
import { EditorSettings } from './editor-settings.js';

export class EditorInit {
  constructor(private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const editorPlatformConfiguration: IConfigurationNode = {
      id: 'preferences.editor',
      title: 'Editor',
      type: 'object',
      properties: {
        [EditorSettings.SectionName + '.' + EditorSettings.FontSize]: {
          description: 'Editor font size, in pixels.',
          type: 'number',
          default: 10,
          minimum: 6,
          maximum: 100,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([editorPlatformConfiguration]);
  }
}
