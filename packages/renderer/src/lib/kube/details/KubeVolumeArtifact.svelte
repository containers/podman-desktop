<script lang="ts">
/* There are many types of volumes that need to be shown, all with different 'name' values, etc.

NOTE: There are eventual improvements we can do to show information regarding each volume.
But this may be outside of the scope of Podman Desktop. If you see any improvements needed below, feel
free to open a PR.

These are the ones which will be shown (see the V1 Volume spec)
'awsElasticBlockStore'?: V1AWSElasticBlockStoreVolumeSource;
'azureDisk'?: V1AzureDiskVolumeSource;
'azureFile'?: V1AzureFileVolumeSource;
'cephfs'?: V1CephFSVolumeSource;
'cinder'?: V1CinderVolumeSource;
'configMap'?: V1ConfigMapVolumeSource;
'csi'?: V1CSIVolumeSource;
'downwardAPI'?: V1DownwardAPIVolumeSource;
'emptyDir'?: V1EmptyDirVolumeSource;
'ephemeral'?: V1EphemeralVolumeSource;
'fc'?: V1FCVolumeSource;
'flexVolume'?: V1FlexVolumeSource;
'flocker'?: V1FlockerVolumeSource;
'gcePersistentDisk'?: V1GCEPersistentDiskVolumeSource;
'gitRepo'?: V1GitRepoVolumeSource;
'glusterfs'?: V1GlusterfsVolumeSource;
'hostPath'?: V1HostPathVolumeSource;
'iscsi'?: V1ISCSIVolumeSource;
'nfs'?: V1NFSVolumeSource;
'persistentVolumeClaim'?: V1PersistentVolumeClaimVolumeSource;
'photonPersistentDisk'?: V1PhotonPersistentDiskVolumeSource;
'portworxVolume'?: V1PortworxVolumeSource;
'projected'?: V1ProjectedVolumeSource;
'quobyte'?: V1QuobyteVolumeSource;
'rbd'?: V1RBDVolumeSource;
'scaleIO'?: V1ScaleIOVolumeSource;
'secret'?: V1SecretVolumeSource;
'storageos'?: V1StorageOSVolumeSource;
'vsphereVolume'?: V1VsphereVirtualDiskVolumeSource;
*/

import type { V1Volume } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Subtitle from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1Volume;
</script>

