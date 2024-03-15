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

import '@testing-library/jest-dom/vitest';

import type { V1Volume } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Volume from './KubeVolumeArtifact.svelte';

// Create a fakeVolume from V1Volume including 'name' from ALL possible V1Volume types

const fakeVolume: V1Volume = {
  name: 'fakeVolumeName',
  awsElasticBlockStore: {
    volumeID: 'fakeVolumeID',
    fsType: 'ext4',
    partition: 0,
    readOnly: false,
  },
  azureDisk: {
    diskName: 'fakeDiskName',
    diskURI: 'fakeDiskURI',
    kind: 'Shared',
    cachingMode: 'ReadOnly',
    fsType: 'ext4',
    readOnly: false,
  },
  azureFile: {
    secretName: 'fakeSecretName',
    shareName: 'fakeShareName',
    readOnly: false,
  },
  cephfs: {
    monitors: ['fakeMonitor'],
    path: '/',
    user: 'admin',
    secretRef: { name: 'fakeSecretRef' },
    readOnly: false,
  },
  cinder: {
    volumeID: 'fakeCinderVolumeID',
    fsType: 'ext4',
    readOnly: false,
  },
  configMap: {
    name: 'fakeConfigMapName',
    items: [{ key: 'fakeKey', path: 'fakePath' }],
    defaultMode: 420,
    optional: false,
  },
  csi: {
    driver: 'fakeDriver',
    readOnly: false,
    fsType: 'ext4',
    volumeAttributes: { fakeKey: 'fakeValue' },
  },
  downwardAPI: {
    items: [{ path: 'fakePath', fieldRef: { fieldPath: 'metadata.name' } }],
    defaultMode: 420,
  },
  emptyDir: {
    medium: 'Memory',
    sizeLimit: '1Gi',
  },
  ephemeral: {
    volumeClaimTemplate: {
      metadata: { name: 'fakeClaimTemplateName' },
      spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: '1Gi' } } },
    },
  },
  fc: {
    targetWWNs: ['fakeWWN'],
    lun: 0,
    fsType: 'ext4',
    readOnly: false,
  },
  flexVolume: {
    driver: 'fakeDriver',
    secretRef: { name: 'fakeSecretRef' },
    readOnly: false,
    options: { fakeKey: 'fakeValue' },
  },
  flocker: {
    datasetUUID: 'fakeUUID',
  },
  gcePersistentDisk: {
    pdName: 'fakePDName',
    fsType: 'ext4',
    partition: 0,
    readOnly: false,
  },
  gitRepo: {
    repository: 'fakeRepo',
    revision: 'master',
    directory: '.',
  },
  glusterfs: {
    endpoints: 'fakeEndpoints',
    path: 'fakePath',
    readOnly: false,
  },
  hostPath: {
    path: '/fake/path',
    type: 'Directory',
  },
  iscsi: {
    targetPortal: 'fakeTargetPortal',
    iqn: 'fakeIQN',
    lun: 0,
    fsType: 'ext4',
    readOnly: false,
  },
  nfs: {
    server: 'fakeServer',
    path: '/fake/nfs/path',
    readOnly: false,
  },
  persistentVolumeClaim: {
    claimName: 'fakeClaimName',
    readOnly: false,
  },
  photonPersistentDisk: {
    pdID: 'fakePdID',
    fsType: 'ext4',
  },
  portworxVolume: {
    volumeID: 'fakeVolumeID',
    fsType: 'ext4',
    readOnly: false,
  },
  projected: {
    sources: [],
    defaultMode: 420,
  },
  quobyte: {
    registry: 'fakeRegistry',
    volume: 'fakeVolume',
    readOnly: false,
  },
  rbd: {
    monitors: ['fakeMonitor'],
    image: 'fakeImage',
    fsType: 'ext4',
    readOnly: false,
  },
  scaleIO: {
    gateway: 'fakeGateway',
    system: 'fakeSystem',
    protectionDomain: 'fakeDomain',
    storagePool: 'fakePool',
    volumeName: 'fakeVolumeName',
    fsType: 'ext4',
    readOnly: false,
    secretRef: { name: 'fakeSecretRef' },
  },
  secret: {
    secretName: 'fakeSecretName',
    items: [{ key: 'fakeKey', path: 'fakePath' }],
    defaultMode: 420,
    optional: false,
  },
  storageos: {
    volumeName: 'fakeVolumeName',
    volumeNamespace: 'fakeNamespace',
    fsType: 'ext4',
    readOnly: false,
  },
  vsphereVolume: {
    volumePath: 'fakeVolumePath',
    fsType: 'ext4',
  },
};

test('Make sure each volume has been rendered with the correct name', async () => {
  render(Volume, { artifact: fakeVolume });

  // Expect each volume to be actually shown since the information is available
  expect(screen.getByText('AWS EBS')).toBeInTheDocument();
  expect(screen.getByText('Azure Disk')).toBeInTheDocument();
  expect(screen.getByText('Azure File')).toBeInTheDocument();
  expect(screen.getByText('CephFS')).toBeInTheDocument();
  expect(screen.getByText('Cinder')).toBeInTheDocument();
  expect(screen.getByText('ConfigMap')).toBeInTheDocument();
  expect(screen.getByText('CSI')).toBeInTheDocument();
  expect(screen.getByText('Downward API')).toBeInTheDocument();
  expect(screen.getByText('Empty Directory')).toBeInTheDocument();
  expect(screen.getByText('Ephemeral')).toBeInTheDocument();
  expect(screen.getByText('Fibre Channel')).toBeInTheDocument();
  expect(screen.getByText('Flex Volume')).toBeInTheDocument();
  expect(screen.getByText('Flocker')).toBeInTheDocument();
  expect(screen.getByText('GCE Persistent Disk')).toBeInTheDocument();
  expect(screen.getByText('Git Repository')).toBeInTheDocument();
  expect(screen.getByText('GlusterFS')).toBeInTheDocument();
  expect(screen.getByText('Host Path')).toBeInTheDocument();
  expect(screen.getByText('iSCSI')).toBeInTheDocument();
  expect(screen.getByText('NFS (Network File System)')).toBeInTheDocument();
  expect(screen.getByText('Persistent Volume Claim')).toBeInTheDocument();
  expect(screen.getByText('Photon Persistent Disk')).toBeInTheDocument();
  expect(screen.getByText('Portworx Volume')).toBeInTheDocument();
  expect(screen.getByText('Projected')).toBeInTheDocument();
  expect(screen.getByText('Quobyte')).toBeInTheDocument();
  expect(screen.getByText('RBD (RADOS Block Device)')).toBeInTheDocument();
  expect(screen.getByText('ScaleIO')).toBeInTheDocument();
  expect(screen.getByText('Secret')).toBeInTheDocument();
  expect(screen.getByText('StorageOS')).toBeInTheDocument();
  expect(screen.getByText('vSphere Volume')).toBeInTheDocument();
});
