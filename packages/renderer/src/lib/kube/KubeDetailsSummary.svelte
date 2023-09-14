<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';
export let pod: V1Pod;

// https://github.com/kubernetes-client/javascript/issues/487
if (pod?.metadata?.creationTimestamp) {
  pod.metadata.creationTimestamp = new Date(pod.metadata.creationTimestamp);
}

if (pod?.status?.startTime) {
  pod.status.startTime = new Date(pod.status.startTime);
}
</script>

<div class="flex px-5 py-4 flex-col items-start hover:overflow-y-auto">
  {#if pod}
    <table class="w-full">
      <tbody>
        <tr>
          <td class="py-2 px-4 text-lg pl-1 font-semibold text-purple-400" colspan="2">Pod {pod.metadata?.name}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Name</td>
          <td class="py-2 px-4">{pod.metadata?.name}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Namespace</td>
          <td class="py-2 px-4">{pod.metadata?.namespace}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Created</td>
          <td class="py-2 px-4">{pod.metadata?.creationTimestamp}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Labels</td>
          <td class="py-2 px-4">
            {#each Object.entries(pod.metadata?.labels || {}) as [key, value]}
              <div>{key}: {value}</div>
            {/each}
          </td>
        </tr>
        <tr>
          <td class="py-2 px-4">Annotations</td>
          <td class="py-2 px-4">
            {#each Object.entries(pod.metadata?.annotations || {}) as [key, value]}
              <div>{key}: {value}</div>
            {/each}
          </td>
        </tr>
        <tr>
          <td class="py-2 px-4">Node Name</td>
          <td class="py-2 px-4">{pod.spec?.nodeName}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Service Account</td>
          <td class="py-2 px-4">{pod.spec?.serviceAccountName}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Restart Policy</td>
          <td class="py-2 px-4">{pod.spec?.restartPolicy}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Pod Phase</td>
          <td class="py-2 px-4">{pod.status?.phase}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Start Time</td>
          <td class="py-2 px-4">{pod.status?.startTime}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Containers</td>
          <td class="py-2 px-4">{pod.spec?.containers.map(c => c.name).join(', ')}</td>
        </tr>

        <tr>
          <td class="py-2 px-4 text-lg pl-1 font-semibold text-purple-400" colspan="2">Networking</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Pod IP</td>
          <td class="py-2 px-4">{pod.status?.podIP}</td>
        </tr>
        <tr>
          <td class="py-2 px-4">Host IP</td>
          <td class="py-2 px-4">{pod.status?.hostIP}</td>
        </tr>

        {#if pod.spec?.containers?.length}
          <tr>
            <td class="py-2 px-4 text-lg pl-1 font-semibold text-purple-400" colspan="2">Containers</td>
          </tr>
          {#each pod.spec.containers as container}
            <tr>
              <td class="py-2 px-4 text-md pl-2 font-semibold text-purple-300" colspan="2">{container.name}</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Name</td>
              <td class="py-2 px-4">{container.name}</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Image</td>
              <td class="py-2 px-4">{container.image}</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Image Pull Policy</td>
              <td class="py-2 px-4">{container.imagePullPolicy}</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Ports</td>
              <td class="py-2 px-4"
                >{container.ports?.map(port => `${port.containerPort}/${port.protocol}`).join(', ') || ''}</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Environment Variables</td>
              <td class="py-2 px-4">
                {#each container.env ? container.env.map(e => `${e.name}: ${e.value}`) : [] as env}
                  <div>{env}</div>
                {/each}
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4">Volume Mounts</td>
              <td class="py-2 px-4">{container.volumeMounts?.map(vm => vm.name).join(', ') || ''}</td>
            </tr>
            <br />
            <!-- Add more rows for other container details as needed -->
          {/each}
        {/if}

        <!-- Volumes section -->
{#if pod.spec?.volumes?.length}
<tr>
  <td class="py-2 px-4 text-lg pl-1 font-semibold text-purple-400" colspan="2">Volumes</td>
</tr>
{#each pod.spec.volumes as volume}
  <tr>
    <td class="py-2 px-4 text-md pl-2 font-semibold text-purple-300" colspan="2">{volume.name}</td>
  </tr>
  <!-- TODO: Add all the other tyupes of volumes: (there are 7, see: https://kubernetes.io/docs/concepts/storage/volumes/#volume-types)-->
  {#if volume.secret}
    <tr>
      <td class="py-2 px-4">Secret</td>
      <td class="py-2 px-4">{volume.secret.secretName}</td>
    </tr>
  {/if}
  {#if volume.configMap}
    <tr>
      <td class="py-2 px-4">ConfigMap</td>
      <td class="py-2 px-4">{volume.configMap.name}</td>
    </tr>
  {/if}
  {#if volume.persistentVolumeClaim}
    <tr>
      <td class="py-2 px-4">Persistent Volume Claim</td>
      <td class="py-2 px-4">{volume.persistentVolumeClaim.claimName}</td>
    </tr>
  {/if}
  {#if volume.emptyDir}
    <tr>
      <td class="py-2 px-4">Empty Directory</td>
      <td class="py-2 px-4">Medium: {volume.emptyDir.medium || 'Default'}</td>
    </tr>
  {/if}
  <!-- Add more conditions for other volume types if needed -->
  {#if volume.projected?.sources}
    <tr>
      <td class="py-2 px-4">Projected</td>
      <!-- TODO add project name sources -->
    </tr>
  {/if}
  <br />
{/each}
{/if}

      </tbody>
    </table>
  {:else}
    <p class="text-purple-500 font-medium">Loading...</p>
  {/if}
</div>
