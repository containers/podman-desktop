<script lang="ts">
import { onMount, onDestroy } from 'svelte';

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import { onDidChangeConfiguration } from '../../stores/configurationProperties';

const APPEARANCE_CONFIGURATION_KEY = AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance;
async function updateAppearance(): Promise<void> {
  // get the configuration of the appearance
  const appearance = await window.getConfigurationValue<string>(APPEARANCE_CONFIGURATION_KEY);

  let isDark = false;

  if (appearance === AppearanceSettings.SystemEnumValue) {
    // need to read the system default theme using the window.matchMedia
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else if (appearance === AppearanceSettings.LightEnumValue) {
    isDark = false;
  } else if (appearance === AppearanceSettings.DarkEnumValue) {
    isDark = true;
  }

  const html = document.documentElement;

  // toggle the dark class on the html element
  if (isDark) {
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
  });
});

// now, need to do the same for the appearance setting
onDidChangeConfiguration.addEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);

// remove callback when the component is destroyed
onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);
});
</script>
