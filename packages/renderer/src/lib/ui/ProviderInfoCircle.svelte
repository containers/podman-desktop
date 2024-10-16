<script lang="ts">
let { type }: { type: 'kubernetes' | 'podman' | 'docker' | undefined } = $props();
let color = $state('');

// Each provider has a colour associated to it within tailwind, this is a map of those colours.
// bg-purple-600 = podman
// bg-sky-300    = docker
// bg-sky-600    = kubernetes
// bg-gray-900   = unknown
$effect(() => {
  switch (type) {
    case 'podman':
      color = 'bg-[var(--pd-provider-podman)]';
      break;
    case 'docker':
      color = 'bg-[var(--pd-provider-docker)]';
      break;
    case 'kubernetes':
      color = 'bg-[var(--pd-provider-kubernetes)]';
      break;
    default:
      color = 'bg-[var(--pd-provider-unknown)]';
  }
});
</script>

<div aria-label="Provider info circle" class="w-2 h-2 {color} rounded-full"></div>
