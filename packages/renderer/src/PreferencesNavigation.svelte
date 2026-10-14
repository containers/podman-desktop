<script lang="ts">
import { DockerCompatibilitySettings } from '@desktop-framework/api';
import { CONFIGURATION_DEFAULT_SCOPE } from '@desktop-framework/api/configuration';
import { SettingsNavItem } from '@podman-desktop/ui-svelte';
import { onMount, tick } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

import PreferencesIcon from '/@/lib/images/PreferencesIcon.svelte';
import ShortcutArrowIcon from '/@/lib/images/ShortcutArrowIcon.svelte';
import { type NavItem, settingsNavigationEntries, type SettingsNavItemConfig } from '/@/PreferencesNavigation';

import { configurationProperties } from './stores/configurationProperties';
import { onDidChangeRegisteredFeatures, registeredFeatures } from './stores/registered-features';

interface Props {
  meta: TinroRouteMeta;
}

let { meta }: Props = $props();

let configProperties: Map<string, NavItem[]> = $state(new Map<string, NavItem[]>());
let sectionExpanded: { [key: string]: boolean } = $state(
  Object.fromEntries(settingsNavigationEntries.filter(e => e.expanded).map(e => [e.title, true])),
);

let experimentalSection: boolean = $state(false);

let settingsNavigationItems: SettingsNavItemConfig[] = $state(settingsNavigationEntries);

let navigationElement: HTMLElement | undefined = $state();
let navigationWidthPx: number | undefined = $state();
const MIN_CONTENT_WIDTH_PX = 80;

function measureTitleTextWidth(titleElement: HTMLElement): number {
  const titleText = titleElement.textContent ?? '';
  if (!titleText.trim() || !document.body) {
    return Math.ceil(titleElement.scrollWidth);
  }

  const titleStyle = typeof window.getComputedStyle === 'function' ? window.getComputedStyle(titleElement) : undefined;

  const measurementElement = document.createElement('span');
  measurementElement.textContent = titleText;
  measurementElement.style.position = 'absolute';
  measurementElement.style.visibility = 'hidden';
  measurementElement.style.pointerEvents = 'none';
  measurementElement.style.whiteSpace = 'nowrap';
  measurementElement.style.font = titleStyle?.font ?? '';
  measurementElement.style.fontSize = titleStyle?.fontSize ?? '';
  measurementElement.style.fontWeight = titleStyle?.fontWeight ?? '';
  measurementElement.style.fontFamily = titleStyle?.fontFamily ?? '';
  measurementElement.style.letterSpacing = titleStyle?.letterSpacing ?? '';
  measurementElement.style.textTransform = titleStyle?.textTransform ?? '';

  document.body.appendChild(measurementElement);
  const textWidth = Math.ceil(measurementElement.getBoundingClientRect().width);
  measurementElement.remove();

  return textWidth;
}

function measureRowNonTitleWidth(rowElement: HTMLElement): number {
  if (!document.body) {
    return 0;
  }

  const measurementRow = rowElement.cloneNode(true) as HTMLElement;
  const measurementTitle = measurementRow.querySelector<HTMLElement>('[data-settings-nav-title]');
  if (measurementTitle) {
    measurementTitle.textContent = '';
    measurementTitle.style.width = '0';
    measurementTitle.style.minWidth = '0';
    measurementTitle.style.maxWidth = '0';
    measurementTitle.style.padding = '0';
    measurementTitle.style.margin = '0';
    measurementTitle.style.border = '0';
  }

  measurementRow.style.position = 'absolute';
  measurementRow.style.visibility = 'hidden';
  measurementRow.style.pointerEvents = 'none';
  measurementRow.style.left = '-9999px';
  measurementRow.style.top = '0';
  measurementRow.style.width = 'max-content';
  measurementRow.style.minWidth = '0';
  measurementRow.style.maxWidth = 'none';

  document.body.appendChild(measurementRow);
  const nonTitleWidth = Math.ceil(measurementRow.getBoundingClientRect().width);
  measurementRow.remove();

  return nonTitleWidth;
}

