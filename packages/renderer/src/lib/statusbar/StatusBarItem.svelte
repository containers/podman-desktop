<script lang="ts">
import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
import { iconClass } from './StatusBarItem';

export let entry: StatusBarEntry;

function tooltipText(entry: StatusBarEntry): string {
  return entry.tooltip ?? '';
}

function opacity(entry: StatusBarEntry): string {
  return entry.enabled ? 'opacity-100' : 'opacity-25';
}

function hoverBackground(entry: StatusBarEntry): string {
  return entry.enabled && typeof entry.command === 'string' ? 'hover:bg-[var(--pd-statusbar-hover-bg)]' : '';
}

function hoverCursor(entry: StatusBarEntry): string {
  return entry.enabled && typeof entry.command === 'string' ? 'hover:cursor-pointer' : '';
}

async function executeCommand(entry: StatusBarEntry) {
  if (typeof entry.command === 'undefined') {
    return;
  }
  const command = entry.command;
  const commandArgs = entry.commandArgs;

  // convert args to a plain object and not as proxy of arguments
  const noProxyCommandArgs = commandArgs ? JSON.parse(JSON.stringify(commandArgs)) : undefined;
  await window.executeStatusBarEntryCommand(command, noProxyCommandArgs);
}
</script>

<button
  on:click={async () => {
    await executeCommand(entry);
  }}
  class="{opacity(entry)} px-1 py-px flex h-full items-center {hoverBackground(entry)} {hoverCursor(
    entry,
  )} relative inline-block"
  title={tooltipText(entry)}>
  {#if iconClass(entry)}
    <span class={iconClass(entry)} aria-hidden="true" data-task-button="{tooltipText(entry)}"></span>
  {/if}
  {#if entry.text}
    <span class="ml-1">{entry.text}</span>
  {/if}
  {#if entry.highlight}
    <span role="status" class="absolute bg-[var(--pd-notification-dot)] rounded-full p-1 top-[1px] right-[-1px]"></span>
  {/if}
</button>
