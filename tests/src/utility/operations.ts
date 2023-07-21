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

import type { Page } from 'playwright';
import { NavigationBar } from '../model/workbench/navigation';
import { waitWhile } from './wait';

/**
 * Stop and delete container defined by its name
 * @param page playwright's page object
 * @param name name of container to be removed
 */
export async function deleteContainer(page: Page, name: string) {
  const navigationBar = new NavigationBar(page);
  const containers = await navigationBar.openContainers();
  const container = await containers.getContainerRowByName(name);
  // check for container existence
  if (container === undefined) {
    console.log(`container '${name}' does not exist, skipping...`);
  } else {
    // stop container first, might not be running
    try {
      const stopButton = container.getByRole('button').and(container.getByLabel('Stop Container'));
      await stopButton.waitFor({ state: 'visible', timeout: 2000 });
      await stopButton.click();
    } catch (error) {
      // omit the exception
    }
    // delete the container
    const deleteButton = container.getByRole('button').and(container.getByLabel('Delete Container'));
    await deleteButton.click();
    // wait for container to disappear
    try {
      console.log(`Waiting for container to get deleted ...`);
      await waitWhile(async () => {
        const result = await containers.getContainerRowByName(name);
        return result ? true : false;
      }, 5000);
    } catch (error) {
      if ((error as Error).message.indexOf('Containers page is empty') < 0) {
        throw Error(`Error waiting for container '${name}' to get removed, ${error}`);
      }
    }
  }
}

/**
 * Delete image defined by its name
 * @param page playwright's page object
 * @param name name of image to be removed
 */
export async function deleteImage(page: Page, name: string) {
  const navigationBar = new NavigationBar(page);
  const images = await navigationBar.openImages();
  const row = await images.getImageRowByName(name);
  if (row === undefined) {
    console.log(`image '${name}' does not exist, skipping...`);
  } else {
    const deleteButton = row.getByRole('button', { name: 'Delete Image' });
    if (await deleteButton.isEnabled({ timeout: 2000 })) {
      await deleteButton.click();
    } else {
      throw Error(`Cannot delete image ${name}, because it is in use`);
    }
    // wait for image to disappear
    try {
      console.log(`image deleting, waiting...`);
      await waitWhile(
        async () => {
          const images = await new NavigationBar(page).openImages();
          const result = await images.getImageRowByName(name);
          return result ? true : false;
        },
        10000,
        1000,
        false,
      );
    } catch (error) {
      if ((error as Error).message.indexOf('Images page is empty') < 0) {
        throw Error(`Error waiting for image '${name}' to get removed, ${error}`);
      }
    }
  }
}
