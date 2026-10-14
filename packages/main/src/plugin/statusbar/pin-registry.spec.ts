/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ProviderInfo } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';
import type { Configuration } from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import { PIN_REGISTRY_TELEMETRY_EVENTS, PinRegistry } from '/@/plugin/statusbar/pin-registry.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

const COMMAND_REGISTRY_MOCK: CommandRegistry = {
  registerCommand: vi.fn(),
} as unknown as CommandRegistry;

const API_SENDER_MOCK: ApiSenderType = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const CONFIGURATION_REGISTRY_MOCK: ConfigurationRegistry = {
  getConfiguration: vi.fn(),
  registerConfigurations: vi.fn(),
} as unknown as ConfigurationRegistry;

const PROVIDER_REGISTRY_MOCK: ProviderRegistry = {
  getProviderInfos: vi.fn(),
  // containers
  onDidRegisterContainerConnection: vi.fn(),
  onDidUnregisterContainerConnection: vi.fn(),
  // kubernetes
  onDidRegisterKubernetesConnection: vi.fn(),
  onDidUnregisterKubernetesConnection: vi.fn(),
  // VMs
  onDidRegisterVmConnection: vi.fn(),
  onDidUnregisterVmConnection: vi.fn(),
} as unknown as ProviderRegistry;

const TELEMETRY_MOCK: Telemetry = {
  track: vi.fn(),
} as unknown as Telemetry;

const KIND_ONE_CLUSTER_PROVIDER: ProviderInfo = {
  id: 'kind',
  name: 'Kind',
  kubernetesConnections: [
    {
      name: 'kind-cluster',
    },
  ],
  containerConnections: [],
  vmConnections: [],
} as unknown as ProviderInfo;

const KIND_EMPTY_CLUSTER_PROVIDER: ProviderInfo = {
  ...KIND_ONE_CLUSTER_PROVIDER,
  kubernetesConnections: [],
};

const PODMAN_PROVIDER: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'podman-machine-default',
      displayName: 'Podman Machine Default',
      status: 'started',
      type: 'podman',
    },
  ],
} as unknown as ProviderInfo;

const COMPOSE_PROVIDER: ProviderInfo = {
  id: 'compose',
  name: 'compose',
  kubernetesConnections: [],
  containerConnections: [],
  vmConnections: [],
} as unknown as ProviderInfo;

const CONFIGURATION_MOCK: Configuration = {
  get: vi.fn(),
  update: vi.fn(),
} as unknown as Configuration;

function getPinRegistry(): PinRegistry {
  return new PinRegistry(
    COMMAND_REGISTRY_MOCK,
    API_SENDER_MOCK,
    CONFIGURATION_REGISTRY_MOCK,
    PROVIDER_REGISTRY_MOCK,
    TELEMETRY_MOCK,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(PROVIDER_REGISTRY_MOCK.getProviderInfos).mockReturnValue([
    PODMAN_PROVIDER,
    KIND_ONE_CLUSTER_PROVIDER,
    COMPOSE_PROVIDER,
  ]);
  vi.mocked(CONFIGURATION_REGISTRY_MOCK.getConfiguration).mockReturnValue(CONFIGURATION_MOCK);
});

describe('getOptions', () => {
  test('getOptions should filter ProviderRegistry#getProviderInfos result', () => {
    const pinRegistry = getPinRegistry();
    const options = pinRegistry.getOptions();

    expect(options).toHaveLength(2);
    // podman provider should be listed and pinned by default

    expect(options).toEqual(
      expect.arrayContaining([
        {
          value: PODMAN_PROVIDER.id,
          label: PODMAN_PROVIDER.name,
          pinned: true,
        },
        {
          value: KIND_ONE_CLUSTER_PROVIDER.id,
          label: KIND_ONE_CLUSTER_PROVIDER.name,
          pinned: false,
        },
      ]),
    );
  });

  test('empty providers should not be listed as options', () => {
    // mock single provider without any connections
    vi.mocked(PROVIDER_REGISTRY_MOCK.getProviderInfos).mockReturnValue([KIND_EMPTY_CLUSTER_PROVIDER]);

    const pinRegistry = getPinRegistry();
    const options = pinRegistry.getOptions();

    expect(options).toHaveLength(0);
  });
});

describe('init', () => {
  test('init should register command', () => {
    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(COMMAND_REGISTRY_MOCK.registerCommand).toHaveBeenCalledWith(
      STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU_COMMAND,
      expect.any(Function),
    );
  });

  test('init should register configuration', () => {
    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(CONFIGURATION_REGISTRY_MOCK.registerConfigurations).toHaveBeenCalledWith([
      expect.objectContaining({
        id: STATUS_BAR_PIN_CONSTANTS.STATUS_BAR_CONFIGURATION,
      }),
    ]);
  });

  test('empty configuration should use default (podman)', () => {
    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(pinRegistry.getOptions()).toContainEqual({
      value: PODMAN_PROVIDER.id,
      label: PODMAN_PROVIDER.name,
      pinned: true,
    });
  });

  test('init should not emit telemetry event on default (empty) value', () => {
    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(TELEMETRY_MOCK.track).not.toHaveBeenCalled();
  });

  test('init should emit telemetry event when user have defined value', () => {
    // mock user defined values (not default)
    vi.mocked(CONFIGURATION_MOCK.get).mockReturnValue([KIND_ONE_CLUSTER_PROVIDER.id]);

    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(TELEMETRY_MOCK.track).toHaveBeenCalledWith(PIN_REGISTRY_TELEMETRY_EVENTS.OPTIONS, {
      options: [KIND_ONE_CLUSTER_PROVIDER.id],
    });
  });

  test('configuration value should be used if exists', () => {
    // mock kind as pinned from configuration
    vi.mocked(CONFIGURATION_MOCK.get).mockReturnValue([KIND_ONE_CLUSTER_PROVIDER.id]);

    const pinRegistry = getPinRegistry();
    pinRegistry.init();

    expect(pinRegistry.getOptions()).toEqual(
      expect.arrayContaining([
        {
          value: PODMAN_PROVIDER.id,
          label: PODMAN_PROVIDER.name,
          pinned: false, // false
        },
        {
          value: KIND_ONE_CLUSTER_PROVIDER.id,
          label: KIND_ONE_CLUSTER_PROVIDER.name,
          pinned: true, // true as we defined in the configuration
        },
      ]),
    );
  });
});

