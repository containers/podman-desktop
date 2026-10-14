/**********************************************************************
 * Copyright (C) 2022-2025 Red Hat, Inc.
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

import {
  IconsContributionSchema,
  MenuSchema,
  OnboardingSchema,
  RawThemeContributionSchema,
  ViewContributionSchema,
} from '@desktop-framework/api';
import { IConfigurationNodeSchema } from '@desktop-framework/api/configuration';
import { z } from 'zod';

import { RawCommandSchema } from '/@/plugin/command-registry.js';

const ExtensionRepositorySchema = z.union([
  z.string(),
  z.object({
    type: z.string(),
    url: z.string(),
    directory: z.string().optional(),
  }),
]);

export const ExtensionManifestSchema = z
  .object({
    name: z.string(),
    displayName: z.string(),
    version: z.string(),
    publisher: z.string(),
    description: z.string(),
    main: z.string().optional(),
    icon: z.union([z.string(), z.object({ light: z.string(), dark: z.string() })]).optional(),
    repository: ExtensionRepositorySchema.optional(),
    homepage: z.string().optional(),
    extensionDependencies: z.array(z.string()).optional(),
    extensionPack: z.array(z.string()).optional(),
    engines: z
      .object({
        'podman-desktop': z.string().optional(),
      })
      .optional(),
    contributes: z
      .object({
        configuration: IConfigurationNodeSchema.omit({ id: true }).optional(),
        commands: z.array(RawCommandSchema).optional(),
        menus: z.record(z.string(), z.array(MenuSchema)).optional(),
        icons: IconsContributionSchema.optional(),
        themes: z.array(RawThemeContributionSchema).optional(),
        views: z.record(z.string(), z.array(ViewContributionSchema)).optional(),
        onboarding: OnboardingSchema.optional(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .loose();

export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;
