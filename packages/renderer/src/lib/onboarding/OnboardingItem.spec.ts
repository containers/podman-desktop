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
import OnboardingItem from './OnboardingItem.svelte';
import type { OnboardingStepItem } from '../../../../main/src/plugin/api/onboarding';
import { ContextUI } from '../context/context';

test('Expect button html when passing a button tag in markdown', async () => {
  const textComponent: OnboardingStepItem = {
    value: ':button[label]{id=id command=command}',
  };
  render(OnboardingItem, {
    extension: 'extension',
    item: textComponent,
    getContext: vi.fn(),
    executeCommand: vi.fn(),
  });
  const button = screen.getByRole('button', { name: 'label' });
  expect(button).toBeInTheDocument();
  expect(button.id).toBe('id');
});

test('Expect markdown html when passing a text component', async () => {
  const textComponent: OnboardingStepItem = {
    value: 'html content here',
  };
  render(OnboardingItem, {
    extension: 'extension',
    item: textComponent,
    getContext: vi.fn(),
    executeCommand: vi.fn(),
  });
  const markdownSection = screen.getByLabelText('markdown-content');
  expect(markdownSection).toBeInTheDocument();
  expect(markdownSection.innerHTML.includes('html content here')).toBe(true);
});

test('Expect placeholders are replaced when passing a text component with placeholders', async () => {
  const textComponent: OnboardingStepItem = {
    value: '${onboardingContext:text}',
  };
  const context = new ContextUI();
  context.setValue('extension.onboarding.text', 'placeholder content');
  render(OnboardingItem, {
    extension: 'extension',
    item: textComponent,
    getContext: () => context,
    executeCommand: vi.fn(),
  });
  const markdownSection = screen.getByLabelText('markdown-content');
  expect(markdownSection).toBeInTheDocument();
  expect(markdownSection.innerHTML.includes('placeholder content')).toBe(true);
});
