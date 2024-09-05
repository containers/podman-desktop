<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import { isDark } from '../../stores/appearance';
import { onDidChangeConfiguration } from '../../stores/configurationProperties';

let isDarkUnsubscribe: Unsubscriber;
let isDarkTheme = false;

const APPEARANCE_CONFIGURATION_KEY = AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance;
async function updateAppearance(): Promise<void> {
  const html = document.documentElement;

  // toggle the dark class on the html element
  if (isDarkTheme) {
    html.classList.add('dark');
    html.setAttribute('style', 'color-scheme: dark;');
  } else {
    html.classList.remove('dark');
    html.setAttribute('style', 'color-scheme: light;');
  }
}

let onDidChangeConfigurationCallback: EventListenerOrEventListenerObject = () => {
  // we refresh the appearance
  updateAppearance();
};

onMount(async () => {
  await updateAppearance();

  // add a listener for the appearance change in case user change setting on the Operating System
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    updateAppearance();
    // notify changes
    window.dispatchEvent(new Event('appearance-changed'));
  });

  isDarkUnsubscribe = isDark.subscribe(value => {
    isDarkTheme = value;
    updateAppearance();
  });
});

// now, need to do the same for the appearance setting
onDidChangeConfiguration.addEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);

// remove callback when the component is destroyed
onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);

  if (isDarkUnsubscribe) {
    isDarkUnsubscribe();
  }
});
</script>
