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

import '@testing-library/jest-dom/vitest';

import type { ProviderInfo } from '@desktop-framework/api';
import { PROXY_CONFIG_KEYS, ProxyState } from '@desktop-framework/api';
import { Dropdown } from '@podman-desktop/ui-svelte';
import { fireEvent, render } from '@testing-library/svelte';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import PreferencesProxiesRendering from '/@/lib/preferences/PreferencesProxiesRendering.svelte';
import { PROXY_LABELS } from '/@/lib/preferences/proxy-state-labels';
import { manualProxySettings } from '/@/stores/manual-proxy-settings.svelte';

// mock the ui library
vi.mock(import('@podman-desktop/ui-svelte'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    Dropdown: vi.fn() as unknown as typeof Dropdown,
  };
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.getProviderInfos).mockResolvedValue([]);
  vi.mocked(window.getConfigurationProperties).mockResolvedValue({});
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
});

describe('dropdown', () => {
  test('dropdown should receive proper options', () => {
    render(PreferencesProxiesRendering);

    expect(Dropdown).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        options: Array.from(PROXY_LABELS.values()).map(label => ({
          value: label,
          label: label,
        })),
      }),
    );
  });

  test('dropdown value should match window#getProxyState', async () => {
    // mock disabled state
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_DISABLED);

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: PROXY_LABELS.get(ProxyState.PROXY_DISABLED),
        }),
      );
    });
  });

  test('dropdown#onChange should update value', async () => {
    // mock disabled state
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_DISABLED);

    render(PreferencesProxiesRendering);

    expect(Dropdown).toHaveBeenCalled();
    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];

    const label = PROXY_LABELS.get(ProxyState.PROXY_MANUAL);
    assert(label, 'proxy state label for manual should be defined');

    expect(onChange).toBeDefined();
    onChange?.(label);

    // dropdown component should have been updated with proxy manual value
    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: label,
        }),
      );
    });
  });

  test('update button should reflect change', async () => {
    // mock disabled state
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_DISABLED);

    const { getByRole } = render(PreferencesProxiesRendering);

    expect(Dropdown).toHaveBeenCalled();
    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];

    const label = PROXY_LABELS.get(ProxyState.PROXY_MANUAL);
    assert(label, 'proxy state label for manual should be defined');

    expect(onChange).toBeDefined();
    onChange?.(label);

    // dropdown component should have been updated with proxy manual value
    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: label,
        }),
      );
    });

    const updateBtn = getByRole('button', { name: 'Update' });
    await fireEvent.click(updateBtn);

    await vi.waitFor(() => {
      expect(window.setProxyState).toHaveBeenCalledWith(ProxyState.PROXY_MANUAL);
    });
  });

  test('dropdown#onChange should update value to Disabled', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalled();
    });

    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];
    const disabledLabel = PROXY_LABELS.get(ProxyState.PROXY_DISABLED);

    onChange?.(disabledLabel as unknown as string);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: disabledLabel,
        }),
      );
    });
  });

  test('dropdown#onChange should update value to System', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalled();
    });

    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];
    const systemLabel = PROXY_LABELS.get(ProxyState.PROXY_SYSTEM);

    onChange?.(systemLabel as unknown as string);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: systemLabel,
        }),
      );
    });
  });

  test('dropdown#onChange should handle invalid label gracefully', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_DISABLED);

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalled();
    });

    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];

    // call with invalid label
    expect(() => onChange?.('InvalidLabel')).not.toThrow();
    expect(() => onChange?.(undefined as unknown as string)).not.toThrow();
    expect(() => onChange?.(null as unknown as string)).not.toThrow();
    expect(() => onChange?.('')).not.toThrow();

    // state should remain unchanged (PROXY_DISABLED)
    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: PROXY_LABELS.get(ProxyState.PROXY_DISABLED),
        }),
      );
    });
  });

  test('dropdown#onChange should ignore case-mismatched labels', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_DISABLED);

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalled();
    });

    const [, { onChange }] = vi.mocked(Dropdown).mock.calls[0];

    // call with a wrong case (labels are 'Manual', not 'manual' or 'MANUAL')
    onChange?.('manual'); // lowercase
    onChange?.('MANUAL'); // uppercase

    // state should remain unchanged because labels don't match
    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          value: PROXY_LABELS.get(ProxyState.PROXY_DISABLED),
        }),
      );
    });
  });
});

