<script lang="ts">
const statusesStyle = new Map<string, string>([
  ['Podman', 'fa-regular fa-circle-check'],
  ['OpenShift Local', 'fa-regular fa-circle-check'],
  ['Minikube', 'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent'],
  ['Kind', 'fa-regular fa-circle-dot'],
  [
    'Developer SandBox',
    'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent',
  ],
  ['failed', 'fa-circle-x'],
  ['not set up', 'fa-regular fa-exclamation-triangle text-[var(--pd-button-text)]'],
  ['update available', 'fa-regular fa-circle-arrow-up text-[var(--pd-button-text)]'],
]);
console.log(statusesStyle);
</script>
