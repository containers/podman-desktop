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
import type * as extensionApi from '@podman-desktop/api';

export interface FailureObject {
  description: string;
  docLinksDescription?: string;
  docLinks?: extensionApi.CheckResultLink;
  fixCommand?: extensionApi.CheckResultFixCommand;
}

export abstract class BaseCheck implements extensionApi.InstallCheck {
  abstract title: string;
  abstract execute(): Promise<extensionApi.CheckResult>;

  protected createFailureResult(failureObject: FailureObject): extensionApi.CheckResult {
    const result: extensionApi.CheckResult = { successful: false, description: failureObject.description };
    if (failureObject.docLinksDescription) {
      result.docLinksDescription = failureObject.docLinksDescription;
    }
    if (failureObject.docLinks) {
      result.docLinks = [{ url: failureObject.docLinks.url, title: failureObject.docLinks.title }];
    }
    if (failureObject.fixCommand) {
      result.fixCommand = {
        id: failureObject.fixCommand.id,
        title: failureObject.fixCommand.title,
      };
    }
    return result;
  }

  protected createSuccessfulResult(): extensionApi.CheckResult {
    return { successful: true };
  }
}

export class SequenceCheck extends BaseCheck {
  title: string;

  constructor(
    title: string,
    private checks: BaseCheck[],
  ) {
    super();
    this.title = title;
  }

  async execute(): Promise<extensionApi.CheckResult> {
    for (const check of this.checks) {
      const result = await check.execute();
      if (!result.successful) {
        return result;
      }
    }
    return this.createSuccessfulResult();
  }
}

export class OrCheck extends BaseCheck {
  title: string;

  constructor(
    title: string,
    private left: BaseCheck,
    private right: BaseCheck,
  ) {
    super();
    this.title = title;
  }

  async execute(): Promise<extensionApi.CheckResult> {
    const leftResult = await this.left.execute();
    if (leftResult.successful) {
      return leftResult;
    }
    const rightResult = await this.right.execute();
    return rightResult.successful ? rightResult : leftResult;
  }
}
