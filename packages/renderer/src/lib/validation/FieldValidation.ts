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

interface Validation {
  dirty: boolean;
  valid: boolean;
  message?: string;
}

export function createFieldValidator(...validators) {
  const { subscribe, set } = writable({ dirty: false, valid: false, message: null } as Validation);
  const validator = buildValidator(validators);

  function action(node, binding) {
    function validate(value, dirty) {
      const result = validator(value, dirty);
      set(result);
    }

    validate(binding, false);

    return {
      update(value) {
        validate(value, value !== undefined);
      },
    };
  }

  return [{ subscribe }, action];
}

function buildValidator(validators) {
  return function validate(value, dirty) {
    if (!validators || validators.length === 0) {
      return { dirty, valid: true };
    }

    const failing = validators.find(v => v(value) !== true);

    return {
      dirty,
      valid: !failing,
      message: failing && failing(value),
    } as Validation;
  };
}

export function requiredValidator() {
  return function required(value) {
    return (value !== undefined && value !== '') || 'Field is required';
  };
}

export function urlValidator() {
  return function url(value) {
    return (
      (value &&
        !!value.match(
          /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,9}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        )) ||
      'Please enter a valid URL'
    );
  };
}
