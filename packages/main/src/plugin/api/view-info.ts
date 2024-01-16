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
export type ViewContribution = ViewContributionIcon | ViewContributionBadge;

export interface ViewContributionIcon {
  when: string | undefined;
  icon: string;
}

export interface ViewContributionBadge {
  when: string | undefined;
  badge: ViewContributionBadgeValue;
}

export interface ViewContributionBadgeValue {
  label: string;
  color?: string | { light: string; dark: string };
}

export interface ViewInfoUI {
  extensionId: string;
  viewId: string;
  value: ViewContributionIcon | ViewContributionBadge;
}

export function isViewContributionIcon(
  value: ViewContributionIcon | ViewContributionBadge,
): value is ViewContributionIcon {
  return (value as ViewContributionIcon).icon !== undefined;
}

export function isViewContributionBadge(
  value: ViewContributionIcon | ViewContributionBadge,
): value is ViewContributionBadge {
  return (value as ViewContributionBadge).badge !== undefined;
}
