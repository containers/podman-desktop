<script lang="ts">
interface Props {
  showTaskManager: boolean;
  outsideWindow?: HTMLDivElement;
  onUpdate?: (val: boolean) => void;
}
let { showTaskManager = $bindable(false), outsideWindow = $bindable(), onUpdate = (): void => {} }: Props = $props();

function toggle(val: boolean): void {
  showTaskManager = val;
  onUpdate(val);
}

function onWindowClick({ clientX, clientY, target }: MouseEvent): void {
  // grab the task manager button from the status bar
  const statusBarElement = document.querySelector('div[aria-label="Status Bar"]');
  const taskManagerButton = statusBarElement?.querySelector('button[title="Tasks"]');

  // if the task manager is not open, do not check anything
  if (!showTaskManager) {
    return;
  }

  // if clicking on the status bar registry that is toggling the task manager, ignore the click
  // check if target is a child of the task manager button
  if (taskManagerButton?.contains(target as Node)) {
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
