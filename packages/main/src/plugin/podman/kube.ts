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

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadAll } from 'js-yaml';
import type { Headers, Pack } from 'tar-fs';
import tar from 'tar-fs';

/**
 * This function is a re-implementation of the imageNamePrefix on the podman repository
 * https://github.com/podman-container-tools/podman/blob/de856dab99ef8816392972347678fcb49ae57e50/pkg/domain/infra/abi/play.go#L1606
 * @param content
 */
export function getImageNamePrefix(content: string): string {
  let prefix: string = content;
  let split: string[] = prefix.split(':');
  if (split[0]) {
    prefix = split[0];
  }
  split = prefix.split('/');
  const index = split.length - 1;
  if (split[index]) {
    prefix = split[index];
  }
  split = prefix.split('@');
  if (split[0]) {
    prefix = split[0];
  }
  return prefix;
}

export class KubePlayContext {
  #initialized: boolean = false;
  #file: string | undefined;
  // context directory
  #context: string;

  // raw YAML content
  #content: string | undefined;
  // contexts
  #buildContexts: Map<string, string>;

  protected constructor(options: {
    file?: string;
    content?: string;
    context: string;
  }) {
    if (!options.file && !options.content) throw new Error('either a file or raw content must be provided');

    this.#file = options.file;
    this.#content = options.content;
    this.#context = options.context;

    this.#buildContexts = new Map();
  }

  static fromContent(content: string, context: string): KubePlayContext {
    return new KubePlayContext({
      content: content,
      context: context,
    });
  }

  static fromFile(file: string, context?: string): KubePlayContext {
    return new KubePlayContext({
      file: file,
      context: context ?? path.dirname(file),
    });
  }

  protected analyze(): void {
    if (!this.#content) throw new Error('KubePlayContext: error while analysing content: content cannot be undefined');
    const resources: unknown[] = loadAll(this.#content);

    // for each resource
    for (const resource of resources) {
      // ensure resource is valid object
      if (!resource || typeof resource !== 'object') throw new Error(`invalid resource`);

      // ensure kind property exists
      if (!('kind' in resource) || typeof resource.kind !== 'string')
        throw new Error(`invalid kubernetes resource: missing kind field`);

      // ignore non-pod resource
      if (resource.kind.toLowerCase() !== 'pod') continue;

      // ensure containers exists on pod resource
      if (!('spec' in resource) || !resource.spec || typeof resource.spec !== 'object')
        throw new Error(`invalid kubernetes resource: pod missing spec field`);
      if (
        !('containers' in resource.spec) ||
        typeof resource.spec.containers !== 'object' ||
        !Array.isArray(resource.spec.containers)
      )
        throw new Error(`invalid kubernetes resource: pod missing spec field`);

      for (const container of resource.spec.containers) {
        if (!('image' in container || typeof container.image !== 'string'))
          throw new Error(`invalid kubernetes resource in: pod has a container without defined image`);

        const image: string = container.image;
        const buildDirectory = path.join(this.#context, getImageNamePrefix(image));

        // search for containerfile in the build directory
        const containerfile: string | undefined = ['Containerfile', 'Dockerfile'].find(file =>
          existsSync(path.join(buildDirectory, file)),
        );
        if (!containerfile) continue;

        this.#buildContexts.set(image, buildDirectory);
      }
    }
  }

  build(): NodeJS.ReadableStream {
    if (!this.#initialized) throw new Error('KubePlayContext must be initialized');
    if (!this.#content) throw new Error('content is undefined');
    const content = this.#content;

    return tar.pack(this.#context, {
      finalize: false,
      entries: Array.from(this.#buildContexts.keys()),
      // reset ownership to root: the host uid/gid may not fit in the tar header or be mapped in the user namespace
      // https://github.com/podman-container-tools/podman/blob/54ba3be4c02d386160ddef59086b6f9acd9be26d/pkg/bindings/images/build.go#L1233
      map: (header: Headers): Headers => {
        header.uid = 0;
        header.gid = 0;
        return header;
      },
      finish(stream: Pack): void {
        // inside the tar we need a play.yaml file as per spec
        // https://docs.podman.io/en/latest/_static/api.html#tag/containers/operation/PlayKubeLibpod
        stream.entry({ name: `play.yaml` }, content);
        stream.finalize();
      },
    }) as unknown as NodeJS.ReadableStream;
  }

  async init(): Promise<void> {
    if (this.#file) {
      this.#content = await readFile(this.#file, 'utf8');
    }

    this.analyze();
    this.#initialized = true;
  }

  getBuildContexts(): string[] {
    if (!this.#initialized) throw new Error('KubePlayContext must be initialized');
    return Array.from(this.#buildContexts.values());
  }
}
