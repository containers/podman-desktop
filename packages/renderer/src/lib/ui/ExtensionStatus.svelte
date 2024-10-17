<script lang="ts">
export let status: string;

interface ConnectionStatusStyle {
  bgColor: string;
  txtColor: string;
  label: string;
}
const roundIconStyle = 'my-auto w-3 h-3 rounded-full';
const labelStyle = 'my-auto ml-1 font-bold text-[9px]';
const statusesStyle = new Map<string, ConnectionStatusStyle>([
  [
    'started',
    {
      bgColor: 'bg-[var(--pd-status-running)]',
      txtColor: 'text-[var(--pd-status-running)]',
      label: 'ACTIVE',
    },
  ],
  [
    'starting',
    {
      bgColor: 'bg-[var(--pd-status-starting)]',
      txtColor: 'text-[var(--pd-status-starting)]',
      label: 'ACTIVATING',
    },
  ],
  [
    'stopped',
    {
      bgColor: 'bg-[var(--pd-status-stopped)]',
      txtColor: 'text-[var(--pd-status-stopped)]',
      label: 'DISABLED',
    },
  ],
  [
    'stopping',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'DISABLING',
    },
  ],
  [
    'failed',
    {
      bgColor: 'bg-[var(--pd-status-terminated)]',
      txtColor: 'text-[var(--pd-status-terminated)]',
      label: 'FAILED',
    },
  ],
  [
    'downloadable',
    {
      bgColor: 'bg-[var(--pd-notification-dot)]',
      txtColor: 'text-[var(--pd-status-ready)]',
      label: 'DOWNLOADABLE',
    },
  ],
]);
$: statusStyle = statusesStyle.get(status) ?? {
  bgColor: 'bg-[var(--pd-status-unknown)]',
  txtColor: 'text-[var(--pd-status-unknown)]',
  label: status.toUpperCase(),
};
</script>

<div aria-label="Extension Status Icon" class="bg-{roundIconStyle} {statusStyle.bgColor}"></div>
<span aria-label="Extension Status Label" class="{labelStyle} {statusStyle.txtColor}">{statusStyle.label}</span>
