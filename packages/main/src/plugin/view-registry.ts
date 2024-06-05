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
import type { ViewContribution, ViewInfoUI } from '/@api/view-info.js';

import { Disposable } from './types/disposable.js';

export class ViewRegistry {
  private extViewContribution: Map<string, Map<string, ViewContribution[]>>;

  constructor() {
    this.extViewContribution = new Map();
  }

  registerView(extensionId: string, viewId: string, contribution: ViewContribution): void {
    const view = this.extViewContribution.get(extensionId) ?? new Map();
    const contributions = view.get(viewId) ?? [];
    contributions.push(contribution);
    view.set(viewId, contributions);
    this.extViewContribution.set(extensionId, view);
  }

  registerViews(extensionId: string, views: { [key: string]: ViewContribution[] }): Disposable {
    // register each view contribution
    Object.entries(views).forEach(([viewId, viewContributions]) => {
      viewContributions.forEach(viewContribution => {
        if (!viewContribution.when) {
          console.warn(`When clause is empty for view ${viewId} of extension ${extensionId}.`);
          return;
        }
        this.registerView(extensionId, viewId, viewContribution);
      });
    });

    return Disposable.create(() => {
      this.unregisterViews(extensionId);
    });
  }

  unregisterViews(extensionId: string): void {
    this.extViewContribution.delete(extensionId);
  }

  listViewsContributions(): ViewInfoUI[] {
    const listViewInfoUI: ViewInfoUI[] = [];
    this.extViewContribution.forEach((value, extension) => {
      value.forEach((contributions, view) => {
        contributions.forEach(contribution => {
          listViewInfoUI.push({
            value: contribution,
            extensionId: extension,
            viewId: view,
          });
        });
      });
    });
    return listViewInfoUI;
  }

  fetchViewsContributions(extensionId: string): ViewInfoUI[] {
    const listViewInfoUI: ViewInfoUI[] = [];
    const viewContributions = this.extViewContribution.get(extensionId);
    if (!viewContributions) {
      return listViewInfoUI;
    }
    viewContributions.forEach((contributions, view) => {
      contributions.forEach(contribution => {
        listViewInfoUI.push({
          value: contribution,
          extensionId: extensionId,
          viewId: view,
        });
      });
    });
    return listViewInfoUI;
  }
}
