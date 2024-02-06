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

import type { ContainerGroupInfoUI, ContainerInfoUI } from '../container/ContainerInfoUI';
import type { DeploymentUI } from '../deployments/DeploymentUI';
import type { ImageInfoUI } from '../image/ImageInfoUI';
import type { IngressUI } from '../ingresses-routes/IngressUI';
import type { RouteUI } from '../ingresses-routes/RouteUI';
import type { PodInfoUI } from '../pod/PodInfoUI';
import type { ServiceUI } from '../service/ServiceUI';
import type { VolumeInfoUI } from '../volume/VolumeInfoUI';

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function deleteSelection(
  itemsUI: (
    | DeploymentUI
    | PodInfoUI
    | ServiceUI
    | (IngressUI | RouteUI)
    | ImageInfoUI
    | VolumeInfoUI
    | ContainerGroupInfoUI
    | ContainerInfoUI
  )[],
  deleteCallback: (items: any) => Promise<void>,
) {
  const selectedItems = itemsUI.filter(item => item.selected);
  if (selectedItems.length === 0) {
    return;
  }

  if (Object.hasOwn(selectedItems[0], 'state')) {
    (selectedItems as ContainerInfoUI[]).forEach(item => (item.state = 'DELETING'));
  } else {
    (
      selectedItems as (
        | DeploymentUI
        | PodInfoUI
        | ServiceUI
        | (IngressUI | RouteUI)
        | ImageInfoUI
        | VolumeInfoUI
        | ContainerGroupInfoUI
      )[]
    ).forEach(item => (item.status = 'DELETING'));
  }

  Promise.all(
    selectedItems.map(async item => {
      try {
        await deleteCallback(item);
      } catch (e) {
        console.error(`error while removing ${item.name}`, e);
      }
    }),
  );
}
