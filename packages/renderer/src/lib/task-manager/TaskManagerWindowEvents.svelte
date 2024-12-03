<script lang="ts">
let {
  showTaskManager = $bindable(false),
  outsideWindow = $bindable(),
  onUpdate = (): void => {},
}: {
  showTaskManager: boolean;
  outsideWindow: HTMLDivElement | undefined;
  onUpdate?: (val: boolean) => void;
} = $props();

function toggle(val: boolean): void {
  showTaskManager = val;
  onUpdate(val);
}

function onWindowClick({ clientX, clientY }: MouseEvent): void {
  // if the task manager is not open, do not check anything
  if (!showTaskManager) {
    return;
  }

  if (outsideWindow) {
    // get the bounds of the task manager
    const bounds = outsideWindow.getBoundingClientRect();

    // check mouse inside the task manager
    if (clientX >= bounds.left && clientX <= bounds.right && clientY >= bounds.top && clientY <= bounds.bottom) {
      return;
    }
    // else hide the task manager
    toggle(false);
  }
}

// If we hit ESC while the menu is open, close it
function onKeyup({ key }: KeyboardEvent): void {
  // if the task manager is not open, do not check any keys
  if (!showTaskManager) {
    return;
  }
  if (key === 'Escape') {
    toggle(false);
  }
}

// listen to the event "toggle-task-manager" to toggle the task manager
window.events?.receive('toggle-task-manager', () => {
  toggle(!showTaskManager);
});
</script>

<!-- track keys like "ESC" or clicking -->
<svelte:window onkeyup={onKeyup} onclick={onWindowClick} />
