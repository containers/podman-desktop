<script lang="ts">
import type { NotificationCard } from '@desktop-framework/api';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { notificationQueue } from '/@/stores/notifications';

import NotificationCardItem from './NotificationCardItem.svelte';

let notificationsUnsubscribe: Unsubscriber;
let notifications: NotificationCard[] = [];

onMount(async () => {
  notificationsUnsubscribe = notificationQueue.subscribe(value => {
    // take only first 3 elements of the notifications queue
    notifications = value.filter(n => n.highlight).slice(0, 3);
  });
});

onDestroy(() => {
  if (notificationsUnsubscribe) {
    notificationsUnsubscribe();
  }
});
</script>

{#if notifications.length > 0}
  <div
    class="flex flex-col items-center justify-content space-y-3 my-5 px-5"
    role="region"
    aria-label="Notifications Box">
    {#each notifications as notification (notification.id)}
      <NotificationCardItem {notification} />
    {/each}
  </div>
{/if}
