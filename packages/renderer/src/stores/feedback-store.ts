/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { FeedbackCategory } from '/@api/feedback';

export type FeedbackGitHubIssueCategories = 'feature' | 'bug';
export type FeedbackDevelopersCategories = 'developers';

export enum FeedbackSmiley {
  VERY_SAD = 0,
  SAD,
  HAPPY,
  VERY_HAPPY,
}

export interface FeedbackDevelopers {
  smiley: FeedbackSmiley;
  tellUsWhy: string;
  contactInformation: string;
  category: FeedbackDevelopersCategories;
}

export interface FeedbackGitHubIssue {
  title: string;
  issueDescription: string;
  category: FeedbackGitHubIssueCategories;
}

export const feedbackStoreMap = new Map<FeedbackCategory, FeedbackDevelopers | FeedbackGitHubIssue>();

export function storeFeedback(feedback: FeedbackDevelopers | FeedbackGitHubIssue): void {
  feedbackStoreMap.set(feedback.category, feedback);
}

export function getFeedback(category: FeedbackCategory): FeedbackDevelopers | FeedbackGitHubIssue | undefined {
  return feedbackStoreMap.get(category);
}
