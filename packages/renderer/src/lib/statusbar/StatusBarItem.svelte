<script lang="ts">
import { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';

export let entry;

function iconClass(entry: StatusBarEntry): string | undefined {
  let iconClass = undefined;
  if (entry.enabled && entry.activeIconClass !== undefined && entry.activeIconClass.trim().length !== 0) {
    iconClass = entry.activeIconClass;
  } else if (!entry.enabled && entry.inactiveIconClass !== undefined && entry.inactiveIconClass.trim().length !== 0) {
    iconClass = entry.inactiveIconClass;
  }
  return iconClass;
}

function tooltipText(entry: StatusBarEntry): string {
  return entry.tooltip !== undefined ? entry.tooltip : '';
}

function opacity(entry: StatusBarEntry): string {
  return entry.enabled ? 'opacity-100' : 'opacity-25';
}

function hoverBackground(entry: StatusBarEntry): string {
  return entry.enabled && typeof entry.command === 'string' ? 'hover:bg-[#4d3782]' : '';
}

function hoverCursor(entry: StatusBarEntry): string {
  return entry.enabled && typeof entry.command === 'string' ? 'hover:cursor-pointer' : '';
}

async function executeCommand(entry: StatusBarEntry) {
  if (typeof entry.command === 'undefined') {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await window.executeStatusBarEntryCommand(entry.command, entry.commandArgs);
}
</script>

<div
  on:click="{() => {
    executeCommand(entry);
  }}"
  class="{opacity(entry)} px-1 {hoverBackground(entry)} {hoverCursor(entry)}"
  title="{tooltipText(entry)}">
  {#if iconClass(entry)}
    <i class="{iconClass(entry)}" aria-hidden="true"></i>
  {/if}
  {#if entry.text}
    <span class="ml-1">{entry.text}</span>
  {/if}
</div>
