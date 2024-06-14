/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import type { ILoadingStatus } from '/@/lib/preferences/Util';
import LoadingIconButton from '/@/lib/ui/LoadingIconButton.svelte';
import { capitalize } from '/@/lib/ui/Util';

type TestScenario = {
  name: string;
  action: string;
  color: 'primary' | 'secondary' | undefined;
  state: ILoadingStatus | undefined;
  expected: { disabled: boolean; classes: string[] };
};

const EXPECT_ENABLE = {
  disabled: false,
  classes: ['text-[var(--pd-action-button-text)]', 'hover:text-[var(--pd-action-button-hover-text)]'],
};

const EXPECT_DISABLE = {
  disabled: true,
  classes: ['text-[var(--pd-action-button-disabled-text)]', 'cursor-not-allowed'],
};

function assert(action: string, expected: { disabled: boolean; classes: string[] }): void {
  // Get the button
  const button: HTMLButtonElement = screen.getByRole('button', { name: capitalize(action) });

  // Ensure it match the expected states
  expect(button.disabled).toBe(expected.disabled);

  // Ensure the classes
  expected.classes.forEach(mClass => {
    expect(button.classList).toContain(mClass);
  });
}

test.each(['start', 'restart', 'stop', 'delete', 'update'])('action $action in progress should be disabled', action => {
  render(LoadingIconButton, {
    action: action,
    state: {
      inProgress: true,
      status: 'unknown',
    },
    leftPosition: '',
    icon: faPlayCircle,
    clickAction: vi.fn(),
  });

  assert(action, EXPECT_DISABLE);
});

test.each([
  // Start action
  {
    name: 'start action with stopped status should be enable',
    action: 'start',
    state: {
      status: 'stopped',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  {
    name: 'start action with failed status should be enable',
    action: 'start',
    state: {
      status: 'failed',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  {
    name: 'primary enable should have purple colors',
    color: 'primary',
    action: 'start',
    state: {
      status: 'stopped',
      inProgress: false,
    },
    expected: {
      disabled: false,
      classes: [
        'text-[var(--pd-action-button-primary-text)]',
        'hover:text-[var(--pd-action-button-primary-hover-text)]',
      ],
    },
  },
  {
    name: 'primary disable should have disabled classes',
    color: 'primary',
    action: 'start',
    state: {
      status: 'started',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  // Restart action
  {
    name: 'restart action with stopped status should be disabled',
    action: 'restart',
    state: {
      status: 'stopped',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  // Stop action
  {
    name: 'stop action in started status should be enable',
    action: 'stop',
    state: {
      status: 'started',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  // Delete action
  {
    name: 'delete action in stopped stopped should be enable',
    action: 'delete',
    state: {
      status: 'stopped',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  {
    name: 'delete action in unknown stopped should be enable',
    action: 'delete',
    state: {
      status: 'unknown',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  {
    name: 'delete action in started stopped should be disabled',
    action: 'delete',
    state: {
      status: 'started',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  {
    name: 'delete action in failed status should be enable',
    action: 'delete',
    state: {
      status: 'failed',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  // Update action
  {
    name: 'update action in unknown status should be disabled',
    action: 'update',
    state: {
      status: 'unknown',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  // edit action
  {
    name: 'edit action in started status should be enabled',
    action: 'edit',
    state: {
      status: 'started',
      inProgress: false,
    },
    expected: EXPECT_ENABLE,
  },
  {
    name: 'edit action in unknown status should be disabled',
    action: 'edit',
    state: {
      status: 'unknown',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  {
    name: 'edit action in starting status should be disabled',
    action: 'edit',
    state: {
      status: 'starting',
      inProgress: false,
    },
    expected: EXPECT_DISABLE,
  },
  {
    name: 'edit action if in progress should be disabled',
    action: 'edit',
    state: {
      status: 'started',
      inProgress: true,
    },
    expected: EXPECT_DISABLE,
  },
] as TestScenario[])('$name', ({ action, color, state, expected }) => {
  render(LoadingIconButton, {
    action: action,
    state: state,
    color: color,
    leftPosition: '',
    icon: faPlayCircle,
    clickAction: vi.fn(),
  });

  assert(action, expected);
});
