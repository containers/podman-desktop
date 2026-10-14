/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type {
  Configuration,
  ConfigurationChangeEvent,
  ConfigurationScope as PodmanDesktopApiConfigurationScope,
} from '@desktop-framework/extension-api';
import { z } from 'zod';

import type { IDisposable } from '/@/disposable.js';
import type { Event } from '/@/event.js';

const IExperimentalConfigurationSchema = z.object({
  // href to the discussion
  githubDiscussionLink: z.string().optional(),
  // path to image or gif
  image: z.string().optional(),
});

const IConfigurationPropertySchemaTypeSchema = z.enum([
  'markdown',
  'string',
  'number',
  'integer',
  'boolean',
  'null',
  'array',
  'object',
]);

export interface IConfigurationChangeEvent {
  key: string;
  value: unknown;
  scope: PodmanDesktopApiConfigurationScope;
}

const ConfigurationScopeSchema = z.enum([
  'DEFAULT',
  'ContainerConnection',
  'KubernetesConnection',
  'VmConnection',
  'ContainerProviderConnectionFactory',
  'KubernetesProviderConnectionFactory',
  'VmProviderConnectionFactory',
  'DockerCompatibility',
  'Onboarding',
]);

export type ConfigurationScope = z.output<typeof ConfigurationScopeSchema>;

const IConfigurationPropertySchemaSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().trim().min(1).regex(/\S/).optional(),
  type: z.union([IConfigurationPropertySchemaTypeSchema, z.array(IConfigurationPropertySchemaTypeSchema)]).optional(),
  default: z.unknown().optional(),
  group: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  markdownDescription: z.string().optional(),
  minimum: z.number().optional(),
  maximum: z.union([z.number(), z.string()]).optional(),
  format: z.string().optional(),
  step: z.number().optional(),
  scope: z.union([ConfigurationScopeSchema, z.array(ConfigurationScopeSchema)]).optional(),
  readonly: z.boolean().optional(),
  // if hidden is true, the property is not shown in the preferences page. It may still appear in other locations if it uses other scope (like onboarding)
  hidden: z.boolean().optional(),
  enum: z.array(z.string()).optional(),
  when: z.string().optional(),
  experimental: IExperimentalConfigurationSchema.optional(),
});

export type IConfigurationPropertySchema = z.output<typeof IConfigurationPropertySchemaSchema>;

const IConfigurationExtensionInfoSchema = z.object({
  id: z.string(),
});

export const IConfigurationPropertyRecordedSchemaSchema = IConfigurationPropertySchemaSchema.extend({
  title: z.string(),
  parentId: z.string(),
  extension: IConfigurationExtensionInfoSchema.optional(),
  // indicates if this configuration value is locked by system management (managed-by profile)
  locked: z.boolean().optional(),
});

export type IConfigurationPropertyRecordedSchema = z.output<typeof IConfigurationPropertyRecordedSchemaSchema>;

export const IConfigurationNodeSchema = z.object({
  id: z.string(),
  type: z.union([z.string(), z.array(z.string())]).optional(),
  title: z.string(),
  description: z.string().optional(),
  properties: z.record(z.string(), IConfigurationPropertySchemaSchema).optional(),
  scope: ConfigurationScopeSchema.optional(),
  extension: IConfigurationExtensionInfoSchema.optional(),
});

export type IConfigurationNode = z.output<typeof IConfigurationNodeSchema>;

export const IConfigurationRegistry = Symbol.for('IConfigurationRegistry');
export interface IConfigurationRegistry {
  registerConfigurations(configurations: IConfigurationNode[]): IDisposable;
  deregisterConfigurations(configurations: IConfigurationNode[]): void;
  updateConfigurations(configurations: { add: IConfigurationNode[]; remove: IConfigurationNode[] }): void;
  readonly onDidUpdateConfiguration: Event<{ properties: string[] }>;
  readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
  readonly onDidChangeConfigurationAPI: Event<ConfigurationChangeEvent>;
  getConfigurationProperties(): Record<string, IConfigurationPropertyRecordedSchema>;
  getConfiguration(section?: string, scope?: PodmanDesktopApiConfigurationScope): Configuration;
  updateConfigurationValue(
    key: string,
    value: unknown,
    scope?: PodmanDesktopApiConfigurationScope | PodmanDesktopApiConfigurationScope[],
  ): Promise<void>;
}
