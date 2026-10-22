/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

export interface DisplayItem {
  name: string;
  visible: boolean;
  /**
   * Position in the main nav (0-based). Contiguous among items present in the nav.
   * Undefined when the item is pinnable but not currently in the main nav.
   */
  index?: number;
  /**
   * True when this item leads to the page currently being displayed, so hiding it would
   * make the active page unreachable from the navigation bar. Set for the selected entry
   * and for any group containing it.
   */
  active?: boolean;
}

export interface DragPayload {
  /** Prefixed display name, e.g. "Settings > Resources" or "Kubernetes > Nodes". */
  name: string;
  link: string;
}
