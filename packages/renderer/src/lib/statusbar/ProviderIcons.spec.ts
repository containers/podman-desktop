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

import { render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import IconImage from '../appearance/IconImage.svelte';
import DeveloperSandboxIconWhite from '../images/provider-icons/developer-sandbox-icon-white.svelte';
import KindWhiteIcon from '../images/provider-icons/kind-white-icon.svelte';
import MinikubeIconWhite from '../images/provider-icons/minikube-icon-white.svelte';
import PodmanIconWhite from '../images/provider-icons/podman-icon-white.svelte';
import RedHatOpenShiftWhite from '../images/provider-icons/Red_Hat-OpenShift-white.svelte';
import ProviderIcons from './ProviderIcons.svelte';

vi.mock('../images/provider-icons/developer-sandbox-icon-white.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('../images/provider-icons/kind-white-icon.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('../images/provider-icons/minikube-icon-white.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('../images/provider-icons/podman-icon-white.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('../images/provider-icons/Red_Hat-OpenShift-white.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('../appearance/IconImage.svelte', () => ({
  default: vi.fn(),
}));

test('Expect developer sandbox icon to be rendered', () => {
  render(ProviderIcons, { entry: { name: 'Developer Sandbox' } });
  expect(vi.mocked(DeveloperSandboxIconWhite)).toBeCalled();
});

test('Expect podman icon to be rendered', () => {
  render(ProviderIcons, { entry: { name: 'Podman' } });
  expect(vi.mocked(PodmanIconWhite)).toBeCalled();
});

test('Expect minkube icon to be rendered', () => {
  render(ProviderIcons, { entry: { name: 'Minikube' } });
  expect(vi.mocked(MinikubeIconWhite)).toBeCalled();
});

test('Expect kind icon to be rendered', () => {
  render(ProviderIcons, { entry: { name: 'Kind' } });
  expect(vi.mocked(KindWhiteIcon)).toBeCalled();
});

test('Expect openshift local icon to be rendered', () => {
  render(ProviderIcons, { entry: { name: 'OpenShift Local' } });
  expect(vi.mocked(RedHatOpenShiftWhite)).toBeCalled();
});

test('Expect other icon with icon property to be rendered with IconImage', () => {
  render(ProviderIcons, { entry: { name: 'other entry', images: { icon: 'some icon' } } });
  expect(vi.mocked(IconImage)).toBeCalled();
});