{#if artifact}
  <tr>
    <Subtitle>{artifact.name}</Subtitle>
  </tr>

  {#if artifact.awsElasticBlockStore}
    <tr>
      <Cell>AWS EBS</Cell>
      <Cell>{artifact.awsElasticBlockStore.volumeID}</Cell>
    </tr>
  {/if}
  {#if artifact.azureDisk}
    <tr>
      <Cell>Azure Disk</Cell>
      <Cell>{artifact.azureDisk.diskName}</Cell>
    </tr>
  {/if}
  {#if artifact.azureFile}
    <tr>
      <Cell>Azure File</Cell>
      <Cell>{artifact.azureFile.shareName}</Cell>
    </tr>
  {/if}
  {#if artifact.cephfs}
    <tr>
      <Cell>CephFS</Cell>
      <Cell>{artifact.cephfs.monitors.join(', ')}</Cell>
    </tr>
  {/if}
  {#if artifact.cinder}
    <tr>
      <Cell>Cinder</Cell>
      <Cell>{artifact.cinder.volumeID}</Cell>
    </tr>
  {/if}
  {#if artifact.configMap}
    <tr>
      <Cell>ConfigMap</Cell>
      <Cell>{artifact.configMap.name}</Cell>
    </tr>
  {/if}
  {#if artifact.csi}
    <tr>
      <Cell>CSI</Cell>
      <Cell>{artifact.csi.driver}</Cell>
    </tr>
  {/if}
  {#if artifact.downwardAPI}
    <tr>
      <Cell>Downward API</Cell>
    </tr>
  {/if}
  {#if artifact.emptyDir}
    <tr>
      <Cell>Empty Directory</Cell>
      <Cell
        >Medium: {artifact.emptyDir.medium ?? 'Default'}
        {#if artifact.emptyDir.sizeLimit}
          • Size Limit: {artifact.emptyDir.sizeLimit}
        {/if}
      </Cell>
    </tr>
  {/if}
  {#if artifact.ephemeral}
    <tr>
      <Cell>Ephemeral</Cell>
    </tr>
  {/if}
  {#if artifact.fc}
    <tr>
      <Cell>Fibre Channel</Cell>
      <!-- For fiber channels, it is always either wwids or combination of target WNS and lun are set, check that they exist and then display them,
        the comment from V1FCVolumeSource: * wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously. -->
      {#if artifact.fc.wwids}
        <Cell>WWIDS: {artifact.fc.wwids.join(', ')}</Cell>
      {:else if artifact.fc.targetWWNs && artifact.fc.lun}
        <Cell>WWWNs: {artifact.fc.targetWWNs.join(', ')} LUN: {artifact.fc.lun}</Cell>
      {/if}
    </tr>
  {/if}
  {#if artifact.flexVolume}
    <tr>
      <Cell>Flex Volume</Cell>
      <Cell>{artifact.flexVolume.driver}</Cell>
    </tr>
  {/if}
  {#if artifact.flocker}
    <tr>
      <Cell>Flocker</Cell>
      <Cell>{artifact.flocker.datasetName}</Cell>
    </tr>
  {/if}
  {#if artifact.gcePersistentDisk}
    <tr>
      <Cell>GCE Persistent Disk</Cell>
      <Cell>{artifact.gcePersistentDisk.pdName}</Cell>
    </tr>
  {/if}
  {#if artifact.gitRepo}
    <tr>
      <Cell>Git Repository</Cell>
      <Cell>{artifact.gitRepo.repository}</Cell>
    </tr>
  {/if}
  {#if artifact.glusterfs}
    <tr>
      <Cell>GlusterFS</Cell>
      <Cell>{artifact.glusterfs.path}</Cell>
    </tr>
  {/if}
  {#if artifact.hostPath}
    <tr>
      <Cell>Host Path</Cell>
      <Cell>{artifact.hostPath.path}</Cell>
    </tr>
  {/if}
  {#if artifact.iscsi}
    <tr>
      <Cell>iSCSI</Cell>
      <Cell>{artifact.iscsi.targetPortal}</Cell>
    </tr>
  {/if}
  {#if artifact.nfs}
    <tr>
      <Cell>NFS (Network File System)</Cell>
      <Cell>{artifact.nfs.path}</Cell>
    </tr>
  {/if}
  {#if artifact.persistentVolumeClaim}
    <tr>
      <Cell>Persistent Volume Claim</Cell>
      <Cell>{artifact.persistentVolumeClaim.claimName}</Cell>
    </tr>
  {/if}
  {#if artifact.photonPersistentDisk}
    <tr>
      <Cell>Photon Persistent Disk</Cell>
      <Cell>{artifact.photonPersistentDisk.pdID}</Cell>
    </tr>
  {/if}
  {#if artifact.portworxVolume}
    <tr>
      <Cell>Portworx Volume</Cell>
      <Cell>{artifact.portworxVolume.volumeID}</Cell>
    </tr>
  {/if}
  {#if artifact.projected}
    <tr>
      <Cell>Projected</Cell>
    </tr>
  {/if}
  {#if artifact.quobyte}
    <tr>
      <Cell>Quobyte</Cell>
      <Cell>{artifact.quobyte.registry}</Cell>
    </tr>
  {/if}
  {#if artifact.rbd}
    <tr>
      <Cell>RBD (RADOS Block Device)</Cell>
      <Cell>{artifact.rbd.monitors.join(', ')}</Cell>
    </tr>
  {/if}
  {#if artifact.scaleIO}
    <tr>
      <Cell>ScaleIO</Cell>
      <Cell>{artifact.scaleIO.gateway}</Cell>
    </tr>
  {/if}
  {#if artifact.secret}
    <tr>
      <Cell>Secret</Cell>
      <Cell>{artifact.secret.secretName}</Cell>
    </tr>
  {/if}
  {#if artifact.storageos}
    <tr>
      <Cell>StorageOS</Cell>
      <Cell>{artifact.storageos.volumeName}</Cell>
    </tr>
  {/if}
  {#if artifact.vsphereVolume}
    <tr>
      <Cell>vSphere Volume</Cell>
      <Cell>{artifact.vsphereVolume.volumePath}</Cell>
    </tr>
  {/if}
{/if}
