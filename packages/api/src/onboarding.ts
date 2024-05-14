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

export interface OnboardingStepItem {
  value: string;
  highlight?: boolean;
  when?: string;
}

export type OnboardingStatus = 'completed' | 'failed' | 'skipped';
export type OnboardingState = 'completed' | 'failed';
export type OnboardingEmbeddedComponentType =
  | 'createContainerProviderConnection'
  | 'createKubernetesProviderConnection';

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  media?: { path: string; altText: string };
  command?: string;
  completionEvents?: string[];
  content?: OnboardingStepItem[][];
  component?: OnboardingEmbeddedComponentType;
  when?: string;
  status?: OnboardingStatus;
  state?: OnboardingState;
}

export interface Onboarding {
  title: string;
  description?: string;
  media?: { path: string; altText: string };
  steps: OnboardingStep[];
  enablement: string;
}

export interface OnboardingInfo extends Onboarding {
  extension: string;
  name: string;
  displayName: string;
  icon: string;
  status?: OnboardingStatus;
}
