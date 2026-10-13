/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { Locator, Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { handleConfirmationDialog } from '/@/utility/operations';

import { BasePage } from './base-page';

export class TasksPage extends BasePage {
  readonly tasksManagerWindow: Locator;
  readonly header: Locator;
  readonly heading: Locator;
  readonly clearAllButton: Locator;
  readonly closeButton: Locator;
  readonly tasksSearchBar: Locator;
  readonly tasksSearchInput: Locator;
  readonly tasksSearchClearButton: Locator;
  readonly allTasksButton: Locator;
  readonly inProgressTasksButton: Locator;
  readonly successTasksButton: Locator;
  readonly failureTasksButton: Locator;
  readonly canceledTasksButton: Locator;
  readonly content: Locator;
  readonly noTasksPlaceholder: Locator;
  readonly taskListHeader: Locator;
  readonly selectAllTasksCheckbox: Locator;
  readonly sortByName: Locator;
  readonly sortByProgress: Locator;
  readonly sortByAge: Locator;
  readonly taskList: Locator;

  constructor(page: Page) {
    super(page);
    this.tasksManagerWindow = page.getByRole('region', { name: 'Tasks' });
    this.header = this.tasksManagerWindow.getByRole('region', { name: 'header' });
    this.heading = this.header.getByText('Tasks');
    this.clearAllButton = this.header.getByRole('button', { name: 'Clear all' });
    this.closeButton = this.header.getByRole('button', { name: 'Close' });
    this.tasksSearchBar = this.tasksManagerWindow.getByRole('region', { name: 'search' });
    this.tasksSearchInput = this.tasksSearchBar.getByLabel('search Tasks');
    this.tasksSearchClearButton = this.tasksSearchBar.getByRole('button', { name: 'clear' });
    this.allTasksButton = this.tasksManagerWindow.getByRole('button', { name: 'All', exact: true });
    this.inProgressTasksButton = this.tasksManagerWindow.getByRole('button', { name: 'In-Progress' });
    this.successTasksButton = this.tasksManagerWindow.getByRole('button', { name: 'Success' });
    this.failureTasksButton = this.tasksManagerWindow.getByRole('button', { name: 'Failure' });
    this.canceledTasksButton = this.tasksManagerWindow.getByRole('button', { name: 'Canceled' });
    this.content = this.tasksManagerWindow.getByRole('region', { name: 'content' });
    this.noTasksPlaceholder = this.content.getByRole('table', { name: 'No active tasks' });
    this.taskListHeader = this.content.getByRole('rowgroup').nth(0);
    this.selectAllTasksCheckbox = this.taskListHeader.getByRole('checkbox', { name: 'Toggle all' });
    this.sortByName = this.taskListHeader.getByRole('columnheader', { name: 'Name' });
    this.sortByProgress = this.taskListHeader.getByRole('columnheader', { name: 'Progress' });
    this.sortByAge = this.taskListHeader.getByRole('columnheader', { name: 'Age' });
    this.taskList = this.content.getByRole('rowgroup').nth(1);
  }

  async showAllTasks(): Promise<void> {
    await playExpect(this.tasksManagerWindow).toBeVisible();
    await playExpect(this.allTasksButton).toBeVisible();
    await this.allTasksButton.click();
    await playExpect(this.taskList).toBeVisible();
  }

  async cancelLatestTask(): Promise<void> {
    const cancelButton = this.taskList.getByRole('button', { name: 'Cancel task' }).first();
    await playExpect(cancelButton).toBeEnabled();
    await cancelButton.click();
    await handleConfirmationDialog({ page: this.page, dialogTitle: 'Cancel Task?', buttonName: 'Cancel Task' });
    await handleConfirmationDialog({ page: this.page, dialogTitle: 'Long task example', buttonName: 'Dismiss' });
  }

  async getStatusForLatestTask(): Promise<string> {
    const statusLocator = this.taskList.getByRole('status').first();
    const count = await this.taskList.getByRole('status').count();
    if (count === 0) {
      return '';
    }
    return (await statusLocator.textContent({ timeout: 2_000 })) ?? '';
  }

  async clearAllTasks(): Promise<void> {
    await playExpect(this.clearAllButton).toBeEnabled({ timeout: 10_000 });
    await this.clearAllButton.click();
  }

  async awaitTaskCompletion(taskName: string, status = 'completed', timeout = 60_000): Promise<void> {
    const taskRow = this.getTaskRowByName(taskName);
    const taskStatus = taskRow.getByRole('status');

    await playExpect(taskRow).toBeVisible();
    // a task in progress displays a progress bar, its status is displayed once completed
    await playExpect(taskStatus).toBeVisible({ timeout: timeout });
    await playExpect(taskStatus).toContainText(status, { timeout: timeout });
  }

  async navigateToTask(taskName: string): Promise<void> {
    const taskRow = this.getTaskRowByName(taskName);
    const taskLink = taskRow.getByRole('button', { name: 'View action' });

    await playExpect(taskRow).toBeVisible();
    await playExpect(taskLink).toBeVisible();
    await taskLink.click();
  }

  async removeTaskFromList(taskName: string): Promise<void> {
    const taskRow = this.getTaskRowByName(taskName);
    const deleteTaskButton = taskRow.getByRole('button', { name: 'Archive/delete completed task' });

    await playExpect(taskRow).toBeVisible();
    await playExpect(deleteTaskButton).toBeVisible();
    await deleteTaskButton.click();
    await playExpect(taskRow).not.toBeVisible();
  }

  async getTaskRowCount(): Promise<number> {
    return this.taskList.getByRole('row').count();
  }

  async searchTasks(query: string): Promise<void> {
    await playExpect(this.tasksSearchInput).toBeVisible();
    await this.tasksSearchInput.fill(query);
    await playExpect(this.tasksSearchInput).toHaveValue(query);
  }

  async clearSearch(): Promise<void> {
    await playExpect(this.tasksSearchClearButton).toBeVisible();
    await this.tasksSearchClearButton.click();
    await playExpect(this.tasksSearchInput).toHaveValue('');
  }

  private getTaskRowByName(taskName: string): Locator {
    return this.taskList.getByRole('row', { name: taskName });
  }
}
