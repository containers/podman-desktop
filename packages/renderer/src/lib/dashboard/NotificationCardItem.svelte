<script lang="ts">
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { NotificationCard } from '../../../../main/src/plugin/api/notification';
import Markdown from '../markdown/Markdown.svelte';

export let notification: NotificationCard;

async function removeNotification(id: number) {
  await window.removeNotification(id);
}
</script>

<div class="relative bg-charcoal-700 w-full py-4 px-5 rounded-sm" role="region" aria-label="id: {notification.id}">
  <div class="flex flex-row">
    <div class="mr-3">
      {#if notification.type === 'info'}
        <Fa size="1.5x" class="text-purple-400" icon="{faCircleInfo}" />
      {/if}
    </div>
    <div class="flex flex-col text-sm space-y-2">
      <div class="font-bold" aria-label="Notification title">{notification.title}</div>
      <div aria-label="Notification description"><Markdown>{notification.body || ''}</Markdown></div>
    </div>
  </div>
  {#if notification.markdownActions}
    <div class="w-full flex justify-center mt-2">
      <Markdown>{notification.markdownActions}</Markdown>
    </div>
  {/if}
  <div class="absolute top-2 right-2">
    <button
      on:click="{() => removeNotification(notification.id)}"
      aria-label="{`Delete notification ${notification.id}`}">
      <Fa size="1x" icon="{faXmark}" />
    </button>
  </div>
</div>
