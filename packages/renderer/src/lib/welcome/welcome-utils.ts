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

import type { OnboardingInfo, ProviderInfo } from '@desktop-framework/api';
import { CONFIGURATION_DEFAULT_SCOPE } from '@desktop-framework/api/configuration';
import { TelemetrySettings } from '@desktop-framework/api/telemetry';
import { WelcomeSettings } from '@desktop-framework/api/welcome';

// Extend OnboardingInfo to have a selected and containerEngine property
export interface OnboardingInfoWithAdditionalInfo extends OnboardingInfo {
  selected?: boolean;
  containerEngine?: boolean;
}

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

  async setTelemetry(telemetry: boolean): Promise<void> {
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

  /**
   * Returns onboarding extensions sorted so that extensions with an active
   * container engine connection appear first. Each entry is enriched with
   * `selected` (default true) and `containerEngine` flags.
   *
   * Using providerInfos as well as the information we have from onboarding,
   * we will by default auto-select as well as add containerEngine to the list as true/false
   * so we can make sure that extensions with container engines are listed first.
   */
  getSortedOnboardingExtensions(
    onboardingList: OnboardingInfo[],
    providerInfos: ProviderInfo[],
  ): OnboardingInfoWithAdditionalInfo[] {
    // Get every provider that has container connections
    const connectedExtensionIds = new Set(
      providerInfos.filter(p => p.containerConnections.length > 0).map(p => p.extensionId),
    );
    return onboardingList
      .map(o => ({
        ...o,
        selected: true,
        containerEngine: connectedExtensionIds.has(o.extension),
      }))
      .toSorted((a, b) => Number(b.containerEngine) - Number(a.containerEngine)); // Sort by containerEngine (true first)
  }

  /**
   * Checks if this is the first run. Fetches the current app version,
   * and if no previous version is stored, marks it as 'initial' and
   * suppresses the release notes banner.
   * Returns the app version and whether this is the first run.
   */
  async enforceFirstRun(): Promise<{ version: string; firstRun: boolean }> {
    const version = await window.getPodmanDesktopVersion();
    const ver = await this.getVersion();
    if (!ver) {
      await this.updateVersion('initial');
      await window.updateConfigurationValue('releaseNotesBanner.show', version);
      return { version, firstRun: true };
    }
    return { version, firstRun: false };
  }
}
