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
import '@testing-library/jest-dom/vitest';

import { beforeAll, expect, test, vi } from 'vitest';

import type { OnboardingInfo, OnboardingStep } from '/@api/onboarding';

import { ContextUI } from '../context/context';
import { ContextKeyExpr, type ContextKeyExpression } from '../context/contextKey';
import {
  type ActiveOnboardingStep,
  cleanSetup,
  isOnboardingCompleted,
  isOnboardingsSetupCompleted,
  isStepCompleted,
  normalizeOnboardingWhenClause,
  replaceContextKeyPlaceholders,
  replaceContextKeyPlaceHoldersByRegex,
  updateOnboardingStepStatus,
} from './onboarding-utils';

const deserialize = vi.fn();

// fake the window.events object
beforeAll(() => {
  const resetOnboarding = vi.fn();
  Object.defineProperty(window, 'resetOnboarding', { value: resetOnboarding });
  const updateStepState = vi.fn();
  Object.defineProperty(window, 'updateStepState', { value: updateStepState });
  Object.defineProperty(ContextKeyExpr, 'deserialize', { value: deserialize });
});

test('Expect to have the when clause normalized if contains an onboardingContext value', async () => {
  const when = 'onboardingContext:engine.podmanMachineCreated';
  const normalized = normalizeOnboardingWhenClause(when, 'podman');
  expect(normalized).equal('podman.onboarding.engine.podmanMachineCreated');
});

test('Expect to have the when clause normalized if contains more than one onboardingContext value', async () => {
  const when = 'onboardingContext:engine.podmanMachineCreated && onboardingContext:engine.podmanMachineStarted';
  const normalized = normalizeOnboardingWhenClause(when, 'podman');
  expect(normalized).equal(
    'podman.onboarding.engine.podmanMachineCreated && podman.onboarding.engine.podmanMachineStarted',
  );
});

test('Expect to have the when clause returned in its original form if it does not contain any onboardingContext value', async () => {
  const when = '!isLinux';
  const normalized = normalizeOnboardingWhenClause(when, 'podman');
  expect(normalized).equal('!isLinux');
});

test('Expect cleanContext to remove onboarding values from context and reset the state of all steps', async () => {
  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'completed',
      },
    ],
    title: 'onboarding',
    status: 'completed',
    enablement: 'true',
  };
  const context = new ContextUI();
  context.setValue('id.onboarding.key1', 'value');
  context.setValue('id.onboarding.key2', 'value');

  await cleanSetup([onboarding], context);

  expect(onboarding.status).toBeUndefined();
  expect(onboarding.steps[0].status).toBeUndefined();
  expect(onboarding.steps[1].status).toBeUndefined();
  const contextValues = context.collectAllValues();
  expect(Object.keys(contextValues).length).toBe(0);
});

test('Expect that the onboarding is not completed if atleast one step has not been completed', async () => {
  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: 'skipped',
    enablement: 'true',
  };
  const complete = isOnboardingCompleted(onboarding);
  expect(complete).toBeFalsy();
});

test('Expect that the onboarding is not completed if its status is not set', async () => {
  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'skipped',
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const complete = isOnboardingCompleted(onboarding);
  expect(complete).toBeFalsy();
});

test('Expect that the onboarding is completed if all its steps are completed and its status is set', async () => {
  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'completed',
      },
    ],
    title: 'onboarding',
    status: 'completed',
    enablement: 'true',
  };
  const complete = isOnboardingCompleted(onboarding);
  expect(complete).toBeTruthy();
});

test('Expect the setup of multiple onboardings to be completed if all have been completed', async () => {
  const onboarding1: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'completed',
      },
    ],
    title: 'onboarding',
    status: 'completed',
    enablement: 'true',
  };
  const onboarding2: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'completed',
      },
    ],
    title: 'onboarding',
    status: 'completed',
    enablement: 'true',
  };
  const complete = isOnboardingsSetupCompleted([onboarding1, onboarding2]);
  expect(complete).toBeTruthy();
});

test('Expect the setup of multiple onboardings to be uncompleted if atleast one have not been completed', async () => {
  const onboarding1: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'completed',
      },
    ],
    title: 'onboarding',
    status: 'completed',
    enablement: 'true',
  };
  const onboarding2: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      {
        id: 'id1',
        title: 'title 1',
        status: 'completed',
      },
      {
        id: 'id2',
        title: 'title 2',
        status: 'failed',
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const complete = isOnboardingsSetupCompleted([onboarding1, onboarding2]);
  expect(complete).toBeFalsy();
});

test('Expect the step to be considered NOT completed if the active step have not completion events', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const isCompleted = isStepCompleted(activeStep, []);
  expect(isCompleted).toBeFalsy();
});

test('Expect the step to be completed if the step is considered completed if only a command has been executed and it has actually been executed', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onCommand:mycommand'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const isCompleted = isStepCompleted(activeStep, ['mycommand']);
  expect(isCompleted).toBeTruthy();
});

