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

import { createHash } from 'node:crypto';

import { DocumentationBaseInfo, DocumentationInfo } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { inject, injectable } from 'inversify';

import { Disposable } from '/@/plugin/types/disposable.js';
import product from '/@product.json' with { type: 'json' };

@injectable()
export class DocumentationService extends Disposable {
  private documentation: DocumentationInfo[] = [];
  private isInitialized = false;

  constructor(
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
  ) {
    super(() => {
      this.documentation = [];
      this.isInitialized = false;
    });
  }

  async fetchDocumentation(): Promise<void> {
    try {
      const documentationJsons = await Promise.all(
        [...product.documentation.links].map(async item => {
          const data = await this.fetchJsonContent(item.link);
          return { category: item.category, data };
        }),
      );
      this.documentation = this.parseDocumentationFromJson(documentationJsons);
      this.isInitialized = true;
    } catch (error: unknown) {
      console.error('Failed to fetch documentation at startup:', error);
      // Fallback to predefined documentation if fetching fails
      this.documentation = product.documentation.fallback as DocumentationInfo[];
      this.isInitialized = true;
    }
  }

  async getDocumentationItems(): Promise<DocumentationInfo[]> {
    if (!this.isInitialized) {
      await this.fetchDocumentation();
    }
    return this.documentation;
  }

  async refreshDocumentation(): Promise<void> {
    this.isInitialized = false; // Force re-fetch
    await this.fetchDocumentation();
    this.apiSender.send('documentation-updated');
  }

  private async fetchJsonContent(url: string): Promise<DocumentationBaseInfo[]> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (!Array.isArray(json)) {
        throw new Error(`Invalid JSON format for ${url}`);
      }
      return json;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout while fetching ${url}`);
        }
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
      }
      throw new Error(`Failed to fetch ${url}: Unknown error`);
    }
  }

  private parseDocumentationFromJson(
    documentationJsons: { category?: string; data: DocumentationBaseInfo[] }[],
  ): DocumentationInfo[] {
    const documentation: DocumentationInfo[] = [];

    // Check that there is some data
    if (!documentationJsons.some(item => item.data.length > 0)) {
      console.warn('Missing JSON content for parsing documentation');
      return product.documentation.fallback as DocumentationInfo[];
    }

    for (const documentationJson of documentationJsons) {
      for (const item of documentationJson.data) {
        if (item.name && item.url) {
          const id = createHash('sha256').update(item.name).digest('hex');
          if (!documentation.find(doc => doc.id === id)) {
            documentation.push({
              id: id,
              name: item.name,
              description: `${documentationJson.category}: ${item.name}`,
              url: item.url,
              category: documentationJson.category ?? '',
            });
          }
        }
      }
    }

    // If no documentation was parsed, use fallback
    if (documentation.length === 0) {
      console.error('DocumentationService: No items parsed, using fallback documentation');
      return product.documentation.fallback as DocumentationInfo[];
    }

    return documentation;
  }
}
