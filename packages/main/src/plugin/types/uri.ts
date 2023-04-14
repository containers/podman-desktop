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
}
