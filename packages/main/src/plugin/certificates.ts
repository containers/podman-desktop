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

import * as fs from 'node:fs';
import * as https from 'node:https';
import * as path from 'node:path';
import * as tls from 'node:tls';

import wincaAPI from 'win-ca/api';

import { isLinux, isMac, isWindows } from '../util.js';
import { spawnWithPromise } from './util/spawn-promise.js';

/**
 * Provides access to the certificates of the underlying platform.
 * It supports Linux, Windows and MacOS.
 */
export class Certificates {
  private allCertificates: string[] = [];

  /**
   * Setup all certificates globally depending on the platform.
   */
  async init(): Promise<void> {
    this.allCertificates = await this.retrieveCertificates();

    // initialize the certificates globally
    https.globalAgent.options.ca = this.allCertificates;
  }

  getAllCertificates(): string[] {
    return this.allCertificates;
  }

  async retrieveCertificates(): Promise<string[]> {
    if (isMac()) {
      return this.retrieveMacOSCertificates();
    } else if (isWindows()) {
      return this.retrieveWindowsCertificates();
    } else if (isLinux()) {
      return this.retrieveLinuxCertificates();
    }

    // else return default root certificates
    return [...tls.rootCertificates];
  }

  public extractCertificates(content: string): string[] {
    // need to create an array of text from the content starting by '-----BEGIN CERTIFICATE-----'
    // use a regexp
    return content.split(/(?=-----BEGIN CERTIFICATE-----)/g).filter(c => c.trim().length > 0);
  }

  async retrieveMacOSCertificates(): Promise<string[]> {
    const rootCertificates = await this.getMacOSCertificates(
      '/System/Library/Keychains/SystemRootCertificates.keychain',
    );
    const userCertificates = await this.getMacOSCertificates();
    return rootCertificates.concat(userCertificates);
  }

  // get the certificates from the Windows certificate store
  async retrieveWindowsCertificates(): Promise<string[]> {
    // delegate to the win-ca module
    const winCaRetrieval = new Promise<string[]>(resolve => {
      const CAs: string[] = [...tls.rootCertificates];

      if (import.meta.env.PROD) {
        const rootExePath = path.join(process.resourcesPath, 'win-ca', 'roots.exe');
        wincaAPI.exe(rootExePath);
      } else {
        wincaAPI.exe(require.resolve('win-ca/lib/roots.exe'));
      }

      wincaAPI({
        format: wincaAPI.der2.pem,
        inject: false,
        ondata: (ca: string) => {
          CAs.push(ca);
        },
        onend: () => {
          resolve(CAs);
        },
      });
    });

    try {
      const result = await winCaRetrieval;
      // also do the patch on tls.createSecureContext()
      wincaAPI.inject('+');
      return result;
    } catch (error) {
      console.error('Error while retrieving Windows certificates', error);
      // return default root certificates
      return [...tls.rootCertificates];
    }
  }

  // grab the certificates from the Linux certificate store
  async retrieveLinuxCertificates(): Promise<string[]> {
    // certificates on Linux are stored in /etc/ssl/certs/ folder
    // for example
    // /etc/ssl/certs/ca-certificates.crt or /etc/ssl/certs/ca-bundle.crt
    const LINUX_FILES = ['/etc/ssl/certs/ca-certificates.crt', '/etc/ssl/certs/ca-bundle.crt'];

    // read the files and parse the content
    const certificates: string[] = [];
    for (const file of LINUX_FILES) {
      // if the file exists, read it
      if (fs.existsSync(file)) {
        const content = await fs.promises.readFile(file, { encoding: 'utf8' });
        try {
          this.extractCertificates(content).forEach(certificate => certificates.push(certificate));
        } catch (error) {
          console.log(`error while extracting certificates from ${file}`, error);
        }
      }
    }
    // remove any duplicates
    return certificates.filter((value, index, self) => self.indexOf(value) === index);
  }

  async getMacOSCertificates(key?: string): Promise<string[]> {
    const command = '/usr/bin/security';
    const spawnArgs = ['find-certificate', '-a', '-p'];
    // do we have an extra parameter
    if (key) {
      spawnArgs.push(key);
    }

    // call the spawn command (as we've lot ot output)
    const spawnResult = await spawnWithPromise(command, spawnArgs);
    if (spawnResult.error) {
      console.log('error while executing command', command, spawnArgs, spawnResult.error);
      return [];
    } else {
      try {
        return this.extractCertificates(spawnResult.stdout);
      } catch (error) {
        console.log('error while extracting certificates', error);
        return [];
      }
    }
  }
}
