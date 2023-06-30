<script lang="ts">
export let status: string;

interface connectionStatusStyle {
  bgColor: string;
  txtColor: string;
  label: string;
}

const roundIconStyle = 'my-auto w-3 h-3 rounded-full';
const labelStyle = 'my-auto ml-1 font-bold text-[9px]';
const statusesStyle = new Map<string, connectionStatusStyle>([
  [
    'enabled',
    {
      bgColor: 'bg-green-500',
      txtColor: 'text-green-500',
      label: 'ENABLED',
    },
  ],
  [
    'enabling',
    {
      bgColor: 'bg-green-500',
      txtColor: 'text-green-500',
      label: 'ENABLING',
    },
  ],
  [
    'disabled',
    {
      bgColor: 'bg-gray-900',
      txtColor: 'text-gray-900',
      label: 'DISABLED',
    },
  ],
  [
    'disabling',
    {
      bgColor: 'bg-red-500',
      txtColor: 'text-red-500',
      label: 'DISABLING',
    },
  ],
  [
    'failed',
    {
      bgColor: 'bg-red-500',
      txtColor: 'text-red-500',
      label: 'FAILED',
    },
  ],
]);
$: statusStyle = statusesStyle.get(status) || {
  bgColor: 'bg-gray-900',
  txtColor: 'text-gray-900',
  label: status.toUpperCase(),
};
</script>

<div aria-label="connection-status-icon" class="{roundIconStyle} {statusStyle.bgColor}"></div>
<span aria-label="connection-status-label" class="{labelStyle} {statusStyle.txtColor}">{statusStyle.label}</span>