describe('managed label', () => {
  test('should display managed label when http proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: true },
    });

    const { getByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(getByText('Managed by your organization')).toBeInTheDocument();
    });
  });

  test('should display managed label when https proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTPS]: { id: PROXY_CONFIG_KEYS.HTTPS, title: 'HTTPS Proxy', parentId: 'proxy', locked: true },
    });

    const { getByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(getByText('Managed by your organization')).toBeInTheDocument();
    });
  });

  test('should display managed label when no proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.NO_PROXY]: {
        id: PROXY_CONFIG_KEYS.NO_PROXY,
        title: 'No Proxy',
        parentId: 'proxy',
        locked: true,
      },
    });

    const { getByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(getByText('Managed by your organization')).toBeInTheDocument();
    });
  });

  test('should display multiple managed labels when multiple proxy settings are locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: true },
      [PROXY_CONFIG_KEYS.HTTPS]: { id: PROXY_CONFIG_KEYS.HTTPS, title: 'HTTPS Proxy', parentId: 'proxy', locked: true },
      [PROXY_CONFIG_KEYS.NO_PROXY]: {
        id: PROXY_CONFIG_KEYS.NO_PROXY,
        title: 'No Proxy',
        parentId: 'proxy',
        locked: true,
      },
    });

    const { getAllByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(getAllByText('Managed by your organization')).toHaveLength(3);
    });
  });

  test('should not display managed label when proxy settings are not locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: false },
      [PROXY_CONFIG_KEYS.HTTPS]: {
        id: PROXY_CONFIG_KEYS.HTTPS,
        title: 'HTTPS Proxy',
        parentId: 'proxy',
        locked: false,
      },
      [PROXY_CONFIG_KEYS.NO_PROXY]: {
        id: PROXY_CONFIG_KEYS.NO_PROXY,
        title: 'No Proxy',
        parentId: 'proxy',
        locked: false,
      },
    });

    const { queryByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(queryByText('Managed by your organization')).not.toBeInTheDocument();
    });
  });

  test('should disable input when proxy setting is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: true },
    });

    const { container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const httpProxyInput = container.querySelector('input#httpProxy');
      expect(httpProxyInput).toBeDisabled();
    });
  });

  test('should display managed value in input when http proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: true },
    });
    vi.mocked(window.getConfigurationValue).mockResolvedValue('http://managed-https-proxy.foobar.com:8080');

    const { container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const httpProxyInput = container.querySelector('input#httpProxy') as HTMLInputElement;
      expect(httpProxyInput.value).toBe('http://managed-https-proxy.foobar.com:8080');
    });
  });

  test('should display managed value in input when https proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.HTTPS]: { id: PROXY_CONFIG_KEYS.HTTPS, title: 'HTTPS Proxy', parentId: 'proxy', locked: true },
    });
    vi.mocked(window.getConfigurationValue).mockResolvedValue('http://managed-https-proxy.foobar.com:8080');

    const { container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const httpsProxyInput = container.querySelector('input#httpsProxy') as HTMLInputElement;
      expect(httpsProxyInput.value).toBe('http://managed-https-proxy.foobar.com:8080');
    });
  });

  test('should display managed value in input when no proxy is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.NO_PROXY]: {
        id: PROXY_CONFIG_KEYS.NO_PROXY,
        title: 'No Proxy',
        parentId: 'proxy',
        locked: true,
      },
    });
    vi.mocked(window.getConfigurationValue).mockResolvedValue('*.foobar.com,192.168.*.*');

    const { container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const noProxyInput = container.querySelector('input#noProxy') as HTMLInputElement;
      expect(noProxyInput.value).toBe('*.foobar.com,192.168.*.*');
    });
  });

  test('should display managed label when proxy.enabled is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.ENABLED]: {
        id: PROXY_CONFIG_KEYS.ENABLED,
        title: 'Proxy Enabled',
        parentId: 'proxy',
        locked: true,
      },
    });

    const { getByText } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(getByText('Managed by your organization')).toBeInTheDocument();
    });
  });

  test('should disable dropdown when proxy.enabled is locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.ENABLED]: {
        id: PROXY_CONFIG_KEYS.ENABLED,
        title: 'Proxy Enabled',
        parentId: 'proxy',
        locked: true,
      },
    });

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          disabled: true,
        }),
      );
    });
  });

  test('should not disable dropdown when proxy.enabled is not locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.ENABLED]: {
        id: PROXY_CONFIG_KEYS.ENABLED,
        title: 'Proxy Enabled',
        parentId: 'proxy',
        locked: false,
      },
    });

    render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          disabled: false,
        }),
      );
    });
  });

  test('large test: should display managed label next to dropdown and disable inputs when proxy settings are locked', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getConfigurationProperties).mockResolvedValue({
      [PROXY_CONFIG_KEYS.ENABLED]: {
        id: PROXY_CONFIG_KEYS.ENABLED,
        title: 'Proxy Enabled',
        parentId: 'proxy',
        locked: true,
      },
      [PROXY_CONFIG_KEYS.HTTP]: { id: PROXY_CONFIG_KEYS.HTTP, title: 'HTTP Proxy', parentId: 'proxy', locked: true },
      [PROXY_CONFIG_KEYS.HTTPS]: { id: PROXY_CONFIG_KEYS.HTTPS, title: 'HTTPS Proxy', parentId: 'proxy', locked: true },
      [PROXY_CONFIG_KEYS.NO_PROXY]: {
        id: PROXY_CONFIG_KEYS.NO_PROXY,
        title: 'No Proxy',
        parentId: 'proxy',
        locked: true,
      },
    });

    const { getAllByText, container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      // Should have 4 "Managed by your organization" labels (1 for dropdown + 3 for inputs)
      expect(getAllByText('Managed by your organization')).toHaveLength(4);

      // Dropdown should be disabled too (since we're also testing proxy.enabled locked)
      expect(Dropdown).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          disabled: true,
        }),
      );

      // All inputs should be disabled for this 'full test'
      const httpProxyInput = container.querySelector('input#httpProxy');
      const httpsProxyInput = container.querySelector('input#httpsProxy');
      const noProxyInput = container.querySelector('input#noProxy');
      expect(httpProxyInput).toBeDisabled();
      expect(httpsProxyInput).toBeDisabled();
      expect(noProxyInput).toBeDisabled();
    });
  });
});

