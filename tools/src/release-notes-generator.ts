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
import { Generator } from './generator';

async function run(): Promise<void> {
  let token = process.env.GITHUB_TOKEN;
  if (!token) {
    token = process.env.GH_TOKEN;
  }
  const args = process.argv.slice(2);
  let organization = 'containers';
  let repo = 'podman-desktop';
  let isUser = false;
  let milestone = undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token') {
      token = args[++i];
    } else if (args[i] === '--org') {
      organization = args[++i];
    } else if (args[i] === '--user') {
      organization = args[++i];
      isUser = true;
    } else if (args[i] === '--repo') {
      repo = args[++i];
    } else if (args[i] === '--milestone') {
      milestone = args[++i];
    }
  }
  if (token) {
    const rn = await new Generator(token, organization, repo, isUser, milestone).generate();

    console.log(`${rn}`);
  } else {
    console.log('No token found use either GITHUB_TOKEN or pass it as an argument');
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
