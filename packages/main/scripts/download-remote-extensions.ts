/*********************************************************************
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
 ********************************************************************/
// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata';

import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import minimist from 'minimist';

import type { Certificates } from '/@/plugin/certificates.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import type { Proxy } from '/@/plugin/proxy.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import product from '/@product.json' with { type: 'json' };

/**
 * We create _dummy_ classes for the constructor of ImageRegistry
 * We do not use those classes when calling ImageRegistry#downloadAndExtractImage as the internal logic
 * uses different node_modules; those classes are needed for other things the class is doing
 */
const dummyApiSenderType = {
  send: (): void => {},
} as unknown as ApiSenderType;
const dummyTelemetry = {
  track: (): void => {},
} as unknown as Telemetry;
const dummyCertificate = {
  getAllCertificates: (): undefined => undefined,
} as unknown as Certificates;
const dummyProxy = {
  onDidUpdateProxy: (): void => {},
  onDidStateChange: (): void => {},
  isEnabled: (): boolean => false,
} as unknown as Proxy;

export interface RemoteExtension {
  name: string;
  oci: string;
}

export const OCI_ARG = 'oci';
export const NAME_ARG = 'name';
export const REGISTRY_USER_ARG = 'registry-user';
export const REGISTRY_SECRET_ARG = 'registry-secret';

export const DIGEST_FILENAME = '.digest';

export interface RegistryAuth {
  username: string;
  secret: string;
}

export interface DownloadOptions {
  destination: string;
  extension: RemoteExtension;
  auth?: RegistryAuth;
}

async function findExtensionDigest(extension: string): Promise<string | undefined> {
  try {
    return await readFile(join(extension, DIGEST_FILENAME), { encoding: 'utf-8' });
  } catch (_: unknown) {
    return undefined;
  }
}

export function findAuthEnvironment(registry: string): RegistryAuth | undefined {
  const prefix = `AUTH_${registry.replace(/[^a-zA-Z]/g, '_').toUpperCase()}`;
  const usernameKey = `${prefix}_USER`;
  const secretKey = `${prefix}_SECRET`;
  console.debug(`Lookup environment variable ${usernameKey} & ${secretKey}`);

  const usernameValue = process.env[usernameKey] ?? process.env['REMOTE_EXTENSIONS_AUTH_USER'];
  const secretValue = process.env[secretKey] ?? process.env['REMOTE_EXTENSIONS_AUTH_SECRET'];

  // if both undefined => ignore
  if (!usernameValue && !secretValue) return undefined;

  // if only one is defined => raise error
  if (!usernameValue || !secretValue) {
    throw new Error(
      `if one of ${usernameKey}/REMOTE_EXTENSIONS_AUTH_USER and ${secretKey}/REMOTE_EXTENSIONS_AUTH_SECRET is specified, both need to be defined.`,
    );
  }

  return {
    username: usernameValue,
    secret: secretValue,
  };
}

export async function downloadExtension(options: DownloadOptions): Promise<void> {
  const imageRegistry = new ImageRegistry(dummyApiSenderType, dummyTelemetry, dummyCertificate, dummyProxy);

  const registry = imageRegistry.extractRegistryServerFromImage(options.extension.oci);
  if (!registry) throw new Error(`cannot determine registry for image ${options.extension.oci}`);

  const auth = options.auth ?? findAuthEnvironment(registry);

  if (auth) {
    console.debug(`Configuring registry ${registry}`);

    imageRegistry.registerRegistry({
      source: 'scripts',
      serverUrl: registry,
      username: auth.username,
      secret: auth.secret,
    });
  }

  // tmp folder
  const tmpFolderPath = join(tmpdir(), options.extension.name);

  const finalPath = join(options.destination, options.extension.name);

  const { config } = await imageRegistry.getManifestFromImageName(options.extension.oci);
  if (!config) {
    throw new Error(
      `extension ${options.extension.name} has malformed content: the OCI image manifest should contains a "config" field`,
    );
  }
  if (!config.digest) {
    throw new Error(
      `extension ${options.extension.name} has malformed content: the OCI image manifest should contains a "config.digest" field`,
    );
  }

  // check if the extension is already downloaded
  if (existsSync(finalPath)) {
    const existingDigest = await findExtensionDigest(finalPath);
    if (existingDigest === config.digest) {
      console.log(`cache hit for ${options.extension.name} ${config.digest.substring(0, 18)}`);
      return;
    } else {
      console.log(`invalid digest for ${options.extension.name}, cleanup ${finalPath}`);
      await rm(finalPath, { recursive: true });
    }
  }

  await imageRegistry.downloadAndExtractImage(options.extension.oci, tmpFolderPath, event =>
    console.log(event.message),
  );

  if (!existsSync(join(tmpFolderPath, 'extension', 'package.json'))) {
    throw new Error(
      `extension ${options.extension.name} has malformed content: the OCI image should contains a "package.json" file in the extension folder`,
    );
  }

  // ensure the destination directory exists
  await mkdir(options.destination, { recursive: true });

  // rename tmp to destination
  await moveSafely(join(tmpFolderPath, 'extension'), finalPath);
  await writeFile(join(finalPath, DIGEST_FILENAME), config.digest, { encoding: 'utf-8' });
}

