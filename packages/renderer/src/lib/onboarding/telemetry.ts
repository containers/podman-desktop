/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

export interface OnboardingTelemetryStep {
  id: string;
  title: string;
  durationMs: number;
  error: undefined | string;
}

type StepTeletetryData = { count: number; durationMs: number[]; errors: string[] };

export interface OnboardingTelemetryData {
  extension: string;
  skipped: boolean;
  steps: OnboardingTelemetryStep[];
  stepsDetails?: { [key: string]: StepTeletetryData };
  durationMs: number;
  skipAtStep?: string;
  errors?: string[];
}

export class OnboardingTelemetrySession {
  private data: OnboardingTelemetryData;
  private onboardingStartTime: number;
  private stepStartTime: number;
  private previousStepIndex: number;
  private previousStepId: string;

  constructor() {
    this.data = {
      extension: '',
      skipped: false,
      steps: [],
      durationMs: 0,
    };
    this.onboardingStartTime = performance.now();
    this.stepStartTime = performance.now();
    this.previousStepIndex = -1;
    this.previousStepId = '';
  }

  restart() {
    this.onboardingStartTime = performance.now();
    this.stepStartTime = performance.now();
    this.previousStepIndex = -1;
  }

  startStep(i: number, id: string, title: string) {
    if (id === this.previousStepId) {
      return;
    }
    if (this.previousStepIndex >= 0) {
      this.savePreviousDuration();
    }
    this.previousStepIndex = i;
    this.previousStepId = id;
    this.data = telemetryAddStep(this.data, i, id, title);
  }

  setStepError(i: number, id: string, error: Error) {
    this.data = telemetrySetStepError(this.data, i, id, error);
  }

  send(extensionName: string, skipped: boolean) {
    this.savePreviousDuration();
    this.data.extension = extensionName;
    this.data.skipped = skipped;
    this.data.durationMs = Math.round(performance.now() - this.onboardingStartTime);
    window
      .telemetryTrack('onboarding', telemetryToSend(this.data))
      .catch((err: unknown) => console.error(`Error sending onboarding telemetry`, err));
  }

  private savePreviousDuration() {
    const endTime = performance.now();
    try {
      const duration = Math.round(endTime - this.stepStartTime);
      this.data = telemetrySetStepDuration(this.data, this.previousStepIndex, this.previousStepId, duration);
    } catch {
      // should not happen, as we should have added the step before
      console.error('no step in telemetry');
    }
    this.stepStartTime = endTime;
  }
}

function telemetryAddStep(
  data: OnboardingTelemetryData,
  i: number,
  id: string,
  title: string,
): OnboardingTelemetryData {
  const completeId = getStepCompleteId(i, id);
  data.steps.push({ id: completeId, title, durationMs: 0, error: undefined });
  return data;
}

function telemetrySetStepDuration(
  data: OnboardingTelemetryData,
  i: number,
  stepId: string,
  ms: number,
): OnboardingTelemetryData {
  const completeId = getStepCompleteId(i, stepId);
  const stepIndex = data.steps.findLastIndex(step => step.id === completeId);
  if (stepIndex < 0) {
    return data;
  }
  data.steps[stepIndex].durationMs = ms;
  return data;
}

function telemetrySetStepError(
  data: OnboardingTelemetryData,
  i: number,
  stepId: string,
  error: Error,
): OnboardingTelemetryData {
  const completeId = getStepCompleteId(i, stepId);
  const stepIndex = data.steps.findLastIndex(step => step.id === completeId);
  if (stepIndex < 0) {
    return data;
  }
  data.steps[stepIndex].error = String(error);
  return data;
}

function telemetryToSend(data: OnboardingTelemetryData) {
  if (data.skipped) {
    data.skipAtStep = data.steps[data.steps.length - 1].id;
  }
  data.stepsDetails = {};
  data.errors = [];
  for (const element of data.steps) {
    const step = element;
    if (!data.stepsDetails[step.id]) {
      data.stepsDetails[step.id] = {
        count: 0,
        durationMs: [],
        errors: [],
      };
    }
    data.stepsDetails[step.id].count++;
    data.stepsDetails[step.id].durationMs.push(step.durationMs);
    if (step.error) {
      data.stepsDetails[step.id].errors.push(step.error);
      data.errors.push(`${step.error} [${step.title}]`);
    }
  }
  return data;
}

function getStepCompleteId(i: number, stepId: string): string {
  return String(i).padStart(2, '0') + '_' + stepId;
}
