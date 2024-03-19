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
import type { Uri as APIUri } from '@podman-desktop/api';

export class Uri {
  private constructor(
    private _scheme: string,
    private _authority: string,
    private _path: string,
    private _query: string,
    private _fragment: string,
  ) {}

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

  with(_change?: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri {
    throw new Error('unsupported');
  }

  toString(): string {
    throw new Error('unsupported');
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