/**
 * On a platform where the tmpdir is not on the same device as the destination
 * the rename will fail
 */
async function moveSafely(src: string, dest: string): Promise<void> {
  try {
    await rename(src, dest);
  } catch (error: unknown) {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      throw error;
    }

    if (error.code !== 'EXDEV') {
      throw error;
    }

    await cp(src, dest, { recursive: true });
    await rm(src, { recursive: true });
  }
}

export function getRemoteExtensionFromProductJSON(): RemoteExtension[] {
  const raw = product as unknown;
  if (!raw || typeof raw !== 'object') {
    throw new Error(`malformed product.json: content is not object`);
  }
  if (!('extensions' in raw) || !raw.extensions || typeof raw.extensions !== 'object') {
    throw new Error(`malformed product.json: extensions property is not an object`);
  }
  if (!('remote' in raw.extensions) || !raw.extensions.remote || !Array.isArray(raw.extensions.remote)) {
    throw new Error(`malformed product.json: object extensions do not have a valid remote array`);
  }

  // validate each items
  raw.extensions.remote.forEach((extension, index) => {
    if (!extension) {
      throw new Error(`malformed product.json: extension at index ${index} is invalid`);
    }

    if (!('name' in extension) || typeof extension.name !== 'string') {
      throw new Error(`malformed product.json: extension at index ${index} must have name property as a valid string`);
    }

    if (!('oci' in extension) || typeof extension.oci !== 'string') {
      throw new Error(`malformed product.json: extension at index ${index} must have oci property as a valid string`);
    }
  });

  return raw.extensions.remote as RemoteExtension[];
}

/**
 * Parsing the args provided
 * the `--output` is mandatory and should be an absolute path
 * the `--oci` and `--name` are optional but should be both defined if specified
 */
export function parseArgs(args: string[]): { output: string; extension?: RemoteExtension; auth?: RegistryAuth } {
  const parsed = minimist(args);

  const output: string | undefined = parsed['output'];
  if (!output) throw new Error('missing output argument');

  if (!isAbsolute(output)) throw new Error('the output should be an absolute directory');

  // Access the --oci & --name properties
  const oci = parsed[OCI_ARG];
  const name = parsed[NAME_ARG];

  // Parse the --oci & --name args if provided
  let extension: RemoteExtension | undefined;
  if (oci || name) {
    if (!oci || !name) {
      throw new Error(`when specifying --${OCI_ARG} or --${NAME_ARG}, both should be provided as valid string`);
    }

    if (Array.isArray(oci) || Array.isArray(name)) {
      throw new Error(`when specifying --${OCI_ARG} and --${NAME_ARG}, only one is allowed`);
    }

    if (typeof oci !== 'string' || typeof name !== 'string') {
      throw new Error(`when specifying --${OCI_ARG} and --${NAME_ARG}, should be valid strings`);
    }
    extension = { oci, name };
  }

  // access the --registry-user & --registry-secret args
  const user = parsed[REGISTRY_USER_ARG];
  const secret = parsed[REGISTRY_SECRET_ARG];

  let auth: RegistryAuth | undefined;
  if (user || secret) {
    if (!user || !secret) {
      throw new Error(
        `when specifying --${REGISTRY_USER_ARG} or --${REGISTRY_SECRET_ARG}, both should be provided as valid string`,
      );
    }

    if (Array.isArray(user) || Array.isArray(secret)) {
      throw new Error(`when specifying --${REGISTRY_USER_ARG} and --${REGISTRY_SECRET_ARG}, only one is allowed`);
    }

    if (typeof user !== 'string' || typeof secret !== 'string') {
      throw new Error(`when specifying --${REGISTRY_USER_ARG} and --${REGISTRY_SECRET_ARG}, should be valid strings`);
    }

    auth = { username: user, secret: secret };
  }

  return {
    output,
    extension: extension,
    auth: auth,
  };
}

export async function main(args: string[]): Promise<void> {
  const { output, auth, extension } = parseArgs(args);

  // if an extension has been provided through CLI download it directly
  if (extension) {
    return downloadExtension({
      destination: output,
      auth,
      extension,
    });
  }

  // otherwise fallback to bundled product.json
  await Promise.all(
    getRemoteExtensionFromProductJSON().map(extension =>
      downloadExtension({
        destination: output,
        auth,
        extension,
      }),
    ),
  ).catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}

// do not start if we are in a VITEST env
if (!process.env['VITEST']) {
  main(process.argv.slice(2)).catch(console.error);
}
