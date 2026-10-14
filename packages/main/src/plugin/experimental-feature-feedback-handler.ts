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

import type { IDisposable } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { shell } from 'electron';
import { inject, injectable } from 'inversify';

import { formatName } from '/@/util.js';

import { ConfigurationRegistry } from './configuration-registry.js';
import { MessageBox } from './message-box.js';
import { Telemetry } from './telemetry/telemetry.js';

export type Timestamp = number | undefined;

export interface ExperimentalConfiguration {
  remindAt: Timestamp;
  disabled: boolean;
}

type RemindOption = 'Remind me tomorrow' | 'Remind me in 2 days' | `Don't show again`;
const DAYS_TO_MS = 24 * 60 * 60 * 1_000;

@injectable()
export class ExperimentalFeatureFeedbackHandler {
  #disposables: IDisposable[] = [];
  protected experimentalFeatures: Map<string, ExperimentalConfiguration> = new Map();
  readonly #configurationRegistry: IConfigurationRegistry;
  constructor(
    @inject(ConfigurationRegistry)
    private configurationRegistry: ConfigurationRegistry,
    @inject(MessageBox)
    private messageBox: MessageBox,
    @inject(Telemetry)
    private telemetry: Telemetry,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
  ) {
    this.#configurationRegistry = this.configurationRegistry;
  }

