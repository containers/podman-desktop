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

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { expect, test, vi } from 'vitest';

import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';

import { ContextUI } from '../context/context';
import Onboarding from './Onboarding.svelte';

async function waitRender(customProperties: object): Promise<void> {
  render(Onboarding, { ...customProperties });
  await tick();
  await tick();
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

test('Expect to have the "Try again" and Cancel buttons if the step represent a failed state', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const button = screen.getByRole('button', { name: 'Try again' });
  expect(button).toBeInTheDocument();
  const buttonCancel = screen.getByRole('button', { name: 'Cancel Setup' });
  expect(buttonCancel).toBeInTheDocument();
  const infoMessage = screen.queryByLabelText('Next Info Message');
  expect(infoMessage).not.toBeInTheDocument();
});

test('Expect not to have the "Try again" and "Cancel" buttons if the step represent a completed state', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const buttonTryAgain = screen.queryByRole('button', { name: 'Try again' });
  expect(buttonTryAgain).not.toBeInTheDocument();
  const buttonCancel = screen.queryByRole('button', { name: 'Cancel Setup' });
  expect(buttonCancel).not.toBeInTheDocument();
  const infoMessage = screen.getByLabelText('Next Info Message');
  expect(infoMessage).toBeInTheDocument();
});

test('Expect to have the "Step Body" div if the step does not include a component', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const bodyDiv = screen.getByLabelText('Step Body');
  expect(bodyDiv).toBeInTheDocument();
  const onboardingComponent = screen.queryByLabelText('Onboarding Component');
  expect(onboardingComponent).not.toBeInTheDocument();
});

test('Expect to have the embedded component if the step includes a component', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          component: 'createContainerProviderConnection',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });

  const onboardingComponent = screen.getByLabelText('Onboarding Component');
  expect(onboardingComponent).toBeInTheDocument();
  const bodyDiv = screen.queryByLabelText('Step Body');
  expect(bodyDiv).not.toBeInTheDocument();
});

test('Expect content to show / render when when clause is true', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          completionEvents: [],
          content: [
            [
              {
                value: 'helloworld',
                when: 'true',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  // Get by specifically the paragraph element with the text helloworld
  const paragraph = screen.getAllByText('helloworld');
  expect(paragraph[0]).toBeInTheDocument();
});

test('Expect content to NOT show / render when when clause is false', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          completionEvents: [],
          content: [
            [
              {
                value: 'helloworld',
                when: 'false',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const helloDoesntExist = screen.queryByText('helloworld');
  expect(helloDoesntExist).not.toBeInTheDocument();
});

test('Expect content with "when" to change dynamically when setting has been updated via context.', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          completionEvents: [],
          content: [
            [
              {
                value: 'helloworld',
                when: 'config.test',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id'],
  });

  // Expect "helloworld" to not be in the document
  const helloDoesntExist = screen.queryByText('helloworld');
  expect(helloDoesntExist).not.toBeInTheDocument();

  contextConfig.setValue('config.test', true);
  await waitRender({
    extensionIds: ['id'],
  });

  // Expect "helloworld" to exist
  const helloExists = screen.getAllByText('helloworld');
  expect(helloExists[0]).toBeInTheDocument();
});

test('Expect Step Body to clean up if new step has no content to display.', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'helloworld',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id'],
  });

  // Expect "helloworld" to exist
  const helloExists = screen.getAllByText('helloworld');
  expect(helloExists[0]).toBeInTheDocument();

  // click on the next button
  const nextButton = screen.getByLabelText('Next Step');
  expect(nextButton).toBeInTheDocument();
  await fireEvent.click(nextButton);

  while (screen.queryAllByText('helloworld').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Expect "helloworld" to not be in the document
  const helloDoesntExist = screen.queryByText('helloworld');
  expect(helloDoesntExist).not.toBeInTheDocument();
});

// Expect that hitting "Escape" key will trigger the sendShowMessageBoxOnSelect
test('Expect that Esc closes', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  //

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'helloworld',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id'],
  });

  // Expect "helloworld" to exist
  const helloExists = screen.getAllByText('helloworld');
  expect(helloExists[0]).toBeInTheDocument();

  // Press esc
  await userEvent.keyboard('{Escape}');

  // Espect the div 'Skip Setup Popup' to be in the document
  const skipSetupPopup = screen.getByLabelText('Skip Setup Popup');
  expect(skipSetupPopup).toBeInTheDocument();
});

