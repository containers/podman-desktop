<script lang="ts">
export let status: string;

interface connectionStatusStyle {
  bgColor: string;
  txtColor: string;
  label: string;
}

/* 'not-installed'
  | 'installed'
  | 'configured'
  | 'unknown';*/
const roundIconStyle = 'my-auto w-3 h-3 rounded-full';
const labelStyle = 'my-auto ml-1 text-xs';
const statusesStyle = new Map<string, connectionStatusStyle>([
  [
    'ready',
    {
      bgColor: 'bg-green-500',
      txtColor: 'text-green-500',
      label: 'RUNNING',
    },
  ],
  [
    'started',
    {
      bgColor: 'bg-green-500',
      txtColor: 'text-green-500',
      label: 'RUNNING',
    },
  ],
  [
    'starting',
    {
      bgColor: 'bg-green-500',
      txtColor: 'text-green-500',
      label: 'STARTING',
    },
  ],
  [
    'stopped',
    {
      bgColor: 'bg-gray-900',
      txtColor: 'text-gray-900',
      label: 'STOPPED',
    },
  ],
  [
    'configured',
    {
      bgColor: 'bg-gray-900',
      txtColor: 'text-gray-900',
      label: 'STOPPED',
    },
  ],
  [
    'installed',
    {
      bgColor: 'bg-gray-900',
      txtColor: 'text-gray-900',
      label: 'INSTALLED BUT NOT READY',
    },
  ],
  [
    'stopping',
    {
      bgColor: 'bg-red-500',
      txtColor: 'text-red-500',
      label: 'STOPPING',
    },
  ],
  [
    'error',
    {
      bgColor: 'bg-red-500',
      txtColor: 'text-red-500',
      label: 'ERROR',
    },
  ],
]);
$: statusStyle = statusesStyle.get(status) ?? {
  bgColor: 'bg-gray-900',
  txtColor: 'text-gray-900',
  label: status.toUpperCase(),
};
</script>

<div aria-label="Connection Status Icon" class="{roundIconStyle} {statusStyle.bgColor}"></div>
<span aria-label="Connection Status Label" class="{labelStyle} {statusStyle.txtColor}">{statusStyle.label}</span>
