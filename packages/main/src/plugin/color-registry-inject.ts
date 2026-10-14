/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { inject, injectable } from 'inversify';

import { ColorRegistry } from './color-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';

/**
 * ColorRegistry is used by storybook to inject colors into the frontend with a script.
 * but tsx does not support decorators, so provide the injectable stuff in a separated object.
 */
@injectable()
export class InjectableColorRegistry extends ColorRegistry {
  constructor(
    @inject(ApiSenderType) apiSender: ApiSenderType,
    @inject(ConfigurationRegistry) configurationRegistry: ConfigurationRegistry,
  ) {
    super(apiSender, configurationRegistry);
  }
}
