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

export interface OnboardingCommandResponse {
  status: 'succeeded' | 'failed';
  body: any;
}

export interface OnboardingCommand {
  id: string;
  command: string;
  response?: { [key: string]: any };
  args: string[];
}

export interface OnboardingCommandAtActivation {
  command: string;
}

export interface OnboardingBaseItem {
  id: string;
  template?: 'dark_bg';
}

export interface OnboardingViewButtonItem extends OnboardingBaseItem {
  component: 'button';
  label: string;
  command: string;
}

export interface OnboardingViewTextItem extends OnboardingBaseItem {
  component: 'text';
  value: string;
}

export type OnboardingViewItem = OnboardingViewTextItem | OnboardingViewButtonItem;

export type OnboardingStepStatus = 'completed' | 'failed' | 'skipped';

export interface OnboardingStepView {
  id: string;
  title: string;
  description: string;
  media: { path: string; altText: string };
  commandAtActivation: OnboardingCommandAtActivation[];
  enableCompletionEvents: string[];
  completionEvents: string[];
  content: OnboardingViewItem[][];
  when: string;
  status?: OnboardingStepStatus;
  showNext?: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  commands: OnboardingCommand[];
  views: OnboardingStepView[];
  media: { path: string; altText: string };
  status?: OnboardingStepStatus;
}

export interface Onboarding {
  title: string;
  description?: string;
  media?: { path: string; altText: string };
  steps: OnboardingStep[];
}

export interface OnboardingInfo extends Onboarding {
  extension: string;
}
