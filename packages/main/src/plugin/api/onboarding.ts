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

export interface OnboardingCommandResponse {
    status: "succeeded" | "failed";
    body: any;  
}

export interface OnboardingCommand {
    id: string;
    command: string;
    response: OnboardingCommandResponse;
}

export interface OnboardingCommandAtActivation {
    command: string;
    order: number;
}

export interface OnboardingSubsetTemplateColumn {
    content: string;
    layout: string;
}

export interface OnboardingSubsetGrid {
    row: number;
    columns: OnboardingSubsetTemplateColumn[];
}

export interface OnboardingSubstep {
    id: string;
    title: string;
    description: string;
    media: { path: string; altText: string };
    isSkippable: boolean;
    order: number;
    commandAtActivation: OnboardingCommandAtActivation[];
    completionEvents: string[];
    grid: OnboardingSubsetGrid[];
}

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    isSkippable: boolean;
    order: number;
    commands: OnboardingCommand[];
    substeps: OnboardingSubstep[];
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
    substep: OnboardingSubstep;
    media: { path: string; altText: string };
}

export interface OnboardingPlaceHolderStep {
    id: string;
    title: string;
    description: string;
    status: "completed" | "skipped" | "unknown";
}

export interface ActiveOnboarding {
    title: string;
    description: string;
    media: { path: string; altText: string };
    steps: OnboardingPlaceHolderStep[];
    activeStep: OnboardingActiveStep;
}