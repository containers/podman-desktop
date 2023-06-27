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

import type { DiagnosticInfoProvider } from '@podman-desktop/api';
import { app, screen } from 'electron';
import os from 'node:os';
import type { IConfigurationPropertyRecordedSchema, IConfigurationRegistry } from '../plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../plugin/configuration-registry-constants';

export class CompositeGeneralDiagnosticInfoProvider implements DiagnosticInfoProvider {
  title: string;
  private _diagnosticInfoProviders: DiagnosticInfoProvider[];

  public constructor(...diagnosticInfoProviders: DiagnosticInfoProvider[]) {
    this._diagnosticInfoProviders = diagnosticInfoProviders;
    this.title = 'General';
  }

  async collectInfo(): Promise<string> {
    let info = '';

    await Promise.all(
      this._diagnosticInfoProviders.map(async provider => {
        const infoOutput = await provider.collectInfo();
        info += `=== ${provider.title} ===\n`;
        info += infoOutput;
      }),
    );

    return Promise.resolve(info);
  }
}

export class AboutInfoProvider implements DiagnosticInfoProvider {
  title = 'About';

  collectInfo(): Promise<string> {
    let info = '';

    info += `App Name: ${app.name}\n`;
    info += `Version: v${app.getVersion()}\n`;
    info += `Packaged: ${app.isPackaged}\n`;
    info += `Command Line: ${process.argv.join(' ')}\n\n\n`;

    return Promise.resolve(info);
  }
}

export class DisplayInfoProvider implements DiagnosticInfoProvider {
  title = 'Displays';

  collectInfo(): Promise<string> {
    let info = '';

    const displays = screen.getAllDisplays();

    displays.forEach(display => {
      info += `Display (${display.label}): ${display.workAreaSize.width * display.scaleFactor}x${
        display.workAreaSize.height * display.scaleFactor
      }; scale: ${display.scaleFactor}\n`;
    });

    info += '\n\n';

    return Promise.resolve(info);
  }
}

export class SystemInfoProvider implements DiagnosticInfoProvider {
  title = 'System';

  collectInfo(): Promise<string> {
    let info = '';
    const mb = 1024 * 1024;

    info += `Number of CPU: ${os.cpus().length}\n`;
    info += `Used memory: ${Math.round((os.totalmem() - os.freemem()) / mb)} MB\n`;
    info += `Free memory: ${Math.round(os.freemem() / mb)} MB\n`;
    info += `Total memory: ${os.totalmem() / mb} MB\n\n\n`;

    return Promise.resolve(info);
  }
}

export class ConfigurationInfoProvider implements DiagnosticInfoProvider {
  title = 'Application Configuration';
  private _configurationRegistry;

  public constructor(configurationRegistry: IConfigurationRegistry) {
    this._configurationRegistry = configurationRegistry;
  }

  async collectInfo(): Promise<string> {
    let info = '';

    const propertiesRecord = this._configurationRegistry.getConfigurationProperties();
    const properties: IConfigurationPropertyRecordedSchema[] = [];
    for (const key in propertiesRecord) {
      properties.push(propertiesRecord[key]);
    }

    const filteredProperties = properties
      .filter(property => property.scope === CONFIGURATION_DEFAULT_SCOPE && !property.hidden)
      .reduce((map, property) => {
        if (!map.has(property.parentId)) {
          map.set(property.parentId, []);
        }
        map.get(property.parentId)?.push(property);
        return map;
      }, new Map<string, IConfigurationPropertyRecordedSchema[]>());

    [...filteredProperties.keys()]
      .sort((a, b) => a.localeCompare(b))
      .forEach(property => {
        filteredProperties.get(property)?.forEach(propertyConfiguration => {
          if (propertyConfiguration.default !== undefined) {
            info += `${propertyConfiguration.title}: ${propertyConfiguration.default}\n`;
          }
        });
      });

    info += '\n\n';

    return Promise.resolve(info);
  }
}