function updateNavigationWidth(): void {
  if (!navigationElement) {
    return;
  }

  const computedStyle =
    typeof window.getComputedStyle === 'function' ? window.getComputedStyle(navigationElement) : undefined;
  const minWidth = Number.parseFloat(computedStyle?.minWidth ?? '') || navigationElement.clientWidth;
  let requiredWidth = minWidth;

  const titleElements = navigationElement.querySelectorAll<HTMLElement>('[data-settings-nav-title]');
  for (const titleElement of titleElements) {
    const rowElement = titleElement.closest<HTMLElement>('[data-settings-nav-row]');
    if (!rowElement) {
      continue;
    }

    const titleWhiteSpace =
      typeof window.getComputedStyle === 'function' ? window.getComputedStyle(titleElement).whiteSpace : 'nowrap';
    const fullTitleWidth =
      titleWhiteSpace === 'nowrap'
        ? Math.ceil(titleElement.scrollWidth)
        : Math.ceil(measureTitleTextWidth(titleElement));
    const otherContentWidth = measureRowNonTitleWidth(rowElement);
    const rowRequiredWidth = Math.ceil(otherContentWidth + fullTitleWidth + 8);
    if (rowRequiredWidth > requiredWidth) {
      requiredWidth = rowRequiredWidth;
    }
  }

  const viewportWidth = typeof window.innerWidth === 'number' ? window.innerWidth : 1024;
  // Allow very long labels while keeping a small visible content pane.
  const maxNavigationWidthPx = Math.max(minWidth, viewportWidth - MIN_CONTENT_WIDTH_PX);

  const nextWidth = Math.min(Math.max(requiredWidth, minWidth), maxNavigationWidthPx);
  const nextWidthState = nextWidth > minWidth ? nextWidth : undefined;
  if (navigationWidthPx !== nextWidthState) {
    navigationWidthPx = nextWidthState;
  }
}

function scheduleNavigationWidthUpdate(): void {
  // Measure after next paint so newly-shown items have final layout metrics.
  tick().then(updateNavigationWidth).catch(updateNavigationWidth);
}

function updateDockerCompatibility(): void {
  window
    .getConfigurationValue<boolean>(`${DockerCompatibilitySettings.SectionName}.${DockerCompatibilitySettings.Enabled}`)
    .then(result => {
      if (result !== undefined) {
        const index = settingsNavigationEntries.findIndex(entry => entry.title === 'Docker Compatibility');
        if (index !== -1) {
          settingsNavigationItems[index].visible = result;
          scheduleNavigationWidthUpdate();
        }
      }
    })
    .catch((err: unknown) =>
      console.error(
        `Error getting configuration value ${DockerCompatibilitySettings.SectionName}.${DockerCompatibilitySettings.Enabled}`,
        err,
      ),
    );
}

function sortItems(items: NavItem[]): NavItem[] {
  return items.toSorted((a, b) => a.title.localeCompare(b.title));
}

const kubernetesContextsManagerFeature = 'kubernetes-contexts-manager';

function updateKubernetesVisibility(enabled: boolean): void {
  const kubernetesIndex = settingsNavigationItems.findIndex(entry => entry.title === 'Kubernetes');
  if (kubernetesIndex !== -1) {
    settingsNavigationItems[kubernetesIndex].visible = !enabled;
    scheduleNavigationWidthUpdate();
  }
}

const featureListener = (event: Event): void => {
  updateKubernetesVisibility((event as CustomEvent<boolean>).detail);
};

