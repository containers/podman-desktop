/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextUI } from '/@/lib/context/context';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';

import Onboarding from './Onboarding.svelte';

async function waitRender(customProperties: object): Promise<void> {
  render(Onboarding, { ...customProperties });
  await tick();
  await tick();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.mocked(window.telemetryTrack).mockResolvedValue();
});

test('Expect to have the "Try again" and Cancel buttons if the step represent a failed state', async () => {
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const nextButton = screen.getByRole('button', { name: 'Next Step' });
  expect(nextButton).toBeDisabled();
});

test('Expect not to have the "Try again" and "Cancel" buttons if the step represent a completed state', async () => {
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const nextButton = screen.getByRole('button', { name: 'Next Step' });
  expect(nextButton).toBeInTheDocument();
});

test('Expect to have the "Step Body" div if the step does not include a component', async () => {
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  //

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'Foobar Onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
      removable: true,
      title: 'Foobar2 Onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      welcomeMessage: 'Get started with Podman Desktop',
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
  const contextConfig = new ContextUI();
  context.set(contextConfig);
  contextConfig.setValue('config.test', false);

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'Foobar Onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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
      removable: true,
      title: 'Foobar2 Onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      welcomeMessage: 'Get started with Podman Desktop',
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

  // Sidebar is hidden for non-global onboarding, so the title is not rendered
  const displayName = screen.queryByText('Foobar Onboarding');
  expect(displayName).not.toBeInTheDocument();

  // Expect the first step content to be in the document
  const helloExists = screen.getAllByText('foobar1stepcontent');
  expect(helloExists[0]).toBeInTheDocument();

  // Click next
  const nextButton = screen.getByLabelText('Next Step');
  expect(nextButton).toBeInTheDocument();
  await fireEvent.click(nextButton);

  // Wait until 'foobar1completed' is shown
  await vi.waitFor(() => expect(screen.queryAllByText('foobar1completed').length).toBe(0));

  // Click next again
  await fireEvent.click(nextButton);

  /*
   ** Checking the second extension
   */

  // Wait until 'foobar2stepcontent' is shown
  await vi.waitFor(() => expect(screen.queryAllByText('foobar2stepcontent').length).toBe(0));

  await tick();
  // Sidebar still hidden for non-global
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

test('Expect title to display welcome message from onboarding info', async () => {
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Custom Product Name',
      steps: [
        {
          id: 'step',
          title: 'step',
          completionEvents: [],
          content: [
            [
              {
                value: 'content',
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
    global: true,
  });

  // Verify the welcome message is displayed
  const title = screen.getByText('Get started with Custom Product Name');
  expect(title).toBeInTheDocument();
});

test('Expect onboarding to be reset when starting completed onboarding', async () => {
  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
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

test('Expect per-extension Skip button to call updateStepState for each step', async () => {
  const contextConfig = new ContextUI();
  context.set(contextConfig);

  onboardingList.set([
    {
      extension: 'id',
      removable: true,
      title: 'Foobar Onboarding',
      name: 'foobar',
      displayName: 'FooBar',
      icon: 'data:image/png;base64,foobar',
      welcomeMessage: 'Get started with Podman Desktop',
      steps: [
        {
          id: 'step1',
          title: 'step1',
          content: [[{ value: 'foobar1stepcontent' }]],
        },
        {
          id: 'step2',
          title: 'step2',
          content: [[{ value: 'foobar1step2content' }]],
        },
      ],
      enablement: 'true',
    },
    {
      extension: 'id2',
      removable: true,
      title: 'Second Onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      welcomeMessage: 'Get started with Podman Desktop',
      steps: [
        {
          id: 'step',
          title: 'step',
          content: [[{ value: 'foobar2stepcontent' }]],
        },
      ],
      enablement: 'true',
    },
  ]);

  await waitRender({
    extensionIds: ['id', 'id2'],
    global: true,
  });

  // First extension content should be visible
  expect(screen.getAllByText('foobar1stepcontent')[0]).toBeInTheDocument();

  // The per-extension Skip button should be present in the sidebar
  const skipButtons = screen.getAllByRole('button', { name: /Skip/ });
  const perExtensionSkip = skipButtons.find(btn => btn.textContent?.trim() === 'Skip');
  expect(perExtensionSkip).toBeDefined();

  // Click Skip and verify updateStepState was called for each step of the skipped extension
  const updateStepStateMock = vi.mocked(window.updateStepState);
  const callCountBefore = updateStepStateMock.mock.calls.length;
  await fireEvent.click(perExtensionSkip!);
  await tick();

  // Should have called updateStepState for both steps of the first extension
  const newCalls = updateStepStateMock.mock.calls.slice(callCountBefore);
  expect(newCalls.length).toBeGreaterThanOrEqual(2);
});
