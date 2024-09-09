<script lang="ts">
export let status: string;

interface ConnectionStatusStyle {
  bgColor: string;
  txtColor: string;
  label: string;
}

const roundIconStyle = 'my-auto w-3 h-3 rounded-full';
const labelStyle = 'my-auto ml-1 text-xs';
const statusesStyle = new Map<string, ConnectionStatusStyle>([
  [
    'ready',
    {
      bgColor: 'bg-[var(--pd-status-running)]',
      txtColor: 'text-[var(--pd-status-running)]',
      label: 'RUNNING',
    },
  ],
  [
    'started',
    {
      bgColor: 'bg-[var(--pd-status-running)]',
      txtColor: 'text-[var(--pd-status-running)]',
      label: 'RUNNING',
    },
  ],
  [
    'starting',
    {
      bgColor: 'bg-[var(--pd-status-starting)]',
      txtColor: 'text-[var(--pd-status-starting)]',
      label: 'STARTING',
    },
  ],
  [
    'stopped',
    {
      bgColor: 'bg-[var(--pd-status-stopped)]',
      txtColor: 'text-[var(--pd-status-stopped)]',
      label: 'STOPPED',
    },
  ],
  [
    'configured',
    {
      bgColor: 'bg-[var(--pd-status-not-running)]',
      txtColor: 'text-[var(--pd-status-not-running)]',
      label: 'STOPPED',
    },
  ],
  [
    'installed',
    {
      bgColor: 'bg-[var(--pd-status-not-running)]',
      txtColor: 'text-[var(--pd-status-not-running)]',
      label: 'INSTALLED BUT NOT READY',
    },
  ],
  [
    'stopping',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'STOPPING',
    },
  ],
  [
    'error',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'ERROR',
    },
  ],
]);
$: statusStyle = statusesStyle.get(status) ?? {
  bgColor: 'bg-[var(--pd-status-unknown)]',
  txtColor: 'text-[var(--pd-status-unknown)]',
  label: status.toUpperCase(),
};
</script>

<div aria-label="Connection Status Icon" class="{roundIconStyle} {statusStyle.bgColor}"></div>
<span aria-label="Connection Status Label" class="{labelStyle} {statusStyle.txtColor}">{statusStyle.label}</span>
