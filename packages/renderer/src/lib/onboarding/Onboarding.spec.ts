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
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Onboarding from './Onboarding.svelte';
import { ContextUI } from '../context/context';
import { onboardingList } from '/@/stores/onboarding';
import { context } from '/@/stores/context';

async function waitRender(customProperties: object): Promise<void> {
  const result = render(Onboarding, { ...customProperties });
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect to have the "Try again" and Cancel buttons if the step represent a failed state', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const button = screen.getByRole('button', { name: 'Try again' });
  expect(button).toBeInTheDocument();
  const buttonCancel = screen.getByRole('button', { name: 'Cancel setup' });
  expect(buttonCancel).toBeInTheDocument();
  const infoMessage = screen.queryByLabelText('next-info-message');
  expect(infoMessage).not.toBeInTheDocument();
});

test('Expect not to have the "Try again" and "Cancel" buttons if the step represent a completed state', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          completionEvents: [],
        },
      ],
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const buttonTryAgain = screen.queryByRole('button', { name: 'Try again' });
  expect(buttonTryAgain).not.toBeInTheDocument();
  const buttonCancel = screen.queryByRole('button', { name: 'Cancel setup' });
  expect(buttonCancel).not.toBeInTheDocument();
  const infoMessage = screen.getByLabelText('next-info-message');
  expect(infoMessage).toBeInTheDocument();
});

test('Expect to have the "step body" div if the step does not include a component', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const bodyDiv = screen.getByLabelText('step body');
  expect(bodyDiv).toBeInTheDocument();
  const onboardingComponent = screen.queryByLabelText('onboarding component');
  expect(onboardingComponent).not.toBeInTheDocument();
});

test('Expect to have the embedded component if the step includes a component', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          component: 'createContainerProviderConnection',
          completionEvents: [],
        },
      ],
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });

  const onboardingComponent = screen.getByLabelText('onboarding component');
  expect(onboardingComponent).toBeInTheDocument();
  const bodyDiv = screen.queryByLabelText('step body');
  expect(bodyDiv).not.toBeInTheDocument();
});
