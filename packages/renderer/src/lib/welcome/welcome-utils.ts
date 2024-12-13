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

import { CONFIGURATION_DEFAULT_SCOPE } from '/@api/configuration/constants.js';

import { TelemetrySettings } from '../../../../main/src/plugin/telemetry/telemetry-settings';
import { WelcomeSettings } from '../../../../main/src/plugin/welcome/welcome-settings';

export class WelcomeUtils {
  async getVersion(): Promise<string | undefined> {
    return window.getConfigurationValue<string>(WelcomeSettings.SectionName + '.' + WelcomeSettings.Version);
  }

  async updateVersion(val: string): Promise<void> {
    await window.updateConfigurationValue(
      WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
      val,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }

  havePromptedForTelemetry(): Promise<boolean | undefined> {
    return window.getConfigurationValue<boolean>(TelemetrySettings.SectionName + '.' + TelemetrySettings.Check);
  }

  async setTelemetry(telemetry: boolean) {
    console.log('Telemetry enablement: ' + telemetry);

    // store if the user said yes or no to telemetry
    await window.updateConfigurationValue(
      TelemetrySettings.SectionName + '.' + TelemetrySettings.Enabled,
      telemetry,
      CONFIGURATION_DEFAULT_SCOPE,
    );

    // trigger telemetry system initialization
    if (telemetry) {
      await window.telemetryConfigure();
    }

    // save the fact that we've prompted
    await window.updateConfigurationValue(
      TelemetrySettings.SectionName + '.' + TelemetrySettings.Check,
      true,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }
}
