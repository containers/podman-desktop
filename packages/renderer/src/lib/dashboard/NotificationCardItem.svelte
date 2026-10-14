<script lang="ts">
import type { NotificationCard } from '@desktop-framework/api';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import Markdown from '/@/lib/markdown/Markdown.svelte';

interface Props {
  notification: NotificationCard;
}
let { notification }: Props = $props();

const notificationStyleMap = {
  info: {
    borderColor: 'border-[var(--pd-state-info)]',
    iconColor: 'text-[var(--pd-state-info)]',
    icon: 'fas fa-info-circle',
  },
  warn: {
    borderColor: 'border-[var(--pd-state-warning)]',
    iconColor: 'text-[var(--pd-state-warning)]',
    icon: 'fas fa-exclamation-triangle',
  },
  error: {
    borderColor: 'border-[var(--pd-state-error)]',
    iconColor: 'text-[var(--pd-state-error)]',
    icon: 'fas fa-circle-exclamation',
  },
};

const notificationStyle = $derived(notificationStyleMap[notification.type]);
</script>

<div
  class="bg-[var(--pd-content-card-bg)] text-[var(--pd-content-card-text)] p-4 w-full {notificationStyle.borderColor} border-t-[3px]"
  role="region"
  aria-label="id: {notification.id}">
  <div class="flex flex-row space-x-3">
    <div class="flex">
      <Icon 
        icon={notification.icon ?? notificationStyle.icon} 
        class={`${notification.iconColor ?? notificationStyle.iconColor} text-xl`} 
        title={`Notification icon - ${notification.type}`} 
      />
    </div>
    <div class="flex flex-col space-y-2 flex-1">
      <div class="flex flex-row items-center justify-between">
        <span class="font-medium" aria-label="Notification title">
          {notification.title}
        </span>
      </div>
      {#if notification.body}
        <span aria-label="Notification description">
          <Markdown markdown={notification.body} />
        </span>
      {/if}
    </div>
    {#if notification.markdownActions}
      <div class="flex mt-2 self-center">
        <Markdown markdown={notification.markdownActions} />
      </div>
    {/if}
    <div class="text-[var(--pd-content-card-carousel-card-header-text)]">
      <button
        class="p-1 hover:bg-[var(--pd-button-close-hover-bg)] hover:bg-opacity-10 transition-all rounded-[4px]"
        onclick={(): Promise<void> => window.removeNotification(notification.id)}
        aria-label={`Delete notification ${notification.id}`}
        title="Delete notification">
        <Icon icon={faXmark}/>
      </button>
    </div>
  </div>
</div>
