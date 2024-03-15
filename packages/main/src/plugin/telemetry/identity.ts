/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
/**
 * Manages the retrieval of the user id.
 * The id is an anonymous identifier.
 */
export class Identity {
  private userId: string | undefined;

  async getUserId(): Promise<string> {
    // already got it
    if (this.userId) {
      return this.userId;
    }

    // else check if the file is there
    const redhatPath = path.join(os.homedir(), '.redhat');
    const anonymousIdPath = path.join(redhatPath, 'anonymousId');
    if (fs.existsSync(anonymousIdPath)) {
      this.userId = await fs.promises.readFile(anonymousIdPath, 'utf8');
    } else {
      // needs to create the parent path
      await fs.promises.mkdir(redhatPath, { recursive: true });

      // generates a new ID
      const generatedId = crypto.randomUUID();
      // write the file
      await fs.promises.writeFile(anonymousIdPath, generatedId, 'utf8');
      this.userId = generatedId;
    }
    return this.userId;
  }
}
