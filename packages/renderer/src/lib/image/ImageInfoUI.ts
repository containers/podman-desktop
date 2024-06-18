/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type { ViewContributionBadgeValue } from '/@api/view-info';

export interface ImageInfoUI {
  id: string;
  shortId: string;
  name: string;
  engineId: string;
  engineName: string;
  tag: string;
  createdAt: number;
  age: string;
  size: number;
  humanSize: string;
  // fully qualified tag of the image (should be one of the RepoTags field encoded with base64)
  // no tag, we encode <none>
  base64RepoTag: string;
  selected: boolean;
  status: 'USED' | 'UNUSED' | 'DELETING';
  icon: any;
  labels?: { [label: string]: string };
  badges: ViewContributionBadgeValue[];
  children?: ImageInfoUI[];
  isManifest?: boolean;
  digest?: string;
}
