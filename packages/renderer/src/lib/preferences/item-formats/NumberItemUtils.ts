/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export interface NumericValue {
  valid: boolean;
  error?: string;
}

export function checkNumericValueValid(record: IConfigurationPropertyRecordedSchema, value: number): NumericValue {
  if (isNaN(value)) {
    return {
      valid: false,
      error: `Expecting a number. The value cannot be less than ${record.minimum}${
        record.maximum ? ` or greater than ${record.maximum}` : ''
      }`,
    };
  }
  if (record.maximum && typeof record.maximum === 'number' && value > record.maximum) {
    return {
      valid: false,
      error: `The value cannot be greater than ${record.maximum}`,
    };
  }
  if (record.minimum && typeof record.minimum === 'number' && value < record.minimum) {
    return {
      valid: false,
      error: `The value cannot be less than ${record.minimum}`,
    };
  }
  return {
    valid: true,
  };
}
