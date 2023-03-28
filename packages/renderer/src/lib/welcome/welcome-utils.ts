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

import { WelcomeSettings } from '../../../../main/src/plugin/welcome/welcome-settings';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';

export class WelcomeUtils {
  async getVersion(): Promise<string> {
    return window.getConfigurationValue<string>(WelcomeSettings.SectionName + '.' + WelcomeSettings.Version);
  }

  updateVersion(val: string) {
    window.updateConfigurationValue(
      WelcomeSettings.SectionName + '.' + WelcomeSettings.Version,
      val,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }
}
