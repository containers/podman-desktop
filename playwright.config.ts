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

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  outputDir: 'tests/playwright/output/',
  workers: 1,

  reporter: [
    ['list'],
    ['junit', { outputFile: 'tests/playwright/output/junit-results.xml' }],
    ['json', { outputFile: 'tests/playwright/output/json-results.json' }],
    ['html', { open: 'never', outputFolder: 'tests/playwright/output/html-results/' }],
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