onMount(() => {
  const resizeListener = (): void => {
    scheduleNavigationWidthUpdate();
  };

  let resizeObserver: ResizeObserver | undefined;
  if (navigationElement && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleNavigationWidthUpdate();
    });
    const resizeTarget = navigationElement.parentElement ?? navigationElement;
    resizeObserver.observe(resizeTarget);
  }

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('resize', resizeListener);
  }

  onDidChangeRegisteredFeatures.addEventListener(kubernetesContextsManagerFeature, featureListener);

  const unsubFeatures = registeredFeatures.subscribe(features => {
    updateKubernetesVisibility(features.includes(kubernetesContextsManagerFeature));
  });

  const unsubConfig = configurationProperties.subscribe(value => {
    // update compatibility
    updateDockerCompatibility();

    // check for experimental configuration
    experimentalSection = value.some(configuration => !!configuration.experimental);

    const experimentalIndex = settingsNavigationEntries.findIndex(entry => entry.title === 'Experimental');
    if (experimentalIndex !== -1) {
      settingsNavigationItems[experimentalIndex].visible = experimentalSection;
    }

    // update config properties
    const nextConfigProperties = value.reduce((map, current) => {
      // filter on default scope
      if (current.scope !== CONFIGURATION_DEFAULT_SCOPE) return map;

      // do not include hidden property
      if (current.hidden) return map;

      let [parentLeftId] = current.parentId.split('.');
      const array: NavItem[] = map.get(parentLeftId) ?? [];

      let children = array.find((item: NavItem) => item.id === current.parentId);
      if (children === undefined) {
        map.set(parentLeftId, [...array, { id: current.parentId, title: current.title }]);
      }
      return map;
    }, new Map<string, NavItem[]>());

    configProperties = nextConfigProperties;

    // Drop expansion flags for dynamic config sections no longer present to avoid stale widened width.
    // Preserve expansion state for static navigation entries.
    sectionExpanded = Object.fromEntries(
      Object.entries(sectionExpanded).filter(
        ([sectionId]) =>
          nextConfigProperties.has(sectionId) || settingsNavigationItems.some(e => e.title === sectionId),
      ),
    );

    scheduleNavigationWidthUpdate();
  });

  scheduleNavigationWidthUpdate();

  return (): void => {
    if (typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', resizeListener);
    }
    resizeObserver?.disconnect();
    unsubConfig();
    unsubFeatures();
    onDidChangeRegisteredFeatures.removeEventListener(kubernetesContextsManagerFeature, featureListener);
  };
});
</script>

<nav
  bind:this={navigationElement}
  style:width={navigationWidthPx ? `${navigationWidthPx}px` : undefined}
  class="z-1 w-leftsidebar min-w-leftsidebar max-w-none shrink-0 flex-col justify-between flex bg-[var(--pd-secondary-nav-bg)] border-[var(--pd-global-nav-bg-border)] border-r-[1px]"
  aria-label="PreferencesNavigation">
  <div class="flex items-center">
    <div class="pt-4 px-3 mb-5">
      <p
        class="text-xl font-semibold text-[color:var(--pd-secondary-nav-header-text)] border-l-[4px] border-transparent">
        Settings
      </p>
    </div>
  </div>
  <div class="h-full overflow-y-auto" style="margin-bottom:auto">
    {#each settingsNavigationItems as navItem, index (index)}
      {#if navItem.visible}
        {@const visibleChildren = navItem.children?.filter(c => c.visible) ?? []}
        <SettingsNavItem
          title={navItem.title}
          href={navItem.href}
          icon={navItem.icon}
          section={visibleChildren.length > 0}
          selected={meta.url === navItem.href && !visibleChildren.some(c => c.href === meta.url)}
          onClick={scheduleNavigationWidthUpdate}
          bind:expanded={sectionExpanded[navItem.title]} />
        {#if sectionExpanded[navItem.title]}
          {#each visibleChildren as child (child.href)}
            <SettingsNavItem
              title={child.title}
              href={child.href}
              icon={child.icon}
              child={true}
              selected={meta.url === child.href}
              onClick={scheduleNavigationWidthUpdate} />
          {/each}
        {/if}
      {/if}
    {/each}

    <!-- Default configuration properties start -->
    {#each configProperties as [configSection, configItems] (configSection)}
      <SettingsNavItem
        title={configSection}
        href="/preferences/default/{configSection}"
        icon={PreferencesIcon}
        section={configItems.length > 0}
        selected={meta.url === `/preferences/default/${configSection}`}
        onClick={scheduleNavigationWidthUpdate}
        bind:expanded={sectionExpanded[configSection]} />
      {#if sectionExpanded[configSection]}
        {#each sortItems(configItems) as configItem (configItem.id)}
          <SettingsNavItem
            title={configItem.title}
            href="/preferences/default/{configItem.id}"
            child={true}
            onClick={scheduleNavigationWidthUpdate}
            selected={meta.url === `/preferences/default/${configItem.id}`} />
        {/each}
      {/if}
    {/each}
    <!-- Default configuration properties end -->
    <div class="mx-3 my-2 border-t border-(--pd-global-nav-bg-border)"></div>
    <SettingsNavItem
      icon='fas fa-crosshairs'
      iconRight={ShortcutArrowIcon}
      iconRightAlign="end"
      title="Troubleshooting"
      href="/troubleshooting/repair-connections"
      onClick={scheduleNavigationWidthUpdate}
      selected={meta.url === '/troubleshooting/repair-connections'}
    />
  </div>
</nav>
