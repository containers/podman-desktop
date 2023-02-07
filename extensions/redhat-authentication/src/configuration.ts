/**********************************************************************
 * Copyright (C) 2022 - 2023 Red Hat, Inc.
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

export interface AuthConfig {
  serviceId: string;
  authUrl: string;
  apiUrl: string;
  clientId: string;
  serverConfig: ServerConfig;
}

export interface ServerConfig {
  callbackPath: string;
  externalUrl: string;
  port?: number;
}

export const SSO_REDHAT = 'sso-redhat';
export type AuthType = 'sso-redhat';
const REDHAT_AUTH_URL = process.env.REDHAT_SSO_URL
  ? process.env.REDHAT_SSO_URL
  : 'https://sso.redhat.com/auth/realms/redhat-external/';
const KAS_API_URL = process.env.KAS_API_URL ? process.env.KAS_API_URL : 'https://api.openshift.com';
const CLIENT_ID = process.env.CLIENT_ID ? process.env.CLIENT_ID : 'vscode-redhat-account';

console.log('REDHAT_AUTH_URL: ' + REDHAT_AUTH_URL);
console.log('KAS_API_URL: ' + KAS_API_URL);
console.log('CLIENT_ID: ' + KAS_API_URL);
export async function getAuthConfig(): Promise<AuthConfig> {
  return {
    serviceId: 'redhat-account-auth',
    authUrl: REDHAT_AUTH_URL,
    apiUrl: KAS_API_URL,
    clientId: CLIENT_ID,
    serverConfig: await getServerConfig(SSO_REDHAT),
  };
}

export async function getServerConfig(type: AuthType): Promise<ServerConfig> {
  // if (process.env['CHE_WORKSPACE_ID']) {
  //     return getCheServerConfig(type);
  // }
  return getLocalServerConfig(type);
}

async function getLocalServerConfig(type: AuthType): Promise<ServerConfig> {
  return {
    callbackPath: `${type}-callback`,
    externalUrl: 'http://localhost',
  };
}
