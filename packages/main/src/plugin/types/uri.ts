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

import path, { join } from 'node:path';

import type { Uri as APIUri } from '@podman-desktop/api';

import { isWindows } from '/@/util.js';

/**
 * Represents a resource that can be manipulated. The resource is identified by a Uri.
 */
export class Uri {
  constructor(
    private _scheme: string,
    private _authority: string,
    private _path: string,
    private _query: string,
    private _fragment: string,
  ) {}

  static parse(value: string): Uri {
    const url = new URL(value);
    const search = url.search;
    let updatedSearch = '';
    if (search && search.length > 0) {
      // remove the ? character
      updatedSearch = search.substring(1);
    }
    return new Uri(url.protocol.substring(0, url.protocol.length - 1), url.host, url.pathname, updatedSearch, url.hash);
  }

  static file(path: string): Uri {
    return new Uri('file', '', path, '', '');
  }

  /**
   * Join a URI path with path fragments and normalizes the resulting path.
   *
   * @param uri The input URI.
   * @param pathFragment The path fragment to add to the URI path.
   * @returns The resulting URI.
   */
  static joinPath(uri: Uri, ...pathFragment: string[]): Uri {
    if (!uri.path) {
      throw new Error('cannot call joinPath on Uri without a path');
    }
    let newPath: string = join(uri.path, ...pathFragment);
    if (isWindows()) {
      // normalize windows path
      newPath = newPath.split(path.sep).join(path.posix.sep);
    }
    return uri.with({ path: newPath });
  }

  with(change?: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri {
    if (!change) {
      return this;
    }

    let { scheme, authority, path, query, fragment } = change;
    if (scheme === undefined) {
      scheme = this._scheme;
    }

    if (authority === undefined) {
      authority = this._authority;
    }

    if (path === undefined) {
      path = this._path;
    }
    if (query === undefined) {
      query = this._query;
    }

    if (fragment === undefined) {
      fragment = this._fragment;
    }

    if (
      scheme === this.scheme &&
      authority === this.authority &&
      path === this.path &&
      query === this.query &&
      fragment === this.fragment
    ) {
      return this;
    }

    return new Uri(scheme, authority, path, query, fragment);
  }

  get fsPath(): string {
    return this._path;
  }
  get scheme(): string {
    return this._scheme;
  }

  get authority(): string {
    return this._authority;
  }

  get path(): string {
    return this._path;
  }

  get query(): string {
    return this._query;
  }

  get fragment(): string {
    return this._fragment;
  }

  toString(): string {
    let link = `${this._scheme}://${this._authority}${this._path}`;
    if (this._query) {
      link = `${link}?${this._query}`;
    }
    if (this._fragment) {
      link = `${link}#${this._fragment}`;
    }
    return link;
  }

  static revive(serialized: APIUri): Uri {
    if (serialized instanceof Uri) {
      return serialized;
    }
    const serializedProps: Map<string, string> = Object.entries(serialized)
      .map(([key, value]) => [key.startsWith('_') ? key.substring(1) : key, value])
      .reduce((map, [key, value]) => {
        map.set(key, value);
        return map;
      }, new Map());
    return new Uri(
      serializedProps.get('scheme') ?? '',
      serializedProps.get('authority') ?? '',
      serializedProps.get('path') ?? '',
      serializedProps.get('query') ?? '',
      serializedProps.get('fragment') ?? '',
    );
  }
}
