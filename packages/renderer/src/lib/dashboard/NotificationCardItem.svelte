<script lang="ts">
import { faCircleInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { NotificationCard } from '/@api/notification';

import Markdown from '../markdown/Markdown.svelte';

export let notification: NotificationCard;

async function removeNotification(id: number) {
  await window.removeNotification(id);
}
</script>

<div
  class="relative bg-[var(--pd-content-card-carousel-card-bg)] w-full py-4 px-5 rounded-md"
  role="region"
  aria-label="id: {notification.id}">
  <div class="flex flex-row">
    <div class="mr-3">
      {#if notification.type === 'info'}
        <Fa size="1.5x" class="text-[var(--pd-notification-dot)]" icon={faCircleInfo} />
      {/if}
    </div>
    <div class="flex flex-col space-y-2">
      <div class="text-[var(--pd-content-card-carousel-card-header-text)] font-bold" aria-label="Notification title">
        {notification.title}
      </div>
      <div class="text-[var(--pd-content-card-carousel-card-text)]" aria-label="Notification description">
        <Markdown markdown={notification.body ?? ''} />
      </div>
    </div>
  </div>
  {#if notification.markdownActions}
    <div class="w-full flex justify-center mt-2">
      <Markdown markdown={notification.markdownActions} />
    </div>
  {/if}
  <div class="absolute top-2 right-2 text-[var(--pd-content-card-carousel-card-header-text)]">
    <button on:click={() => removeNotification(notification.id)} aria-label={`Delete notification ${notification.id}`}>
      <Fa size="1x" icon={faXmark} />
    </button>
  </div>
</div>
