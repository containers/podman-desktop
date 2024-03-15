/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import { URL } from 'node:url';

import { app, shell } from 'electron';

import { securityRestrictionCurrentHandler } from './security-restrictions-handler.js';

/**
 * List of origins that you allow open INSIDE the application and permissions for each of them.
 *
 * In development mode you need allow open `VITE_DEV_SERVER_URL`
 */
const ALLOWED_ORIGINS_AND_PERMISSIONS = new Map<
  string,
  Set<
    | 'clipboard-read'
    | 'clipboard-sanitized-write'
    | 'media'
    | 'display-capture'
    | 'keyboardLock'
    | 'mediaKeySystem'
    | 'geolocation'
    | 'notifications'
    | 'midi'
    | 'midiSysex'
    | 'pointerLock'
    | 'fullscreen'
    | 'openExternal'
    | 'window-management'
    | 'window-placement'
    | 'idle-detection'
    | 'unknown'
  >
>(
  import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL
    ? [[new URL(import.meta.env.VITE_DEV_SERVER_URL).origin, new Set(['clipboard-sanitized-write'])]]
    : [],
);

/**
 * List of origins that you allow open IN BROWSER.
 * Navigation to origins below is possible only if the link opens in a new window
 *
 * @example
 * <a
 *   target="_blank"
 *   href="https://github.com/"
 * >
 */
const ALLOWED_EXTERNAL_ORIGINS = new Set<`https://${string}`>(['https://github.com']);

app.on('web-contents-created', (_, contents) => {
  /**
   * Block navigation to origins not on the allowlist.
   *
   * Navigation is a common attack vector. If an attacker can convince the app to navigate away
   * from its current page, they can possibly force the app to open web sites on the Internet.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
   */
  contents.on('will-navigate', (event, url) => {
    const { origin } = new URL(url);
    if (ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin)) {
      return;
    }

    // Prevent navigation
    event.preventDefault();

    const handler = securityRestrictionCurrentHandler.handler;

    // handled
    if (handler) {
      securityRestrictionCurrentHandler.handler?.(url).catch((error: unknown) => {
        console.error('Error in security restriction handler:', error);
      });
      return;
    }

    if (import.meta.env.DEV) {
      console.warn('Blocked navigating to an unallowed origin:', origin);
    }
  });

  /**
   * Block requested unallowed permissions.
   * By default, Electron will automatically approve all permission requests.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
   */
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const { origin } = new URL(webContents.getURL());

    const permissionGranted = !!ALLOWED_ORIGINS_AND_PERMISSIONS.get(origin)?.has(permission);
    callback(permissionGranted);

    if (!permissionGranted && import.meta.env.DEV) {
      console.warn(`${origin} requested permission for '${permission}', but was blocked.`);
    }
  });

  /**
   * Hyperlinks to allowed sites open in the default browser.
   *
   * The creation of new `webContents` is a common attack vector. Attackers attempt to convince the app to create new windows,
   * frames, or other renderer processes with more privileges than they had before; or with pages opened that they couldn't open before.
   * You should deny any unexpected window creation.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
   * @see https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-openexternal-with-untrusted-content
   */
  contents.setWindowOpenHandler(({ url }) => {
    const { origin } = new URL(url);

    // @ts-expect-error Type checking is performed in runtime
    if (ALLOWED_EXTERNAL_ORIGINS.has(origin)) {
      // Open default browser
      shell.openExternal(url).catch(console.error);
    } else if (import.meta.env.DEV) {
      console.warn('Blocked the opening of an unallowed origin:', origin);
    }

    // Prevent creating new window in application
    return { action: 'deny' };
  });
});