  protected async save(key: string): Promise<void> {
    // If conf does not exist, the feature is not enabled
    const conf = this.experimentalFeatures.get(key);
    const parts = key.split('.');
    const firstPart = parts[0];
    const secondPart = parts[1];
    const configuration = this.#configurationRegistry.getConfiguration(firstPart);
    if (secondPart) {
      await configuration?.update(secondPart, conf);
    }
  }

  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
    this.#disposables = [];
  }

  async init(): Promise<void> {
    const feedbackConfiguration: IConfigurationNode = {
      id: 'preferences.feedback',
      title: 'Feedback reminder',
      type: 'object',
      properties: {
        ['feedback.dialog']: {
          description: 'Show periodic feedback reminder for experimental features',
          type: 'boolean',
          default: true,
        },
      },
    };

    this.#disposables.push(this.configurationRegistry.registerConfigurations([feedbackConfiguration]));

    const configurationProperties = this.#configurationRegistry.getConfigurationProperties();
    for (const configurationKey in configurationProperties) {
      if (!configurationProperties[configurationKey]?.experimental?.githubDiscussionLink) {
        continue;
      }

      // Get configuration from settings.json
      const parts = configurationKey.split('.');
      const firstPart = parts[0];
      const secondPart = parts[1];
      if (!secondPart) continue;

      const conf = this.#configurationRegistry.getConfiguration(firstPart).get(secondPart);
      // Configuration does not exist (feature is not enabled), or is set to false
      if (!conf) {
        continue;
      }

      let optionDisabled = false;
      let optionRemindAt: Timestamp = undefined;
      if (typeof conf === 'object' && 'disabled' in conf && 'remindAt' in conf) {
        if (typeof conf.disabled === 'boolean') optionDisabled = conf.disabled;
        if (typeof conf.remindAt === 'number') optionRemindAt = conf.remindAt;
      }

      if (optionRemindAt) {
        const configuration: ExperimentalConfiguration = {
          remindAt: optionRemindAt,
          disabled: optionDisabled,
        };

        this.experimentalFeatures.set(configurationKey, configuration);
      } else {
        // when started for first time, we need to set the timetamps for each experimental feature
        this.setReminder(configurationKey);
      }
    }
    // The dialog is drawn by the renderer, and the renderer only mounts
    // <MessageBox /> once it has received 'starting-extensions'. Showing it from
    // here fires the event while nothing is listening, which is why the dialog
    // was never seen. Waiting for 'extensions-started' means the renderer has
    // been up long enough to have mounted it.
    this.#disposables.push(
      this.apiSender.receive('extensions-started', () => {
        this.showFeedbackDialog().catch((err: unknown) =>
          console.error('Unable to show the experimental feature feedback dialog', err),
        );
      }),
    );
  }

  /**
   * Updates timestamp for given experimental feature
   * @param feature in format feature.name
   * @param days timeout in days, undefined -> disabled, 'disabled' -> "Don't show again" was selected
   */
  protected setTimestamp(feature: string, days: Timestamp): void {
    let date: Timestamp = days;
    if (typeof days === 'number') {
      date = new Date(new Date().getTime() + days * DAYS_TO_MS).getTime();
    }
    // update configuration
    const conf = this.experimentalFeatures.get(feature);
    this.experimentalFeatures.set(feature, { remindAt: date, disabled: conf ? conf.disabled : false });
    this.save(feature).catch((e: unknown) =>
      console.error(`Got error when saving timestamps for experimental features: ${e}`),
    );
  }

  /**
   * Decides which value should be used for setting timestamp of given feature
   * @param configurationName in format feature.name
   */
  protected setReminder(configurationName: string): void {
    const splittedName = configurationName.split('.');
    if (splittedName.length >= 2 && splittedName[1]) {
      const configurationValue = this.#configurationRegistry.getConfiguration(splittedName[0]).get(splittedName[1]);
      if (configurationValue) this.setTimestamp(configurationName, 2);
      else this.setTimestamp(configurationName, undefined);
    }
  }

  /**
   * Disables feedback for feature by adding it to list of disabled features
   * @param id in format feature.name
   */
  protected disableFeature(id: string): void {
    const conf = this.experimentalFeatures.get(id);
    if (conf) {
      this.experimentalFeatures.set(id, { ...conf, disabled: true });
      this.save(id).catch((e: unknown) =>
        console.error(`Got error when saving timestamps for experimental features: ${e}`),
      );
    }
  }

  /**
   * Goes through each enabled experimental feature and shows dialog if current timestamp is greater than stored value
   */
  protected async showFeedbackDialog(): Promise<void> {
    const configurationProperties = this.#configurationRegistry.getConfigurationProperties();
    const feedbackEnabled = this.#configurationRegistry.getConfiguration('feedback').get<boolean>('dialog', true);
    if (!feedbackEnabled) {
      return;
    }

    // Go through all experimental features (in this point we should have all properties set)
    for (const [key, configuration] of this.experimentalFeatures) {
      const featureGitHubLink = configurationProperties[key]?.experimental?.githubDiscussionLink;
      // If the feature does not have a link or the dialog is disabled
      if (!featureGitHubLink || configuration.disabled) continue;

      // Compare timestamp of each experimental feature
      const date = new Date();
      if (configuration.remindAt && configuration.remindAt > date.getTime()) continue;
      const featureName = formatName(key);

      let footerMarkdownDescription: string = `:button[fa-thumbs-up]{command=openExternal args='["${featureGitHubLink}"]'} :button[fa-thumbs-down]{command=openExternal args='["${featureGitHubLink}"]'}`;

      const image = configurationProperties[key]?.experimental?.image;
      if (image) {
        footerMarkdownDescription = `:image[${featureName}]{src="${configurationProperties[key]?.experimental?.image}" title="${featureName}"}`;
      }
      const options: RemindOption[] = ['Remind me tomorrow', 'Remind me in 2 days', `Don't show again`];

      this.messageBox
        .showMessageBox({
          title: 'Share Feedback',
          message: `We are testing something new!\n\nHow's your experience so far with [${featureName}](${featureGitHubLink})? Let us know on GitHub!`,
          type: 'info',
          buttons: [
            {
              heading: 'Remind me later',
              buttons: options,
              type: 'dropdownButton',
            },
            {
              label: 'Share Feedback on GitHub',
              icon: 'fas fa-arrow-up-right-from-square',
              type: 'iconButton',
            },
          ],
          defaultId: 1,
          footerMarkdownDescription: footerMarkdownDescription,
        })
        .then(async response => {
          if (response) {
            const telemetryOptions = { option: 'Share Feedback on GitHub' };
            if (response.response === 'Share Feedback on GitHub') {
              await shell.openExternal(featureGitHubLink);
              this.setTimestamp(key, undefined);
            } else if (response.response === 'Remind me later' && typeof response.dropdownIndex === 'number') {
              telemetryOptions.option = options[response.dropdownIndex] ?? 'Unknown option';
              switch (options[response.dropdownIndex]) {
                case 'Remind me tomorrow':
                  this.setTimestamp(key, 1);
                  break;
                case 'Remind me in 2 days':
                  this.setTimestamp(key, 2);
                  break;
                case `Don't show again`:
                default:
                  this.disableFeature(key);
              }
            }
            this.telemetry.track('experimentalFeatureFeedback', telemetryOptions);
          }
        })
        .catch(console.error);
    }
  }
}