test('Expect the step to NOT be completed if the step is considered completed if only a command has been executed and it has NOT been executed', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onCommand:mycommand'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const isCompleted = isStepCompleted(activeStep, []);
  expect(isCompleted).toBeFalsy();
});

test('Expect the step to be completed if the step is considered completed if a context value is set and it is actually set and its evaluation returns true', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const context = new ContextUI();
  context.setValue('id.onboarding.myvalue', 'value');
  deserialize.mockReturnValue({
    evaluate: (_context: ContextUI) => true,
  } as unknown as ContextKeyExpression);
  const isCompleted = isStepCompleted(activeStep, [], context);
  expect(isCompleted).toBeTruthy();
});

test('Expect the step to NOT be completed if the step is considered completed if a context value is set and its evaluation is true, but its evaluation returns false', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const context = new ContextUI();
  context.setValue('id.onboarding.myvalue', 'value');
  deserialize.mockReturnValue({
    evaluate: (_context: ContextUI) => false,
  } as unknown as ContextKeyExpression);
  const isCompleted = isStepCompleted(activeStep, [], context);
  expect(isCompleted).toBeFalsy();
});

test('Expect the step to NOT be completed if the step is considered completed if a context value is set and it is NOT set', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const context = new ContextUI();
  deserialize.mockReturnValue({
    evaluate: (_context: ContextUI) => false,
  } as unknown as ContextKeyExpression);
  const isCompleted = isStepCompleted(activeStep, [], context);
  expect(isCompleted).toBeFalsy();
});

test('Expect the step to NOT be completed if the step is considered completed if a context value is set but there is no context available', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const isCompleted = isStepCompleted(activeStep, []);
  expect(isCompleted).toBeFalsy();
});

test('Expect the step to be completed if the negated context value is true', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['!onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  const activeStep: ActiveOnboardingStep = {
    onboarding,
    step,
  };
  const context = new ContextUI();
  deserialize.mockReturnValue({
    evaluate: (_context: ContextUI) => true,
  } as unknown as ContextKeyExpression);
  const isCompleted = isStepCompleted(activeStep, [], context);
  expect(isCompleted).toBeTruthy();
});

test('Expect the step status to be updated but not the onboarding as it is not the last step', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [
      step,
      {
        id: 'id2',
        title: 'title 2',
        status: undefined,
        state: 'completed',
      },
    ],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  await updateOnboardingStepStatus(onboarding, step, 'completed');
  expect(step.status).equal('completed');
  expect(onboarding.status).toBeUndefined();
});

test('Expect the step and the onboarding status to be updated as it is the last step', async () => {
  const step: OnboardingStep = {
    id: 'id1',
    title: 'title 1',
    status: undefined,
    state: 'completed',
    completionEvents: ['onboardingContext:myvalue'],
  };

  const onboarding: OnboardingInfo = {
    extension: 'id',
    name: 'name',
    displayName: 'displayName',
    icon: 'icon',
    steps: [step],
    title: 'onboarding',
    status: undefined,
    enablement: 'true',
  };
  await updateOnboardingStepStatus(onboarding, step, 'completed');
  expect(step.status).equal('completed');
  expect(onboarding.status).equal('completed');
});

test('Expect the onboarding context key placeholder is replaced with its context value', async () => {
  const context = new ContextUI();
  context.setValue('id.onboarding.myvalue', 'value');

  const newString = replaceContextKeyPlaceholders('${onboardingContext:myvalue}', 'id', context);
  expect(newString).equal('value');
});

test('Expect the global context key placeholder is replaced with its context value', async () => {
  const context = new ContextUI();
  context.setValue('myvalue', 'value');

  const newString = replaceContextKeyPlaceholders('${onContext:myvalue}', 'id', context);
  expect(newString).equal('value');
});

test('Expect multiple context key placeholders are replaced with their context values', async () => {
  const context = new ContextUI();
  context.setValue('id.onboarding.myvalue1', 'value1');
  context.setValue('id.onboarding.myvalue2', 'value2');
  context.setValue('myvalue3', 'value3');
  context.setValue('myvalue4', 'value4');

  const newString = replaceContextKeyPlaceholders(
    '${onboardingContext:myvalue1} ${onboardingContext:myvalue2} ${onContext:myvalue3} ${onContext:myvalue4}',
    'id',
    context,
  );
  expect(newString).equal('value1 value2 value3 value4');
});

test('Expect a string without any context placeholder is returned as it is', async () => {
  const context = new ContextUI();

  const newString = replaceContextKeyPlaceholders('no placeholders', 'id', context);
  expect(newString).equal('no placeholders');
});

test('Expect the replacement is used when defined even if the value is in context', async () => {
  const context = new ContextUI();
  context.setValue('id.onboarding.myvalue1', 'value1');

  const newString = replaceContextKeyPlaceHoldersByRegex(
    new RegExp(/\${onboardingContext:(.+?)}/g),
    '${onboardingContext:myvalue1}',
    context,
    undefined,
    'replacement',
  );
  expect(newString).equal('replacement');
});
