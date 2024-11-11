<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';

interface Props {
  title: string;
  link: string;
  image: string;
}

let { title, link, image }: Props = $props();

async function openLink(): Promise<void> {
  await window.openExternal(link);
}
</script>

<div class="flex flex-col gap-4 p-4 bg-[var(--pd-content-card-carousel-card-bg)] hover:bg-[var(--pd-content-card-carousel-card-hover-bg)] rounded-md items-center">
  <img src={image} class="max-w-[100%] object-contain rounded-md self-start" alt={`${title} image`} />
  <div class="text-[var(--pd-content-card-carousel-card-header-text)] text-center font-semibold">{title}</div>
  <Button on:click={openLink}>Read more</Button>
</div>