describe('manual proxy settings persistence', () => {
  test('should restore manual settings from store when in System mode', async () => {
    manualProxySettings.settings = {
      httpProxy: 'http://saved-proxy:8080',
      httpsProxy: '',
      noProxy: 'localhost',
    };

    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_SYSTEM);
    vi.mocked(window.getProxySettings).mockResolvedValue({
      httpProxy: undefined,
      httpsProxy: undefined,
      noProxy: 'local,169.254/16',
    });

    const { container } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const httpInput = container.querySelector('input#httpProxy') as HTMLInputElement;
      expect(httpInput.value).toBe('http://saved-proxy:8080');
    });
  });

  test('should save settings to store when updating in Manual mode', async () => {
    vi.mocked(window.getProxyState).mockResolvedValue(ProxyState.PROXY_MANUAL);
    vi.mocked(window.getProxySettings).mockResolvedValue({
      httpProxy: '',
      httpsProxy: '',
      noProxy: '',
    });
    vi.mocked(window.setProxyState).mockResolvedValue(undefined);
    vi.mocked(window.updateProxySettings).mockResolvedValue(undefined);
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Dismiss' });

    manualProxySettings.settings = undefined;

    const { container, getByRole } = render(PreferencesProxiesRendering);

    await vi.waitFor(() => {
      const httpInput = container.querySelector('input#httpProxy') as HTMLInputElement;
      expect(httpInput).toBeInTheDocument();
      expect(httpInput).not.toBeDisabled();
    });

    const httpInput = container.querySelector('input#httpProxy') as HTMLInputElement;
    httpInput.value = 'http://new-proxy:8080';
    await fireEvent.input(httpInput);

    const updateBtn = getByRole('button', { name: 'Update' });
    await fireEvent.click(updateBtn);

    await vi.waitFor(() => {
      expect(manualProxySettings.settings?.httpProxy).toBe('http://new-proxy:8080');
    });
  });
});

