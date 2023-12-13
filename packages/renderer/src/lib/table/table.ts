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
export interface ColumnInformation<Type, RenderType = Type> {
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
   * Map the source object to another type for rendering. Allows
   * easier reuse and sharing of renderers by converting to simple
   * types (e.g. rendering 'string' instead of 'type.name') or
   * converting to a different type.
   */
  readonly renderMapping?: (object: Type) => RenderType;

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

  /**
   * The 'natural' or initial sort direction. Most columns are
   * naturally sorted in ascending order and do not need to
   * specify this value - e.g. names are sorted alphabetically.
   *
   * Columns that are naturally sorted in descending order -
   * e.g. file sizes or 'number of children' by biggest first -
   * can set this value to change the initial sort direction.
   *
   * Defaults to 'ascending'.
   */
  readonly initialOrder?: 'ascending' | 'descending';

  /**
   * By default, columns are limited to rendering within their
   * own cell to stop long or extraneous content (e.g. long
   * user-provided names) from interfering with other columns.
   * More advanced column renderers that need to render outside
   * of their cells (e.g. with popup menus or tooltips) can use
   * this property to allow this behaviour.
   *
   * Defaults to 'false'.
   */
  readonly overflow?: boolean;
}

/**
 * A table Column.
 */
export class Column<Type, RenderType = Type> {
  constructor(
    readonly title: string,
    readonly info: ColumnInformation<Type, RenderType>,
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
