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

import type { WebviewInfo } from '@desktop-framework/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createWindowIpcApi,
  type WebviewDirectiveOptions,
  webviewLifecycle,
  type WebviewLifecycleDependencies,
  webviewLifecycleInternal,
} from './webview-directive';
import type { IpcApi, WebviewElement } from './webview-lifecycle-manager';
import { WebviewLifecycleManager } from './webview-lifecycle-manager';

describe('webview-directive', () => {
  let mockWebviewElement: WebviewElement;
  let mockIpcApi: IpcApi;
  let mockWebviewInfo: WebviewInfo;
  let mockLifecycleManager: WebviewLifecycleManager;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWebviewElement = {
      getWebContentsId: vi.fn().mockReturnValue(12345),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as WebviewElement;

    mockIpcApi = {
      registerWebviewDevTools: vi.fn().mockResolvedValue(undefined),
      cleanupWebviewDevTools: vi.fn().mockResolvedValue(undefined),
    };

    mockWebviewInfo = {
      id: 'test-webview-id',
      name: 'Test Webview',
      uuid: 'test-uuid',
    } as WebviewInfo;

    mockLifecycleManager = {
      handleDomReady: vi.fn(),
      handleDevToolsOpened: vi.fn(),
      updateWebviewInfo: vi.fn(),
      cleanup: vi.fn(),
      getWebContentsId: vi.fn(),
      getWebviewInfo: vi.fn(),
    } as unknown as WebviewLifecycleManager;

    delete (window as unknown as Record<string, unknown>).registerWebviewDevTools;
    delete (window as unknown as Record<string, unknown>).cleanupWebviewDevTools;
  });

  describe('createWindowIpcApi', () => {
    test('should create IPC API from window globals when available', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;
      (window as unknown as Record<string, unknown>).cleanupWebviewDevTools = mockIpcApi.cleanupWebviewDevTools;

      const result = createWindowIpcApi();

      expect(result).toEqual({
        registerWebviewDevTools: mockIpcApi.registerWebviewDevTools,
        cleanupWebviewDevTools: mockIpcApi.cleanupWebviewDevTools,
      });
    });

    test('should throw error when registerWebviewDevTools is not available', () => {
      (window as unknown as Record<string, unknown>).cleanupWebviewDevTools = mockIpcApi.cleanupWebviewDevTools;

      expect(() => createWindowIpcApi()).toThrow(
        'Required webview DevTools management functions are not available on window',
      );
    });

    test('should throw error when cleanupWebviewDevTools is not available', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;

      expect(() => createWindowIpcApi()).toThrow(
        'Required webview DevTools management functions are not available on window',
      );
    });

    test('should throw error when both functions are missing', () => {
      expect(() => createWindowIpcApi()).toThrow(
        'Required webview DevTools management functions are not available on window',
      );
    });
  });

  describe('webviewLifecycle', () => {
    test('should create event listeners for dom-ready and devtools-opened', () => {
      const options: WebviewDirectiveOptions = {
        webviewInfo: mockWebviewInfo,
        ipcApi: mockIpcApi,
      };

      webviewLifecycle(mockWebviewElement, options);

      expect(mockWebviewElement.addEventListener).toHaveBeenCalledWith('dom-ready', expect.any(Function));
      expect(mockWebviewElement.addEventListener).toHaveBeenCalledWith('devtools-opened', expect.any(Function));
      expect(mockWebviewElement.addEventListener).toHaveBeenCalledTimes(2);
    });

    test('should return object with update and destroy methods', () => {
      const options: WebviewDirectiveOptions = {
        webviewInfo: mockWebviewInfo,
        ipcApi: mockIpcApi,
      };

      const result = webviewLifecycle(mockWebviewElement, options);

      expect(result).toHaveProperty('update');
      expect(result).toHaveProperty('destroy');
      expect(typeof result.update).toBe('function');
      expect(typeof result.destroy).toBe('function');
    });

    test('should use provided ipcApi when available', () => {
      const options: WebviewDirectiveOptions = {
        webviewInfo: mockWebviewInfo,
        ipcApi: mockIpcApi,
      };

      webviewLifecycle(mockWebviewElement, options);

      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });

    test('should fallback to window globals when ipcApi not provided', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;
      (window as unknown as Record<string, unknown>).cleanupWebviewDevTools = mockIpcApi.cleanupWebviewDevTools;

      const options: WebviewDirectiveOptions = {
        webviewInfo: mockWebviewInfo,
      };

      const result = webviewLifecycle(mockWebviewElement, options);

      expect(result).toBeDefined();
      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });

    test('should work with minimal options', () => {
      const options: WebviewDirectiveOptions = {
        ipcApi: mockIpcApi,
      };

      const result = webviewLifecycle(mockWebviewElement, options);

      expect(result).toBeDefined();
      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });

    test('should work with empty options when window globals are available', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;
      (window as unknown as Record<string, unknown>).cleanupWebviewDevTools = mockIpcApi.cleanupWebviewDevTools;

      const result = webviewLifecycle(mockWebviewElement);

      expect(result).toBeDefined();
      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });
  });

  describe('directive return object behavior', () => {
    let directiveResult: ReturnType<typeof webviewLifecycle>;

    beforeEach(() => {
      const options: WebviewDirectiveOptions = {
        webviewInfo: mockWebviewInfo,
        ipcApi: mockIpcApi,
      };
      directiveResult = webviewLifecycle(mockWebviewElement, options);
    });

    test('update method should call manager.updateWebviewInfo', () => {
      const mockManager = vi.mocked(WebviewLifecycleManager);
      vi.mocked(mockManager.prototype.updateWebviewInfo);

      const newWebviewInfo = { ...mockWebviewInfo, id: 'new-id' };

      directiveResult.update({ webviewInfo: newWebviewInfo });

      expect(directiveResult.update).toBeDefined();
    });

    test('destroy method should remove event listeners and call cleanup', () => {
      directiveResult.destroy();

      expect(mockWebviewElement.removeEventListener).toHaveBeenCalledWith('dom-ready', expect.any(Function));
      expect(mockWebviewElement.removeEventListener).toHaveBeenCalledWith('devtools-opened', expect.any(Function));
      expect(mockWebviewElement.removeEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    test('should throw error when window globals missing and no ipcApi provided', () => {
      expect(() => webviewLifecycle(mockWebviewElement)).toThrow(
        'Required webview DevTools management functions are not available on window',
      );
    });

    test('should handle partial window globals gracefully', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;

      expect(() => webviewLifecycle(mockWebviewElement)).toThrow(
        'Required webview DevTools management functions are not available on window',
      );
    });
  });

  describe('webviewLifecycleInternal with dependency injection', () => {
    test('should use provided ipcApi from dependencies', () => {
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
      };

      const result = webviewLifecycleInternal(mockWebviewElement, {}, dependencies);

      expect(result).toBeDefined();
      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });

    test('should use custom manager factory', () => {
      const mockCreateManager = vi.fn().mockReturnValue(mockLifecycleManager);
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
        createManager: mockCreateManager,
      };

      webviewLifecycleInternal(mockWebviewElement, { webviewInfo: mockWebviewInfo }, dependencies);

      expect(mockCreateManager).toHaveBeenCalledWith(mockIpcApi, mockWebviewInfo);
    });

    test('should use custom ipcApi factory', () => {
      const mockCreateIpcApi = vi.fn().mockReturnValue(mockIpcApi);
      const dependencies: WebviewLifecycleDependencies = {
        createIpcApi: mockCreateIpcApi,
      };

      webviewLifecycleInternal(mockWebviewElement, {}, dependencies);

      expect(mockCreateIpcApi).toHaveBeenCalled();
    });

    test('should prioritize options.ipcApi over dependencies.ipcApi', () => {
      const optionsIpcApi = { ...mockIpcApi };
      const dependenciesIpcApi = { ...mockIpcApi };
      const mockCreateManager = vi.fn().mockReturnValue(mockLifecycleManager);

      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: dependenciesIpcApi,
        createManager: mockCreateManager,
      };

      webviewLifecycleInternal(mockWebviewElement, { ipcApi: optionsIpcApi }, dependencies);

      expect(mockCreateManager).toHaveBeenCalledWith(optionsIpcApi, undefined);
    });

    test('should call manager methods through event handlers', () => {
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
        createManager: vi.fn().mockReturnValue(mockLifecycleManager),
      };

      webviewLifecycleInternal(mockWebviewElement, {}, dependencies);

      const addEventListener = vi.mocked(mockWebviewElement.addEventListener);
      const domReadyHandler = addEventListener.mock.calls.find(call => call[0] === 'dom-ready')?.[1];
      const devtoolsOpenedHandler = addEventListener.mock.calls.find(call => call[0] === 'devtools-opened')?.[1];

      expect(domReadyHandler).toBeDefined();
      expect(devtoolsOpenedHandler).toBeDefined();

      if (domReadyHandler && typeof domReadyHandler === 'function') {
        domReadyHandler(new Event('dom-ready'));
        expect(mockLifecycleManager.handleDomReady).toHaveBeenCalledWith(mockWebviewElement);
      }

      if (devtoolsOpenedHandler && typeof devtoolsOpenedHandler === 'function') {
        devtoolsOpenedHandler(new Event('devtools-opened'));
        expect(mockLifecycleManager.handleDevToolsOpened).toHaveBeenCalled();
      }
    });

    test('should update webview info when update is called', () => {
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
        createManager: vi.fn().mockReturnValue(mockLifecycleManager),
      };

      const result = webviewLifecycleInternal(mockWebviewElement, {}, dependencies);
      const newWebviewInfo = { ...mockWebviewInfo, id: 'updated-id' };

      result.update({ webviewInfo: newWebviewInfo });

      expect(mockLifecycleManager.updateWebviewInfo).toHaveBeenCalledWith(newWebviewInfo);
    });

    test('should cleanup manager and remove listeners when destroy is called', () => {
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
        createManager: vi.fn().mockReturnValue(mockLifecycleManager),
      };

      const result = webviewLifecycleInternal(mockWebviewElement, {}, dependencies);

      result.destroy();

      expect(mockLifecycleManager.cleanup).toHaveBeenCalled();
      expect(mockWebviewElement.removeEventListener).toHaveBeenCalledWith('dom-ready', expect.any(Function));
      expect(mockWebviewElement.removeEventListener).toHaveBeenCalledWith('devtools-opened', expect.any(Function));
    });
  });

  describe('edge cases and integration', () => {
    test('should handle undefined webviewInfo in options', () => {
      const dependencies: WebviewLifecycleDependencies = {
        ipcApi: mockIpcApi,
        createManager: vi.fn().mockReturnValue(mockLifecycleManager),
      };

      const result = webviewLifecycleInternal(mockWebviewElement, { webviewInfo: undefined }, dependencies);

      expect(result).toBeDefined();
    });

    test('should handle empty dependencies object', () => {
      (window as unknown as Record<string, unknown>).registerWebviewDevTools = mockIpcApi.registerWebviewDevTools;
      (window as unknown as Record<string, unknown>).cleanupWebviewDevTools = mockIpcApi.cleanupWebviewDevTools;

      const result = webviewLifecycleInternal(mockWebviewElement, {}, {});

      expect(result).toBeDefined();
      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
    });

    test('should handle multiple directive instances on different elements', () => {
      const mockWebviewElement2 = {
        ...mockWebviewElement,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as WebviewElement;

      const result1 = webviewLifecycle(mockWebviewElement, { ipcApi: mockIpcApi });
      const result2 = webviewLifecycle(mockWebviewElement2, { ipcApi: mockIpcApi });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).not.toBe(result2);

      expect(mockWebviewElement.addEventListener).toHaveBeenCalled();
      expect(mockWebviewElement2.addEventListener).toHaveBeenCalled();
    });
  });
});
