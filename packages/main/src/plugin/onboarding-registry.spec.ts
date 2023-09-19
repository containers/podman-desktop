/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { beforeEach, expect, expectTypeOf, test, vi } from 'vitest';
import { OnboardingRegistry } from './onboarding-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { AnalyzedExtension } from './extension-loader.js';
import * as fs from 'node:fs';
import { Context } from './context/context.js';
import type { ApiSenderType } from './api.js';
import type { Disposable } from './types/disposable.js';

let onboardingRegistry: OnboardingRegistry;
const extensionId = 'myextension.id';
const stepId = 'checkPodmanInstalled';

const getConfigMock = vi.fn();
const getConfigurationMock = vi.fn();
getConfigurationMock.mockReturnValue({
  get: getConfigMock,
});
const configurationRegistry = {
  registerConfigurations: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
  getConfiguration: getConfigurationMock,
} as unknown as ConfigurationRegistry;

const readFileSync = vi.spyOn(fs, 'readFileSync');
const bufferFrom = vi.spyOn(Buffer, 'from');
const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;
const context = new Context(apiSender);

let registerOnboardingDisposable: Disposable;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  vi.clearAllMocks();
  onboardingRegistry = new OnboardingRegistry(configurationRegistry, context);
  const manifest = {
    contributes: {
      onboarding: {
        title: 'Get started with Podman Desktop',
        steps: [
          {
            id: 'checkPodmanInstalled',
            label: 'Check Podman',
            title: 'Checking for Podman installation',
            command: 'podman.onboarding.checkPodmanInstalled',
            completionEvents: ['onCommand:podman.onboarding.checkPodmanInstalled'],
          },
        ],
      },
    },
  };

  const extensionPath = '/root/path';
  const extension = {
    path: extensionPath,
    id: extensionId,
  } as AnalyzedExtension;
  registerOnboardingDisposable = onboardingRegistry.registerOnboarding(extension, manifest.contributes.onboarding);
  getConfigMock.mockReturnValue(true);

  vi.mock('node:fs');
  readFileSync.mockReturnValue(JSON.stringify({}));
  bufferFrom.mockReturnValue(Buffer.from(''));
});

test('Should return no onboarding if experimental onboarding setting is disabled', async () => {
  getConfigMock.mockReturnValue(false);
  const onbording = onboardingRegistry.getOnboarding(extensionId);
  expect(onbording).toBe(undefined);
});

test('Should return no onboarding for unknown extension', async () => {
  const onbording = onboardingRegistry.getOnboarding('unknown');
  expect(onbording).toBe(undefined);
});

test('Should onboarding for known extension', async () => {
  const onbording = onboardingRegistry.getOnboarding(extensionId);
  expect(onbording).toBeDefined();
  expect(onbording?.title).toBe('Get started with Podman Desktop');
});

test('Should not find onboarding after dispose', async () => {
  registerOnboardingDisposable.dispose();
  const onbording = onboardingRegistry.getOnboarding(extensionId);
  expect(onbording).toBe(undefined);
});

test('Should not find onboarding after unregistered', async () => {
  onboardingRegistry.unregisterOnboarding(extensionId);
  const onbording = onboardingRegistry.getOnboarding(extensionId);
  expect(onbording).toBe(undefined);
});

test('Should return list of registered onboarding', async () => {
  const onboarding = onboardingRegistry.listOnboarding();
  expect(onboarding).toBeDefined();
  expectTypeOf(onboarding).toBeArray();
  expect(onboarding.length).toBe(1);
  expect(onboarding[0].title).toBe('Get started with Podman Desktop');
});

test('Should update state of step', async () => {
  onboardingRegistry.updateStepState('completed', extensionId, stepId);
  const onboarding = onboardingRegistry.getOnboarding(extensionId);
  expect(onboarding).toBeDefined();
  expect(onboarding?.steps[0].status).toBeDefined();
  expect(onboarding?.steps[0].status).toBe('completed');
});

test('Should update state of onboarding', async () => {
  onboardingRegistry.updateStepState('completed', extensionId);
  const onboarding = onboardingRegistry.getOnboarding(extensionId);
  expect(onboarding).toBeDefined();
  expect(onboarding?.status).toBeDefined();
  expect(onboarding?.status).toBe('completed');
});

test('Should throw if no onboarding for that extension', async () => {
  expect(() => onboardingRegistry.updateStepState('completed', 'unknown', stepId)).toThrowError(
    'No onboarding for extension unknown',
  );
});

test('Should throw if no step in onboarding for that extension', async () => {
  expect(() => onboardingRegistry.updateStepState('completed', extensionId, 'unknown')).toThrowError(
    `No onboarding step with id unknown for extension ${extensionId}`,
  );
});

test('Should reset all states', async () => {
  // update state so they are not undefined
  const contextKey = `${extensionId}.onboarding.test`;
  context.setValue(contextKey, 'test');
  onboardingRegistry.updateStepState('completed', extensionId);
  onboardingRegistry.updateStepState('completed', extensionId, stepId);
  let onboarding = onboardingRegistry.getOnboarding(extensionId);
  // verify update went well
  expect(onboarding).toBeDefined();
  expect(onboarding?.status).toBeDefined();
  expect(onboarding?.status).toBe('completed');
  expect(onboarding?.steps[0].status).toBeDefined();
  expect(onboarding?.steps[0].status).toBe('completed');
  expect(context.getValue(contextKey)).toBe('test');
  // reset all states
  onboardingRegistry.resetOnboarding([extensionId]);
  // check states have been reset
  onboarding = onboardingRegistry.getOnboarding(extensionId);
  expect(onboarding).toBeDefined();
  expect(onboarding?.status).toBe(undefined);
  expect(onboarding?.steps[0].status).toBe(undefined);
  expect('test' in context.collectAllValues()).toBe(false);
});

test('Should throw if no onboarding for that extension', async () => {
  expect(() => onboardingRegistry.resetOnboarding(['unknown'])).toThrowError(
    'No onboarding found for extensions unknown',
  );
});
