/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
 * Options to be used when creating a Column.
 */
export interface ColumnInformation<Type> {
  /**
   * Column alignment, one of 'left', 'center', or 'right'.
   *
   * Defaults to 'left' alignment.
   */
  readonly align?: 'left' | 'center' | 'right';

  /**
   * Column width, typically in pixels or fractional units (fr).
   *
   * Defaults to '1fr'.
   */
  readonly width?: string;

  /**
   * Svelte component, renderer for each cell in the column.
   * The component must have a property 'object' that has the
   * same type as the Column.
   */
  readonly renderer?: any;

  /**
   * Set a comparator used to sort the data by the values in this column.
   *
   * @param comparator
   */
  readonly comparator?: (object1: Type, object2: Type) => number;
}

/**
 * A table Column.
 */
export class Column<Type> {
  constructor(
    readonly title: string,
    readonly info: ColumnInformation<Type>,
  ) {}
}

/**
 * Options to be used when creating a Row.
 */
export interface RowInformation<Type> {
  /**
   * Returns true if a row can be selested, and false otherwise.
   */
  readonly selectable?: (object: Type) => boolean;

  /**
   * Tooltip text to show when row selection is disabled.
   */
  readonly disabledText?: string;
}

/**
 * A table row.
 */
export class Row<Type> {
  constructor(readonly info: RowInformation<Type>) {}
}