describe('proxy update message', () => {
  beforeEach(() => {
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Dismiss' });
  });

  async function clickUpdate(getByRole: (role: string, options?: object) => HTMLElement): Promise<void> {
    const updateBtn = getByRole('button', { name: 'Update' });
    await fireEvent.click(updateBtn);
  }

  test('should show info message when no running connections', async () => {
    const { getByRole } = render(PreferencesProxiesRendering);
    await vi.waitFor(() => expect(window.getProxyState).toHaveBeenCalled());
    await clickUpdate(getByRole);

    await vi.waitFor(() => {
      expect(window.showMessageBox).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          message: 'Proxy settings have been applied.',
        }),
      );
    });
  });

  test('should warn about Podman machine restart for machine connections', async () => {
    vi.mocked(window.getProviderInfos).mockResolvedValue([
      {
        containerConnections: [{ status: 'started', vmType: { id: 'applehv', name: 'Apple HV' } }],
      } as unknown as ProviderInfo,
    ]);

    const { getByRole } = render(PreferencesProxiesRendering);
    await vi.waitFor(() => expect(window.getProxyState).toHaveBeenCalled());
    await clickUpdate(getByRole);

    await vi.waitFor(() => {
      expect(window.showMessageBox).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('restart the Podman machine'),
        }),
      );
    });
  });

  test('should warn about restarting containers for native connections', async () => {
    vi.mocked(window.getProviderInfos).mockResolvedValue([
      {
        containerConnections: [{ status: 'started', vmType: undefined }],
      } as unknown as ProviderInfo,
    ]);

    const { getByRole } = render(PreferencesProxiesRendering);
    await vi.waitFor(() => expect(window.getProxyState).toHaveBeenCalled());
    await clickUpdate(getByRole);

    await vi.waitFor(() => {
      expect(window.showMessageBox).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          message: expect.stringContaining('Running containers will need to be restarted'),
        }),
      );
    });
  });

  test('should include both warnings when machine and native connections are running', async () => {
    vi.mocked(window.getProviderInfos).mockResolvedValue([
      {
        containerConnections: [
          { status: 'started', vmType: { id: 'libkrun', name: 'LibKrun' } },
          { status: 'started', vmType: undefined },
        ],
      } as unknown as ProviderInfo,
    ]);

    const { getByRole } = render(PreferencesProxiesRendering);
    await vi.waitFor(() => expect(window.getProxyState).toHaveBeenCalled());
    await clickUpdate(getByRole);

    await vi.waitFor(() => {
      const call = vi.mocked(window.showMessageBox).mock.calls[0]?.[0];
      expect(call?.type).toBe('warning');
      expect(call?.message).toContain('restart the Podman machine');
      expect(call?.message).toContain('Running containers will need to be restarted');
    });
  });

  test('should not warn for stopped connections', async () => {
    vi.mocked(window.getProviderInfos).mockResolvedValue([
      {
        containerConnections: [{ status: 'stopped', vmType: { id: 'applehv', name: 'Apple HV' } }],
      } as unknown as ProviderInfo,
    ]);

    const { getByRole } = render(PreferencesProxiesRendering);
    await vi.waitFor(() => expect(window.getProxyState).toHaveBeenCalled());
    await clickUpdate(getByRole);

    await vi.waitFor(() => {
      expect(window.showMessageBox).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          message: 'Proxy settings have been applied.',
        }),
      );
    });
  });
});
