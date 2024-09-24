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
      color = 'bg-purple-600';
      break;
    case 'docker':
      color = 'bg-sky-400';
      break;
    case 'kubernetes':
      color = 'bg-sky-600';
      break;
    default:
      color = 'bg-gray-900';
  }
});
</script>

<div aria-label="Provider info circle" class="w-2 h-2 {color} rounded-full"></div>
