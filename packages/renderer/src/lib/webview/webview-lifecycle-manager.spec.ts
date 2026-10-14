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

import type { IpcApi, WebviewElement } from './webview-lifecycle-manager';
import { WebviewLifecycleManager } from './webview-lifecycle-manager';

describe('WebviewLifecycleManager', () => {
  let manager: WebviewLifecycleManager;
  let mockIpcApi: IpcApi;
  let mockWebview: WebviewElement;
  let mockWebviewInfo: WebviewInfo;

  beforeEach(() => {
    mockIpcApi = {
      registerWebviewDevTools: vi.fn().mockResolvedValue(undefined),
      cleanupWebviewDevTools: vi.fn().mockResolvedValue(undefined),
    };

    mockWebview = {
      getWebContentsId: vi.fn().mockReturnValue(12345),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as WebviewElement;

    mockWebviewInfo = {
      id: 'test-webview-id',
      name: 'Test Webview',
      uuid: 'test-uuid',
    } as WebviewInfo;

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    manager = new WebviewLifecycleManager(mockIpcApi, mockWebviewInfo);
  });

  describe('constructor', () => {
    test('should initialize with provided webview info', () => {
      expect(manager.getWebviewInfo()).toBe(mockWebviewInfo);
    });

    test('should initialize without webview info', () => {
      const managerWithoutInfo = new WebviewLifecycleManager(mockIpcApi);
      expect(managerWithoutInfo.getWebviewInfo()).toBeUndefined();
    });
  });

  describe('updateWebviewInfo', () => {
    test('should update webview info', () => {
      const newWebviewInfo = { ...mockWebviewInfo, id: 'new-id' };
      manager.updateWebviewInfo(newWebviewInfo);
      expect(manager.getWebviewInfo()).toBe(newWebviewInfo);
    });

    test('should set webview info to undefined', () => {
      manager.updateWebviewInfo();
      expect(manager.getWebviewInfo()).toBeUndefined();
    });
  });

  describe('handleDomReady', () => {
    test('should extract and store webContentsId', () => {
      manager.handleDomReady(mockWebview);

      expect(mockWebview.getWebContentsId).toHaveBeenCalled();
      expect(manager.getWebContentsId()).toBe(12345);
    });

    test('should handle error when getting webContentsId fails', () => {
      const error = new Error('Failed to get webContentsId');
      vi.mocked(mockWebview.getWebContentsId).mockImplementation(() => {
        throw error;
      });

      manager.handleDomReady(mockWebview);

      expect(manager.getWebContentsId()).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Failed to get webview webContentsId:', error);
    });
  });

  describe('handleDevToolsOpened', () => {
    test('should call registerWebviewDevTools when webContentsId is available', () => {
      manager.handleDomReady(mockWebview);

      manager.handleDevToolsOpened();

      expect(mockIpcApi.registerWebviewDevTools).toHaveBeenCalledWith(12345);
    });

    test('should not call registerWebviewDevTools when webContentsId is not available', () => {
      manager.handleDevToolsOpened();

      expect(mockIpcApi.registerWebviewDevTools).not.toHaveBeenCalled();
    });

    test('should handle error from registerWebviewDevTools', () => {
      const error = new Error('IPC error');
      vi.mocked(mockIpcApi.registerWebviewDevTools).mockRejectedValue(error);

      manager.handleDomReady(mockWebview);

      manager.handleDevToolsOpened();
    });
  });

  describe('cleanup', () => {
    test('should call cleanupWebviewDevTools when both webContentsId and webview info are available', () => {
      manager.handleDomReady(mockWebview);

      manager.cleanup();

      expect(mockIpcApi.cleanupWebviewDevTools).toHaveBeenCalledWith(12345);
    });

    test('should not call cleanupWebviewDevTools when webContentsId is not available', () => {
      manager.cleanup();

      expect(mockIpcApi.cleanupWebviewDevTools).not.toHaveBeenCalled();
    });

    test('should not call cleanupWebviewDevTools when webview info is not available', () => {
      manager.updateWebviewInfo();
      manager.handleDomReady(mockWebview);

      manager.cleanup();

      expect(mockIpcApi.cleanupWebviewDevTools).not.toHaveBeenCalled();
    });

    test('should handle error from cleanupWebviewDevTools', () => {
      const error = new Error('Cleanup error');
      vi.mocked(mockIpcApi.cleanupWebviewDevTools).mockRejectedValue(error);

      manager.handleDomReady(mockWebview);

      manager.cleanup();
    });
  });

  describe('getWebContentsId', () => {
    test('should return undefined initially', () => {
      expect(manager.getWebContentsId()).toBeUndefined();
    });

    test('should return webContentsId after handleDomReady', () => {
      manager.handleDomReady(mockWebview);
      expect(manager.getWebContentsId()).toBe(12345);
    });
  });

  describe('getWebviewInfo', () => {
    test('should return current webview info', () => {
      expect(manager.getWebviewInfo()).toBe(mockWebviewInfo);
    });

    test('should return updated webview info', () => {
      const newInfo = { ...mockWebviewInfo, id: 'updated-id' };
      manager.updateWebviewInfo(newInfo);
      expect(manager.getWebviewInfo()).toBe(newInfo);
    });
  });
});
