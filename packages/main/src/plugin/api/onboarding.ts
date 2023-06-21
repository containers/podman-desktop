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

export interface OnboardingInputResponse {
    stepCompleted: boolean;
}

export interface OnboardingCommandResponse {
    status: "succeeded" | "failed";
    body: any;  
}

export interface OnboardingCommand {
    id: string;
    command: string;
    response: OnboardingCommandResponse;
    args: string[];
}

export interface OnboardingCommandAtActivation {
    command: string;
    order: number;
}

export interface OnboardingViewCheckboxCardItem {
    component: "checkbox_card";
    id: string;
    title: string;
    subtitle: string;
    media: { path: string; altText: string };
    body: string;
    checkbox: string;
}

export interface OnboardingViewRadioItem {
    component: "radiogroup";
    id: string;
    options: OnboardingViewItem[];
}

export interface OnboardingViewButtonItem {
    component: "button";
    label: string;
    value: string;
    style: string;
    id: string;
}

export interface OnboardingViewTextItem {
    component: "text" | undefined;
    value: string;
    style: string;
    id: string;
}

export type OnboardingViewItem = OnboardingViewTextItem | OnboardingViewButtonItem | OnboardingViewRadioItem | OnboardingViewCheckboxCardItem;

export interface OnboardingViewRow {
    row: number;
    items: OnboardingViewItem[];
}

export interface OnboardingActiveStepView extends OnboardingStepView {
    showNext: boolean; 
}

export interface OnboardingStepView {
    id: string;
    title: string;
    description: string;
    media: { path: string; altText: string };
    isSkippable: boolean;
    order: number;
    commandAtActivation: OnboardingCommandAtActivation[];
    enableCompletionEvents: string[];
    completionEvents: string[];
    content: OnboardingViewRow[];
    when: string;
}

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    isSkippable: boolean;
    order: number;
    commands: OnboardingCommand[];
    views: OnboardingStepView[];
    media: { path: string; altText: string };
}

export interface Onboarding {
    title: string;
    description: string;
    media: { path: string; altText: string };
    steps: OnboardingStep[];
}

export interface OnboardingActiveStep {
    id: string;
    title: string;
    description: string;
    isSkippable: boolean;
    order: number;
    commands: OnboardingCommand[];
    view: OnboardingActiveStepView;
    media: { path: string; altText: string };
    context: { [key: string]: any };
}

export interface OnboardingPlaceHolderStep {
    id: string;
    title: string;
    description: string;
    status: "completed" | "skipped" | "unknown";
}

export interface ActiveOnboarding {
    extension: string;
    title: string;
    description: string;
    media: { path: string; altText: string };
    steps: OnboardingPlaceHolderStep[];
    activeStep: OnboardingActiveStep;
}