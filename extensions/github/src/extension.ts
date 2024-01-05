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

import * as extensionApi from '@podman-desktop/api';
import type {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
} from '@podman-desktop/api';
import { window } from '@podman-desktop/api';
import { Octokit } from '@octokit/rest';

class GithubSession implements AuthenticationSession {
  id: string;
  accessToken: string;
  account: extensionApi.AuthenticationSessionAccountInformation;
  scopes: readonly string[];

  constructor(
    id: string,
    accessToken: string,
    account: extensionApi.AuthenticationSessionAccountInformation,
    scopes: readonly string[],
  ) {
    this.id = id;
    this.accessToken = accessToken;
    this.account = account;
    this.scopes = scopes;
  }
}

export class GitHubProvider implements AuthenticationProvider {
  private _onDidChangeSession =
    new extensionApi.EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  onDidChangeSessions: extensionApi.Event<extensionApi.AuthenticationProviderAuthenticationSessionsChangeEvent> =
    this._onDidChangeSession.event;

  protected sessions: GithubSession[] = [];

  constructor(private telemetryLogger: extensionApi.TelemetryLogger) {}

  async getSessions(scopes?: string[]): Promise<readonly extensionApi.AuthenticationSession[]> {
    if (scopes?.length > 0) throw new Error('Scopes are not supported.');
    return this.sessions;
  }

  async createSession(scopes: string[]): Promise<extensionApi.AuthenticationSession> {
    if (scopes.length > 0) throw new Error('Scopes are not supported.');

    // We only support one session
    if (this.sessions.length) return this.sessions[0];

    // Get the access token from the preferences
    const accessToken = getGitHubAccessToken();

    // Check if the token exists
    if (accessToken === undefined || accessToken.length === 0) {
      await window.showErrorMessage('No access token provided.');
      throw new Error('No access token provided.');
    }

    // Validate the token
    // (1) Create an Octokit client with the access token
    // (2) Get the /user endpoint to get user information (username email etc.)
    const octokit = new Octokit({
      auth: accessToken,
    });
    const { data } = await octokit.users.getAuthenticated();

    // Create a session with our valid access token
    const session = new GithubSession(
      `${data.id}`,
      accessToken,
      {
        id: `${data.id}`,
        label: `${data.name}`,
      },
      [],
    );

    this.telemetryLogger.logUsage('github-create-auth-session');

    // Fire events
    this._onDidChangeSession.fire({
      added: [session],
    });

    // Store the session
    this.sessions.push(session);

    return session;
  }
  async removeSession(sessionId: string): Promise<void> {
    const removed = this.sessions.filter(session => session.id === sessionId);
    this._onDidChangeSession.fire({
      removed: removed,
    });
    this.sessions = this.sessions.filter(session => session.id !== sessionId);
  }
}


export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const telemetryLogger = extensionApi.env.createTelemetryLogger();
  const authProvider = new GitHubProvider(telemetryLogger);

  // Register the AuthenticationProvider
  const disposable = extensionApi.authentication.registerAuthenticationProvider('github', 'GitHub', authProvider, {
    images: {
      icon: {
        light: './logo-light.png',
        dark: './logo-dark.png',
      },
      logo: {
        light: './logo-light.png',
        dark: './logo-dark.png',
      },
    },
  });

  // If we have a defined GitHub preference access token, let's create the session
  if (getGitHubAccessToken()) {
    try {
      await authProvider.createSession([]);
    } catch (e) {
      await window.showErrorMessage(`GitHub access token is not valid.`);
      console.error(e);
    }
  }
}

export function deactivate(): void {
  disposable?.dispose();
}

export function getGitHubAccessToken(): string | undefined {
  return extensionApi.configuration.getConfiguration('github').get('token');
}
