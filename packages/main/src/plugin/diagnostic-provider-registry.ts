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

import { Disposable } from './types/disposable';
import type * as containerDesktopAPI from '@podman-desktop/api';

export class DiagnosticProviderRegistry {
  private diagnosticInfoProviders: containerDesktopAPI.DiagnosticInfoProvider[] = [];
  private diagnosticLogsProviders: containerDesktopAPI.DiagnosticLogsProvider[] = [];

  constructor(
    diagnosticInfoProvider?: containerDesktopAPI.DiagnosticInfoProvider[],
    diagnosticLogsProvider?: containerDesktopAPI.DiagnosticLogsProvider[],
  ) {
    if (diagnosticInfoProvider && diagnosticInfoProvider.length > 0) {
      diagnosticInfoProvider.forEach(provider => {
        this.registerDiagnosticInfoProvider(provider);
      });
    }

    if (diagnosticLogsProvider && diagnosticLogsProvider.length > 0) {
      diagnosticLogsProvider.forEach(provider => {
        this.registerDiagnosticLogsProvider(provider);
      });
    }
  }

  public registerDiagnosticInfoProvider(
    diagnosticInfoProvider: containerDesktopAPI.DiagnosticInfoProvider,
  ): Disposable {
    this.diagnosticInfoProviders.forEach(provider => {
      if (provider.title === diagnosticInfoProvider.title) {
        throw new Error(
          `Diagnostic info provider with title ${diagnosticInfoProvider.title} has been already registered.`,
        );
      }
    });

    this.diagnosticInfoProviders = [...this.diagnosticInfoProviders, diagnosticInfoProvider];
    return Disposable.create(() => {
      this.unregisterDiagnosticInfoProvider(diagnosticInfoProvider);
    });
  }

  public unregisterDiagnosticInfoProvider(diagnosticInfoProvider: containerDesktopAPI.DiagnosticInfoProvider): void {
    const filtered = this.diagnosticInfoProviders.filter(provider => provider.title !== diagnosticInfoProvider.title);
    if (filtered.length !== this.diagnosticInfoProviders.length) {
      this.diagnosticInfoProviders = filtered;
    }
  }

  public registerDiagnosticLogsProvider(
    diagnosticLogsProvider: containerDesktopAPI.DiagnosticLogsProvider,
  ): Disposable {
    this.diagnosticLogsProviders.forEach(provider => {
      if (provider.title === diagnosticLogsProvider.title) {
        throw new Error(
          `Diagnostic logs provider with title ${diagnosticLogsProvider.title} has been already registered.`,
        );
      }
    });

    this.diagnosticLogsProviders = [...this.diagnosticLogsProviders, diagnosticLogsProvider];
    return Disposable.create(() => {
      this.unregisterDiagnosticLogsProvider(diagnosticLogsProvider);
    });
  }

  public unregisterDiagnosticLogsProvider(diagnosticLogsProvider: containerDesktopAPI.DiagnosticLogsProvider): void {
    const filtered = this.diagnosticLogsProviders.filter(provider => provider.title !== diagnosticLogsProvider.title);
    if (filtered.length !== this.diagnosticLogsProviders.length) {
      this.diagnosticLogsProviders = filtered;
    }
  }

  public getRegisteredInfoProviders(): readonly containerDesktopAPI.DiagnosticInfoProvider[] {
    return this.diagnosticInfoProviders;
  }

  public getRegisteredLogsProvider(): readonly containerDesktopAPI.DiagnosticLogsProvider[] {
    return this.diagnosticLogsProviders;
  }
}
