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

import * as path from 'node:path';

import { getBase64Image } from '../util.js';
import type { Onboarding, OnboardingInfo, OnboardingStatus } from './api/onboarding.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { Context } from './context/context.js';
import type { AnalyzedExtension } from './extension-loader.js';
import { Disposable } from './types/disposable.js';

export class OnboardingRegistry {
  private onboardingInfos: Map<string, OnboardingInfo> = new Map<string, OnboardingInfo>();

  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private context: Context,
  ) {}

  registerOnboarding(extension: AnalyzedExtension, onboarding: Onboarding): Disposable {
    const onInfo = this.createOnboardingInfo(extension, onboarding);
    this.onboardingInfos.set(extension.id, onInfo);

    return Disposable.create(() => {
      this.unregisterOnboarding(extension.id);
    });
  }

  unregisterOnboarding(extension: string): void {
    this.onboardingInfos.delete(extension);
  }

  getOnboarding(extension: string): OnboardingInfo | undefined {
    return this.onboardingInfos.get(extension);
  }

  createOnboardingInfo(extension: AnalyzedExtension, onboarding: Onboarding): OnboardingInfo {
    this.checkIdsReadability(extension, onboarding);
    //TODO we need to check the onboarding has a valid schema. contains atleast a step and substep
    this.convertImages(extension, onboarding);

    return {
      ...onboarding,
      extension: extension.id,
      name: extension.name,
      displayName: extension.manifest?.displayName ?? extension.name,
      description: extension.manifest?.description ?? '',
      icon: onboarding.media?.path ?? '',
    };
  }

  convertImages(extension: AnalyzedExtension, onboarding: Onboarding): void {
    if (onboarding.media?.path) {
      const base64Image = getBase64Image(path.resolve(extension.path, onboarding.media.path));
      if (base64Image) {
        onboarding.media.path = base64Image;
      }
    } else if (extension.manifest?.icon) {
      const base64Image = getBase64Image(path.resolve(extension.path, extension.manifest.icon));
      if (base64Image) {
        // if no image has been set for the onboarding, it uses the extension icon
        onboarding.media = {
          path: base64Image,
          altText: 'icon',
        };
      }
    }

    for (const step of onboarding.steps) {
      if (step.media?.path) {
        const base64Image = getBase64Image(path.resolve(extension.path, step.media.path));
        if (base64Image) {
          step.media.path = base64Image;
        }
      }
    }
  }

  listOnboarding(): OnboardingInfo[] {
    return Array.from(this.onboardingInfos.values());
  }

  updateStepState(status: OnboardingStatus, extension: string, stepId?: string): void {
    const onboarding = this.onboardingInfos.get(extension);
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

  /**
   * This function reset all the values created/updated during a previous onboarding
   *
   * @param extensions list of the extensions to reset their onboarding
   * @returns n/a
   */
  resetOnboarding(extensions: string[]): void {
    if (extensions.length === 0) {
      return;
    }
    const onboardings: OnboardingInfo[] = [];
    extensions.forEach(extension => {
      const onboarding = this.onboardingInfos.get(extension);
      if (onboarding) {
        onboardings.push(onboarding);
      }
    });
    if (onboardings.length === 0) {
      throw new Error(`No onboarding found for extensions ${extensions.join(',')}`);
    }
    const contextValues = this.context.collectAllValues();
    onboardings.forEach(onboarding => {
      // reset onboarding status
      onboarding.status = undefined;
      // reset steps status
      onboarding.steps.forEach(step => {
        step.status = undefined;
      });
      // remove context key added during the onboarding
      for (const key in contextValues) {
        if (key.startsWith(`${onboarding.extension}.onboarding`)) {
          this.context.removeValue(key, true);
        }
      }
    });
  }

  /**
   * checkIdsReadibility checks that the IDs of the steps of the onboarding
   * respect specific rules, so they are easily readable in Telemetry.
   *
   * In case of a rule not respected, a warning is displayed in the console.
   */
  checkIdsReadability(extension: AnalyzedExtension, onboarding: Onboarding): void {
    const warn = (msg: string): void => {
      console.warn(`[${extension.id}]: ${msg}`);
    };
    onboarding.steps.forEach(step => {
      const id = step.id;
      const isCommand = !!step.command || !!step.component;
      const isFailedState = step.state === 'failed';
      const isCompletedState = step.state === 'completed';
      if (isCommand && !id.endsWith('Command')) {
        warn(`Missing suffix 'Command' for the step '${id}' that defines a command`);
      }
      if (isFailedState && !id.endsWith('Failure')) {
        warn(`Missing suffix 'Failure' for the step '${id}' that has a 'failed' state`);
      }
      if (isCompletedState && !id.endsWith('Success')) {
        warn(`Missing suffix 'Success' for the step '${id}' that has a 'completed' state`);
      }
      if (!isCommand && !isFailedState && !isCompletedState && !id.endsWith('View')) {
        warn(`Missing suffix 'View' for the step '${id}' that is neither a Command, Failure or Success step`);
      }
    });
  }
}
