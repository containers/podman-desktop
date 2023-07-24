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
import * as fs from 'fs';
import type { Onboarding, OnboardingInfo } from './api/onboarding.js';
import type { CommandRegistry } from './command-registry.js';
import type { ApiSenderType } from './api.js';
import type { AnalyzedExtension } from './extension-loader.js';
import { ConfigurationRegistry } from './configuration-registry.js';

export class OnboardingRegistry {
  private onboardingInfos: OnboardingInfo[] = [];

  constructor(private apiSender: ApiSenderType, private commandRegistry: CommandRegistry, private configurationRegistry: ConfigurationRegistry) {}

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
      onboarding.media.path = this.getBase64Image(rootPath, onboarding.media.path);
    }

    for (const step of onboarding.steps) {
      if (step.media?.path) {
        step.media.path = this.getBase64Image(rootPath, step.media.path);
      }
      for (const view of step.views) {
        if (view.media?.path) {
          view.media.path = this.getBase64Image(rootPath, view.media.path);
        }
      }
    }
  }

  // Return the base64 of the file
  getBase64Image(rootPath: string, file: string): string {
    try {
      const imageContent = fs.readFileSync(path.resolve(rootPath, file));
      // convert to base64
      const base64Content = Buffer.from(imageContent).toString('base64');
      // create base64 image content
      return `data:image/png;base64,${base64Content}`;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  listOnboarding(): OnboardingInfo[] {
    return this.onboardingInfos;
  }

  async executeOnboardingCommand(extension: string, stepId: string, commandId: string, args?: any[]): Promise<void> {
    const onboarding = this.onboardingInfos.find(onboarding => onboarding.extension === extension);
    if (onboarding) {
      const step = onboarding.steps.find(step => step.id === stepId);
      if (step) {
        const commandToExecute = step.commands.find(cmd => cmd.id === commandId);
        if (commandToExecute) {
          try {
            const response = await this.commandRegistry.executeCommand<{ [key: string]: any }>(
              commandToExecute?.command,
              args,
            );
            this.apiSender.send('onboarding:command-executed', {
              command: commandId,
              status: 'succeeded',
              body: response,
            });
          } catch (e) {
            this.apiSender.send('onboarding:command-executed', {
              command: commandId,
              status: 'failed',
              body: {
                error: e,
              },
            });
          }
          return;
        }
      }
    }
    this.apiSender.send('onboarding:command-executed', {
      command: commandId,
      status: 'failed',
      body: {
        error: 'Unable to execute the command',
      },
    });
  }
}