describe('pin / unpin', () => {
  let pinRegistry: PinRegistry;
  beforeEach(() => {
    // init
    pinRegistry = getPinRegistry();
    pinRegistry.init();
  });

  test('pin should save and notify', async () => {
    pinRegistry.pin(KIND_ONE_CLUSTER_PROVIDER.id);

    // 1. first we should update the configuration
    expect(CONFIGURATION_MOCK.update).toHaveBeenCalledWith(
      STATUS_BAR_PIN_CONSTANTS.PINNED_CONFIGURATION_PROPERTY,
      expect.arrayContaining([PODMAN_PROVIDER.id, KIND_ONE_CLUSTER_PROVIDER.id]),
    );

    // 2. api sender should have been notified
    await vi.waitFor(() => {
      expect(API_SENDER_MOCK.send).toHaveBeenCalledWith(
        STATUS_BAR_PIN_CONSTANTS.PIN_OPTIONS_UPDATE,
        expect.arrayContaining([
          {
            value: KIND_ONE_CLUSTER_PROVIDER.id,
            label: KIND_ONE_CLUSTER_PROVIDER.name,
            pinned: true, // now true
          },
        ]),
      );
    });
  });

  test('unpin should save and notify', async () => {
    pinRegistry.unpin(PODMAN_PROVIDER.id);

    // 1. first we should update the configuration
    expect(CONFIGURATION_MOCK.update).toHaveBeenCalledWith(STATUS_BAR_PIN_CONSTANTS.PINNED_CONFIGURATION_PROPERTY, []);

    // 2. api sender should have been notified
    await vi.waitFor(() => {
      expect(API_SENDER_MOCK.send).toHaveBeenCalledWith(
        STATUS_BAR_PIN_CONSTANTS.PIN_OPTIONS_UPDATE,
        expect.arrayContaining([
          {
            value: PODMAN_PROVIDER.id,
            label: PODMAN_PROVIDER.name,
            pinned: false,
          },
        ]),
      );
    });
  });

  test('pin should emit a telemetry event', async () => {
    pinRegistry.pin(PODMAN_PROVIDER.id);

    await vi.waitFor(() => {
      expect(TELEMETRY_MOCK.track).toHaveBeenCalledWith(PIN_REGISTRY_TELEMETRY_EVENTS.PIN, {
        optionId: PODMAN_PROVIDER.id,
      });
    });
  });

  test('unpin should emit a telemetry event', async () => {
    pinRegistry.unpin(PODMAN_PROVIDER.id);

    await vi.waitFor(() => {
      expect(TELEMETRY_MOCK.track).toHaveBeenCalledWith(PIN_REGISTRY_TELEMETRY_EVENTS.UNPIN, {
        optionId: PODMAN_PROVIDER.id,
      });
    });
  });
});

type RegisterEvent = Pick<
  ProviderRegistry,
  | 'onDidRegisterContainerConnection'
  | 'onDidUnregisterContainerConnection'
  | 'onDidRegisterKubernetesConnection'
  | 'onDidUnregisterKubernetesConnection'
  | 'onDidRegisterVmConnection'
  | 'onDidUnregisterVmConnection'
>;

test.each([
  'onDidRegisterContainerConnection',
  'onDidUnregisterContainerConnection',
  'onDidRegisterKubernetesConnection',
  'onDidUnregisterKubernetesConnection',
  'onDidRegisterVmConnection',
  'onDidUnregisterVmConnection',
] as Array<keyof RegisterEvent>)('ProviderRegistry#%s should make the pin registry notify', async event => {
  // init
  const pinRegistry = getPinRegistry();
  pinRegistry.init();

  // ensure call count is zero
  vi.mocked(API_SENDER_MOCK.send).mockReset();
  expect(API_SENDER_MOCK.send).not.toHaveBeenCalled();

  expect(PROVIDER_REGISTRY_MOCK[event]).toHaveBeenCalledOnce();
  const listener = vi.mocked(PROVIDER_REGISTRY_MOCK[event]).mock.calls[0]?.[0] as unknown as () => void;
  expect(listener).toBeDefined();

  listener();

  await vi.waitFor(() => {
    expect(API_SENDER_MOCK.send).toHaveBeenCalledWith(STATUS_BAR_PIN_CONSTANTS.PIN_OPTIONS_UPDATE, expect.any(Array));
  });
});
