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
export let volume: V1Volume;
</script>

{#if volume}
  <tr>
    <td class="py-2 px-4 text-md pl-2 font-semibold text-purple-300" colspan="2">{volume.name}</td>
  </tr>

  {#if volume.awsElasticBlockStore}
    <tr>
      <td class="py-2 px-4">AWS EBS</td>
      <td class="py-2 px-4">{volume.awsElasticBlockStore.volumeID}</td>
    </tr>
  {/if}
  {#if volume.azureDisk}
    <tr>
      <td class="py-2 px-4">Azure Disk</td>
      <td class="py-2 px-4">{volume.azureDisk.diskName}</td>
    </tr>
  {/if}
  {#if volume.azureFile}
    <tr>
      <td class="py-2 px-4">Azure File</td>
      <td class="py-2 px-4">{volume.azureFile.shareName}</td>
    </tr>
  {/if}
  {#if volume.cephfs}
    <tr>
      <td class="py-2 px-4">CephFS</td>
      <td class="py-2 px-4">{volume.cephfs.monitors.join(', ')}</td>
    </tr>
  {/if}
  {#if volume.cinder}
    <tr>
      <td class="py-2 px-4">Cinder</td>
      <td class="py-2 px-4">{volume.cinder.volumeID}</td>
    </tr>
  {/if}
  {#if volume.configMap}
    <tr>
      <td class="py-2 px-4">ConfigMap</td>
      <td class="py-2 px-4">{volume.configMap.name}</td>
    </tr>
  {/if}
  {#if volume.csi}
    <tr>
      <td class="py-2 px-4">CSI</td>
      <td class="py-2 px-4">{volume.csi.driver}</td>
    </tr>
  {/if}
  {#if volume.downwardAPI}
    <tr>
      <td class="py-2 px-4">Downward API</td>
    </tr>
  {/if}
  {#if volume.emptyDir}
    <tr>
      <td class="py-2 px-4">Empty Directory</td>
      <td class="py-2 px-4">Medium: {volume.emptyDir.medium || 'Default'}</td>
    </tr>
  {/if}
  {#if volume.ephemeral}
    <tr>
      <td class="py-2 px-4">Ephemeral</td>
    </tr>
  {/if}
  {#if volume.fc}
    <tr>
      <td class="py-2 px-4">Fibre Channel</td>
      <!-- For fiber channels, it is always either wwids or combination of target WNS and lun are set, check that they exist and then display them,
        the comment from V1FCVolumeSource: * wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously. -->
      {#if volume.fc.wwids}
        <td class="py-2 px-4">WWIDS: {volume.fc.wwids.join(', ')}</td>
      {:else if volume.fc.targetWWNs && volume.fc.lun}
        <td class="py-2 px-4">WWWNs: {volume.fc.targetWWNs.join(', ')} LUN: {volume.fc.lun}</td>
      {/if}
    </tr>
  {/if}
  {#if volume.flexVolume}
    <tr>
      <td class="py-2 px-4">Flex Volume</td>
      <td class="py-2 px-4">{volume.flexVolume.driver}</td>
    </tr>
  {/if}
  {#if volume.flocker}
    <tr>
      <td class="py-2 px-4">Flocker</td>
      <td class="py-2 px-4">{volume.flocker.datasetName}</td>
    </tr>
  {/if}
  {#if volume.gcePersistentDisk}
    <tr>
      <td class="py-2 px-4">GCE Persistent Disk</td>
      <td class="py-2 px-4">{volume.gcePersistentDisk.pdName}</td>
    </tr>
  {/if}
  {#if volume.gitRepo}
    <tr>
      <td class="py-2 px-4">Git Repository</td>
      <td class="py-2 px-4">{volume.gitRepo.repository}</td>
    </tr>
  {/if}
  {#if volume.glusterfs}
    <tr>
      <td class="py-2 px-4">GlusterFS</td>
      <td class="py-2 px-4">{volume.glusterfs.path}</td>
    </tr>
  {/if}
  {#if volume.hostPath}
    <tr>
      <td class="py-2 px-4">Host Path</td>
      <td class="py-2 px-4">{volume.hostPath.path}</td>
    </tr>
  {/if}
  {#if volume.iscsi}
    <tr>
      <td class="py-2 px-4">iSCSI</td>
      <td class="py-2 px-4">{volume.iscsi.targetPortal}</td>
    </tr>
  {/if}
  {#if volume.nfs}
    <tr>
      <td class="py-2 px-4">NFS (Network File System)</td>
      <td class="py-2 px-4">{volume.nfs.path}</td>
    </tr>
  {/if}
  {#if volume.persistentVolumeClaim}
    <tr>
      <td class="py-2 px-4">Persistent Volume Claim</td>
      <td class="py-2 px-4">{volume.persistentVolumeClaim.claimName}</td>
    </tr>
  {/if}
  {#if volume.photonPersistentDisk}
    <tr>
      <td class="py-2 px-4">Photon Persistent Disk</td>
      <td class="py-2 px-4">{volume.photonPersistentDisk.pdID}</td>
    </tr>
  {/if}
  {#if volume.portworxVolume}
    <tr>
      <td class="py-2 px-4">Portworx Volume</td>
      <td class="py-2 px-4">{volume.portworxVolume.volumeID}</td>
    </tr>
  {/if}
  {#if volume.projected}
    <tr>
      <td class="py-2 px-4">Projected</td>
    </tr>
  {/if}
  {#if volume.quobyte}
    <tr>
      <td class="py-2 px-4">Quobyte</td>
      <td class="py-2 px-4">{volume.quobyte.registry}</td>
    </tr>
  {/if}
  {#if volume.rbd}
    <tr>
      <td class="py-2 px-4">RBD (RADOS Block Device)</td>
      <td class="py-2 px-4">{volume.rbd.monitors.join(', ')}</td>
    </tr>
  {/if}
  {#if volume.scaleIO}
    <tr>
      <td class="py-2 px-4">ScaleIO</td>
      <td class="py-2 px-4">{volume.scaleIO.gateway}</td>
    </tr>
  {/if}
  {#if volume.secret}
    <tr>
      <td class="py-2 px-4">Secret</td>
      <td class="py-2 px-4">{volume.secret.secretName}</td>
    </tr>
  {/if}
  {#if volume.storageos}
    <tr>
      <td class="py-2 px-4">StorageOS</td>
      <td class="py-2 px-4">{volume.storageos.volumeName}</td>
    </tr>
  {/if}
  {#if volume.vsphereVolume}
    <tr>
      <td class="py-2 px-4">vSphere Volume</td>
      <td class="py-2 px-4">{volume.vsphereVolume.volumePath}</td>
    </tr>
  {/if}
{/if}