test('Expect onboarding to handle two extension ids and global onboarding set to true', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      title: 'Foobar Onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'foobar1stepcontent',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
          content: [
            [
              {
                value: 'foobar1completed',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
    {
      extension: 'id2',
      title: 'Foobar2 Onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'foobar2stepcontent',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
          content: [
            [
              {
                value: 'foobar2completed',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id', 'id2'],
    global: true,
  });

  // Check that 'Get started with Podman Desktop' is shown
  const title = screen.getByText('Get started with Podman Desktop');
  expect(title).toBeInTheDocument();

  /*
   ** Checking the first extension
   */

  // Expect the onboarding title 'Foobar Onboarding' to be in the document
  const displayName = screen.getByText('Foobar Onboarding');
  expect(displayName).toBeInTheDocument();

  // Expect the first step 'helloworld' to be in the document
  const helloExists = screen.getAllByText('foobar1stepcontent');
  expect(helloExists[0]).toBeInTheDocument();

  // Click next
  const nextButton = screen.getByLabelText('Next Step');
  expect(nextButton).toBeInTheDocument();
  await fireEvent.click(nextButton);

  // Wait until 'foobar1completed' is shown
  while (screen.queryAllByText('foobar1completed').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Click next again
  await fireEvent.click(nextButton);

  /*
   ** Checking the second extension
   */

  // Wait until 'foobar2stepcontent' is shown
  while (screen.queryAllByText('foobar2stepcontent').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Get the title of the second extension
  const displayName2 = screen.getByText('Foobar2 Onboarding');
  expect(displayName2).toBeInTheDocument();

  // Click next again
  await fireEvent.click(nextButton);

  // Wait until 'foobar2completed' is shown
  while (screen.queryAllByText('foobar2completed').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Click next again
  await fireEvent.click(nextButton);

  // Expect the onboarding to be closed since we have reached the last step
  const onboarding = screen.queryByLabelText('Onboarding');
  expect(onboarding).not.toBeInTheDocument();
});

test('Expect onboarding to handle two extension ids and global onboarding set to false', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      title: 'Foobar Onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'foobar1stepcontent',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
          content: [
            [
              {
                value: 'foobar1completed',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
    {
      extension: 'id2',
      title: 'Foobar2 Onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [
            [
              {
                value: 'foobar2stepcontent',
              },
            ],
          ],
        },
        {
          id: 'step2',
          title: 'step2',
          state: 'completed',
          content: [
            [
              {
                value: 'foobar2completed',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id', 'id2'],
    global: false,
  });

  // Check that 'Get started with Podman Desktop' is not shown
  const title = screen.queryByText('Get started with Podman Desktop');
  expect(title).not.toBeInTheDocument();

  /*
   ** Checking the first extension
   */

  // Expect the onboarding title 'Foobar Onboarding' to be in the document
  const displayName = screen.getByText('Foobar Onboarding');
  expect(displayName).toBeInTheDocument();

  // Expect the first step 'helloworld' to be in the document
  const helloExists = screen.getAllByText('foobar1stepcontent');
  expect(helloExists[0]).toBeInTheDocument();

  // Click next
  const nextButton = screen.getByLabelText('Next Step');
  expect(nextButton).toBeInTheDocument();
  await fireEvent.click(nextButton);

  // Wait until 'foobar1completed' is shown
  while (screen.queryAllByText('foobar1completed').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Click next again
  await fireEvent.click(nextButton);

  /*
   ** Checking the second extension
   */

  // Wait until 'foobar2stepcontent' is shown
  while (screen.queryAllByText('foobar2stepcontent').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // The title of the next extension is NOT shown since 'global' is set to false (wont show top section).
  const displayName2 = screen.queryByText('Foobar2 Onboarding');
  expect(displayName2).not.toBeInTheDocument();

  // Click next again
  await fireEvent.click(nextButton);

  // Wait until 'foobar2completed' is shown
  while (screen.queryAllByText('foobar2completed').length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Click next again
  await fireEvent.click(nextButton);

  // Expect the onboarding to be closed since we have reached the last step
  const onboarding = screen.queryByLabelText('Onboarding');
  expect(onboarding).not.toBeInTheDocument();
});

test('Expect onboarding to be reset when starting completed onboarding', async () => {
  (window as any).resetOnboarding = vi.fn();
  (window as any).updateStepState = vi.fn();

  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'completed',
          status: 'completed',
          completionEvents: [],
          content: [
            [
              {
                value: 'helloworld',
              },
            ],
          ],
        },
      ],
      enablement: 'true',
      status: 'completed',
    },
  ]);
  context.set(new ContextUI());
  await waitRender({
    extensionIds: ['id'],
  });
  const helloDoesntExist = screen.queryAllByText('helloworld');
  expect(helloDoesntExist.length).toBeGreaterThan(0);
});
