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

import type { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

export interface CertificateDetectionResult {
  hasCustomCertificates: boolean;
  certificateCount: number;
  scanDurationMs: number;
  errors: DetectionError[];
}

export interface DetectionError {
  error: string;
  code?: string;
}

export interface CertificateDetectionConfig {
  enableTelemetry: boolean;
  scanTimeoutMs: number;
  excludedExtensions: string[];
  validCertExtensions: string[];
  certDirectories: { system: string[]; user: string[] };
  followSymlinks: boolean;
}

const DEFAULT_CONFIG: CertificateDetectionConfig = {
  enableTelemetry: true,
  scanTimeoutMs: 10000,
  excludedExtensions: ['.pem', '.cer'],
  validCertExtensions: ['.crt', '.cert', '.key'],
  certDirectories: {
    system: ['/etc/containers/certs.d'],
    user: ['$HOME/.config/containers/certs.d'],
  },
  followSymlinks: false,
};

export class CertificateDetectionService {
  private config: CertificateDetectionConfig;
  private readonly telemetryLogger?: extensionApi.TelemetryLogger;

  constructor(telemetryLogger?: extensionApi.TelemetryLogger, config?: Partial<CertificateDetectionConfig>) {
    this.telemetryLogger = telemetryLogger;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async detectCustomCertificates(): Promise<CertificateDetectionResult> {
    if (this.config.enableTelemetry && this.telemetryLogger) {
      const startTime = Date.now();

      try {
        const result = await this.performDetection();
        result.scanDurationMs = Date.now() - startTime;

        await this.sendTelemetry(result);

        return result;
      } catch (error) {
        const fallbackResult: CertificateDetectionResult = {
          hasCustomCertificates: false,
          certificateCount: 0,
          scanDurationMs: Date.now() - startTime,
          errors: [{ error: String(error) }],
        };

        await this.sendTelemetry(fallbackResult);

        return fallbackResult;
      }
    }

    // return minimal result without scanning
    return {
      hasCustomCertificates: false,
      certificateCount: 0,
      scanDurationMs: 0,
      errors: [],
    };
  }

  private async performDetection(): Promise<CertificateDetectionResult> {
    const result: CertificateDetectionResult = {
      hasCustomCertificates: false,
      certificateCount: 0,
      scanDurationMs: 0,
      errors: [],
    };

    const directories = await this.getDirectoriesToScan();
    const scanPromise = this.scanDirectories(directories, result);
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Scan timeout')), this.config.scanTimeoutMs);
    });

    try {
      await Promise.race([scanPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Scan timeout') {
        result.errors.push({ error: 'Scan operation timed out' });
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    result.hasCustomCertificates = result.certificateCount > 0;
    return result;
  }

  private async scanDirectories(directories: string[], result: CertificateDetectionResult): Promise<void> {
    const scanTasks = directories.map(dir => this.scanDirectory(dir, result, 0));

    await Promise.allSettled(scanTasks);
  }

  private async scanDirectory(dirPath: string, result: CertificateDetectionResult, depth: number): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (this.shouldScanDirectory(entry, depth)) {
          await this.scanDirectory(fullPath, result, depth + 1);
        } else if (this.shouldCountCertificate(entry, depth)) {
          result.certificateCount++;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorInfo: DetectionError = {
          error: error.message,
          code: (error as NodeJS.ErrnoException).code,
        };
        result.errors.push(errorInfo);
      }
    }
  }

  private shouldScanDirectory(entry: Dirent, depth: number): boolean {
    return entry.isDirectory() && !entry.isSymbolicLink() && depth === 0 && this.isValidRegistryDirectory(entry.name);
  }

  private shouldCountCertificate(entry: Dirent, depth: number): boolean {
    const isValidFile = entry.isFile() || (entry.isSymbolicLink() && this.config.followSymlinks);
    return isValidFile && depth >= 1 && this.isCertificateFile(entry.name);
  }

  private isCertificateFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();

    if (this.config.excludedExtensions.includes(ext)) {
      return false;
    }

    return this.config.validCertExtensions.includes(ext);
  }

  private isValidRegistryDirectory(directoryName: string): boolean {
    // According to containers-certs.d(5), directory names should follow hostname:port format
    // Examples: registry.example.com:5000, localhost:5000, example.com

    // Allow hostname without port (default port assumed)
    const hostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;
    const hostnamePortPattern = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?:\d+$/;

    return hostnamePattern.test(directoryName) || hostnamePortPattern.test(directoryName);
  }

  protected async getDirectoriesToScan(): Promise<string[]> {
    const directories: string[] = [...this.config.certDirectories.system];

    const homeDir = os.homedir();
    const userDirs = this.config.certDirectories.user.map(dir => dir.replace('$HOME', homeDir));
    directories.push(...userDirs);

    const existingDirs: string[] = [];
    for (const dir of directories) {
      try {
        await fs.access(dir, fs.constants.R_OK);
        existingDirs.push(dir);
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code && nodeError.code !== 'ENOENT') {
          console.debug(`Certificate directory not accessible: ${dir} (${nodeError.code})`);
        }
      }
    }

    return existingDirs;
  }

  private async sendTelemetry(result: CertificateDetectionResult): Promise<void> {
    if (!result.hasCustomCertificates && result.errors.length === 0) {
      return;
    }

    const telemetryRecords = {
      using_custom_certificates: result.hasCustomCertificates,
      certificate_count: result.certificateCount,
      scan_duration_ms: result.scanDurationMs,
      is_windows: extensionApi.env.isWindows,
      is_linux: extensionApi.env.isLinux,
      is_mac: extensionApi.env.isMac,
      errors: result.errors
        .map(e => {
          const errorMsg = e.error;
          const codeMsg = e.code ? ` (${e.code})` : '';
          return `${errorMsg}${codeMsg}`;
        })
        .join('; '),
    };

    this.telemetryLogger?.logUsage('custom_certs', telemetryRecords);
  }

  updateConfig(config: Partial<CertificateDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
