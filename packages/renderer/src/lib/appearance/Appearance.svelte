<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import { onDidChangeConfiguration } from '../../stores/configurationProperties';
import { AppearanceUtil } from './appearance-util';

const APPEARANCE_CONFIGURATION_KEY = AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance;
async function updateAppearance(): Promise<void> {
  const html = document.documentElement;

  // toggle the dark class on the html element
  const appearanceUtil = new AppearanceUtil();
  let isDark = await appearanceUtil.isDarkMode();
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
    // notify changes
    window.dispatchEvent(new Event('appearance-changed'));
  });
});

// now, need to do the same for the appearance setting
onDidChangeConfiguration.addEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);

// remove callback when the component is destroyed
onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(APPEARANCE_CONFIGURATION_KEY, onDidChangeConfigurationCallback);
});
</script>
