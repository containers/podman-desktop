<script lang="ts">
import { onMount } from "svelte";
import type { CustomPickOptions } from "./quickpick-input";
import type { CustomPickItem, CustomPickSectionItem } from "@podman-desktop/api";

let prompt = '';
let currentId = 0;
let title = '';
let description = '';
let icon:  string | { light: string; dark: string };
let items: CustomPickItem[];
let selectedItems: string[] = [];
let canSelectMany = false;
let onAcceptCallback = false;
let multiline = false;

let validationEnabled = false;
let validationError = '';

let onChangeSelectionCallbackEnabled = false;

let display = false;

let customPickItems: { title: string; description: string; markDownContent: string; sections?: CustomPickSectionItem, selected?: boolean }[] = [];
let quickPickFilteredItems: { value: any; description: string; detail: string; checkbox: boolean }[] = quickPickItems;
let quickPickSelectedIndex = 0;
let quickPickSelectedFilteredIndex = 0;
let quickPickCanPickMany = false;

let inputElement: HTMLInputElement | HTMLTextAreaElement = undefined;
let outerDiv: HTMLDivElement = undefined;

onMount(() => {
  // handle the showCustomPick events
  window.events?.receive('showCustomPick:add', showCustomPickCallback);
});

async function showCustomPickCallback(options?: CustomPickOptions) {
  title = options.title;
  description = options.description;
  icon = options.icon;
  items = options.items;
  canSelectMany = options.canSelectMany;  

  if (options.onSelectCallback) {
    onChangeSelectionCallbackEnabled = true;
    // if there is 1+ items, notify that focus will be on it
    if (selectedItems.length > 0) {
      window.sendShowQuickPickOnSelect(currentId, 0); // todo create a new 
    }
  }

  // if 1+ items are selected by default
  items.forEach((item) => {
    if (item.selected) {
        selectedItems.push(item.title);
    }
  })

  display = true;

  await tick();

  if (display && inputElement) {
    inputElement.focus();
  }
};
</script>