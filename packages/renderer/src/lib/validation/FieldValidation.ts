/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { writable } from 'svelte/store';
import validator from 'validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SvelteStore<T> = { subscribe: (run: (value: T) => any, invalidate?: any) => any };

interface Validation {
  dirty: boolean;
  valid: boolean;
  message?: string;
}

export type UpdateAction = {
  update(value: string): void;
};

export type ActivateFunction = (_node: unknown, binding: unknown) => UpdateAction;

export function createFieldValidator(
  ...validators: ((value: string) => [boolean, string])[]
): [SvelteStore<Validation>, ActivateFunction] {
  const validation: Validation = { dirty: false, valid: false, message: undefined };
  const writableObject = writable<Validation>(validation);
  const validator = buildValidator(validators);

  function action(_node: unknown, binding: unknown): UpdateAction {
    function validate(value: string, dirty: boolean): void {
      const result = validator(value, dirty);
      writableObject.set(result);
    }

    validate(String(binding), false);

    return {
      update(value: string): void {
        validate(value, value !== undefined);
      },
    };
  }

  const store: SvelteStore<Validation> = writableObject;
  const tuple: [SvelteStore<Validation>, ActivateFunction] = [store, action];
  return tuple;
}

function buildValidator(
  validators: ((value: string) => [boolean, string])[],
): (value: string, dirty: boolean) => Validation {
  return function validate(value: string, dirty: boolean): Validation {
    if (!validators || validators.length === 0) {
      return { dirty, valid: true };
    }

    const failing = validators.map(v => v(value)).find(value => value[0] !== true);

    if (!failing) {
      return { dirty, valid: true, message: '' };
    } else {
      return {
        dirty,
        valid: false,
        message: failing[1],
      };
    }
  };
}

export function requiredValidator(): (value: string) => [boolean, string] {
  return function required(value: string): [boolean, string] {
    const valid = value !== undefined && value !== '';
    const message = valid ? '' : 'Field is required';
    return [valid, message];
  };
}

export function urlValidator(): (value: string) => [boolean, string] {
  return function url(value: string): [boolean, string] {
    const valid = validator.isURL(value);
    const message = valid ? '' : 'Please enter a valid URL';
    return [valid, message];
  };
}
