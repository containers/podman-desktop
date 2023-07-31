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
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as path from 'path';
import type { Onboarding, OnboardingInfo, OnboardingStatus } from './api/onboarding.js';
import type { CommandRegistry } from './command-registry.js';
import type { ApiSenderType } from './api.js';
import type { AnalyzedExtension } from './extension-loader.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { getBase64Image } from '../util.js';
import type { Context } from './context/context.js';

export class OnboardingRegistry {
  private onboardingInfos: OnboardingInfo[] = [];

  constructor(
    private apiSender: ApiSenderType,
    private commandRegistry: CommandRegistry,
    private configurationRegistry: ConfigurationRegistry,
    private context: Context,
  ) {}

  registerOnboarding(extension: AnalyzedExtension, onboarding: Onboarding): void {
    const onInfo = this.createOnboardingInfo(extension, onboarding);
    this.onboardingInfos.push(onInfo);
  }

  unregisterOnboarding(extension: string): void {
    this.onboardingInfos = this.onboardingInfos.filter(onboarding => onboarding.extension !== extension);
  }

  getOnboarding(extension: string): OnboardingInfo | undefined {
    const isOnboardingEnabled = this.configurationRegistry.getConfiguration('experimental').get('onboarding');
    if (isOnboardingEnabled) {
      return this.onboardingInfos.find(onboarding => onboarding.extension === extension);
    }
    return undefined;
  }

  createOnboardingInfo(extension: AnalyzedExtension, onboarding: Onboarding): OnboardingInfo {
    //TODO we need to check the onboarding has a valid schema. contains atleast a step and substep
    this.convertImages(extension.path, onboarding);
    return {
      ...onboarding,
      extension: extension.id,
    };
  }

  convertImages(rootPath: string, onboarding: Onboarding) {
    if (onboarding.media?.path) {
      onboarding.media.path = getBase64Image(path.resolve(rootPath, onboarding.media.path));
    }

    for (const step of onboarding.steps) {
      if (step.media?.path) {
        step.media.path = getBase64Image(path.resolve(rootPath, step.media.path));
      }
    }
  }

  listOnboarding(): OnboardingInfo[] {
    return this.onboardingInfos;
  }

  updateStepState(status: OnboardingStatus, extension: string, stepId?: string): void {
    const onboarding = this.onboardingInfos.find(onboarding => onboarding.extension === extension);
    if (!onboarding) {
      throw new Error(`No onboarding for extension ${extension}`);
    }
    if (stepId) {
      const step = onboarding.steps.find(step => step.id === stepId);
      if (!step) {
        throw new Error(`No onboarding step with id ${stepId} for extension ${extension}`);
      }
      step.status = status;
    } else {
      onboarding.status = status;
    }
  }

  resetOnboarding(extensions: string[]): void {
    if (extensions.length === 0) {
      return;
    }
    const onboardings = this.onboardingInfos.filter(onboarding =>
      extensions.find(extension => onboarding.extension === extension),
    );
    if (onboardings.length === 0) {
      throw new Error(`No onboarding found for extensions ${extensions.join(',')}`);
    }
    onboardings.forEach(onboarding => {
      onboarding.status = undefined;
      onboarding.steps.forEach(step => {
        step.status = undefined;
      });
    });
    const contextValues = this.context.collectAllValues();
    for (const key in contextValues) {
      if (key.startsWith('onboarding.')) {
        this.context.removeValue(key, true);
      }
    }
  }
}
