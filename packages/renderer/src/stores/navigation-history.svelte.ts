/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { HistoryStackEntry, NavigationHistoryPushInfo } from '@desktop-framework/api';
// svelte subpaths share one types entry, not real duplicates
/* eslint-disable import/no-duplicates */
import { SvelteSet } from 'svelte/reactivity';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { router } from 'tinro';

import DashboardIcon from '/@/lib/images/DashboardIcon.svelte';
import SettingsIcon from '/@/lib/images/SettingsIcon.svelte';
import { settingsNavigationEntries } from '/@/PreferencesNavigation';
import { extensionInfos } from '/@/stores/extensions';
import { kubernetesNoCurrentContext } from '/@/stores/kubernetes-no-current-context';
import { navigationRegistry, type NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';

export const BACK = 'back';
export const FORWARD = 'forward';

export type Direction = typeof BACK | typeof FORWARD;

export type HistoryEntryIcon = NavigationRegistryEntry['icon'];

export interface HistoryEntry {
  index: number;
  name: string;
  icon?: HistoryEntryIcon;
}

/**
 * Navigation history store
 *
 * @property stack - An array of history stack entries
 * @property index - The current index in the stack
 */
export const navigationHistory = $state<{
  stack: HistoryStackEntry[];
  index: number;
}>({
  stack: [],
  index: -1,
});

let isNavigatingHistory = false;

// Extensions being navigated to via back/forward — ignore their pushes
// until the navigation settles (webview re-mounts and replays initial route)
const extensionsNavigatingHistory = new SvelteSet<string>();

interface ParsedUrl {
  path: string;
  parts: string[];
}

/**
 * Parse URL into path (without query params) and parts (path segments)
 * @param url - The URL to parse
 * @returns Object with path and parts array
 * @example
 * parseUrl('/containers/abc123/logs?filter=running')
 * // => { path: '/containers/abc123/logs', parts: ['containers', 'abc123', 'logs'] }
 *
 * parseUrl('/')
 * // => { path: '/', parts: [] }
 */
function parseUrl(url: string): ParsedUrl {
  const path = url.split('?')[0];
  const parts = path.split('/').filter(Boolean);
  return { path, parts };
}

/**
 * Capitalize the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 * @example
 * capitalize('containers') // => 'Containers'
 * capitalize('pods') // => 'Pods'
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a maximum length, adding '...' if truncated
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation
 * @returns The truncated string
 * @example
 * truncate('very-long-container-name', 10) // => 'very-long-...'
 * truncate('short', 10) // => 'short'
 */
function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Extract resource type and name from URL parts
 * @param parts - URL path segments (from parseUrl)
 * @returns Object with typeLabel (capitalized resource type) and optional name
 * @example
 * extractResourceInfo([])
 * // => { typeLabel: 'Dashboard' }
 *
 * extractResourceInfo(['containers'])
 * // => { typeLabel: 'Containers' }
 *
 * extractResourceInfo(['containers', 'abc123', 'logs'])
 * // => { typeLabel: 'Containers', name: 'abc123' }
 *
 * extractResourceInfo(['kubernetes', 'pods', 'my-pod', 'default'])
 * // => { typeLabel: 'Pods', name: 'my-pod' }
 */
function extractResourceInfo(parts: string[]): { typeLabel: string; name?: string } {
  if (parts.length === 0) return { typeLabel: 'Dashboard' };

  const resourceType = parts[0];
  let typeLabel = capitalize(resourceType);
  let name: string | undefined;

  // Kubernetes resources: /kubernetes/pods/:name/:namespace
  if (resourceType === 'kubernetes') {
    if (parts.length >= 3) {
      // Detail page: has resource name
      typeLabel = capitalize(parts[1]);
      name = decodeURIComponent(parts[2]);
    }
    // else: base route like /kubernetes/pods - no resource name, typeLabel stays 'Kubernetes'
  }
  // Resources with middleware: /pods/podman/:name or /compose/details/:name
  else if ((parts[1] === 'podman' || parts[1] === 'details') && parts.length >= 3) {
    name = decodeURIComponent(parts[2]);
  }
  // Generic resources: /containers/:name (but not kubernetes base routes)
  else if (parts.length >= 2) {
    name = decodeURIComponent(parts[1]);
  }

  return { typeLabel, name };
}

/**
 * Convert a URL to a human-readable display name for navigation history
 * @param url - The URL to convert
 * @param registryBreadcrumb - Optional breadcrumb path from navigation registry
 * @returns Human-readable display name
 * @example
 * urlToDisplayName('/')
 * // => 'Dashboard'
 *
 * urlToDisplayName('/containers')
 * // => 'Containers'
 *
 * urlToDisplayName('/containers/abc123/logs')
 * // => 'Containers → abc123 → logs'
 *
 * urlToDisplayName('/kubernetes/pods', ['Kubernetes', 'Pods'])
 * // => 'Kubernetes → Pods'
 *
 * urlToDisplayName('/kubernetes/pods/my-pod/default/logs', ['Kubernetes', 'Pods'])
 * // => 'Kubernetes → Pods → my-pod → logs'
 */
function urlToDisplayName(url: string, registryBreadcrumb?: string[]): string {
  const { parts } = parseUrl(url);

  // Extract resource type and name
  const { typeLabel, name } = extractResourceInfo(parts);

  // Simple case: just the resource type (e.g., /containers)
  if (parts.length === 1) return typeLabel;

  // If we have a resource name (detail page)
  if (name) {
    // Build breadcrumb with resource name
    const breadcrumb =
      registryBreadcrumb && registryBreadcrumb.length > 0
        ? [...registryBreadcrumb, truncate(name, 20)]
        : [typeLabel, truncate(name, 20)];

    // Extract and add tab name (last segment) if present
    // For regular resources: /containers/:name/:tab (3+ parts)
    // For resources with middleware: /pods/podman/:name/:tab (4+ parts)
    // For kubernetes: /kubernetes/:type/:name/:namespace/:tab (5+ parts)
    const resourceType = parts[0];
    const minPartsForTab = resourceType === 'kubernetes' ? 5 : parts[1] === 'podman' || parts[1] === 'details' ? 4 : 3;

    // Tab is always the last segment if we have enough parts
    if (parts.length >= minPartsForTab) {
      const tabSegment = parts[parts.length - 1];
      breadcrumb.push(capitalize(tabSegment));
    }

    return breadcrumb.join(' → ');
  }

  return registryBreadcrumb?.length ? registryBreadcrumb.join(' → ') : typeLabel;
}

/**
 * Find navigation registry entry that matches a URL, returning entry and breadcrumb path
 * @param url - The URL to find in the registry
 * @param entries - Array of navigation registry entries to search
 * @param parentPath - Accumulator for breadcrumb path (used in recursion)
 * @returns Object with matching entry and full breadcrumb path, or undefined if not found
 * @example
 * findNavigationEntry('/containers/abc123/logs', registry)
 * // => { entry: { name: 'Containers', link: '/containers', ... }, breadcrumb: ['Containers'] }
 *
 * findNavigationEntry('/kubernetes/pods/my-pod', registry)
 * // => { entry: { name: 'Pods', link: '/kubernetes/pods', ... }, breadcrumb: ['Kubernetes', 'Pods'] }
 *
 * findNavigationEntry('/unknown', registry)
 * // => undefined
 */
function findNavigationEntry(
  url: string,
  entries: NavigationRegistryEntry[],
  parentPath: string[] = [],
): { entry: NavigationRegistryEntry; breadcrumb: string[] } | undefined {
  const { path } = parseUrl(url);

  for (const entry of entries) {
    const currentPath = [...parentPath, entry.name];

    // Check nested items (for groups and submenus)
    if (entry.items) {
      const found = findNavigationEntry(url, entry.items, currentPath);
      if (found) return found;
    }

    // Check if URL matches this entry's link
    if (path === entry.link || path.startsWith(entry.link + '/')) {
      return { entry, breadcrumb: currentPath };
    }
  }

  return undefined;
}

/**
 * Check if a URL matches a route pattern
 * @param url - The URL to check
 * @param routeHref - The route pattern to match against
 * @returns True if URL matches the route pattern
 * @example
 * matchesRoute('/preferences/default/resources', '/preferences/default/resources')
 * // => true (exact match)
 *
 * matchesRoute('/preferences/default/resources/cpu', '/preferences/default/resources')
 * // => true (starts with route + '/')
 *
 * matchesRoute('/preferences/other', '/preferences/default/resources')
 * // => false (different route)
 */
function matchesRoute(url: string, routeHref: string): boolean {
  return url === routeHref || url.startsWith(routeHref + '/') || (routeHref.endsWith('/') && url.startsWith(routeHref));
}

/**
 * Get display name and icon for a URL from navigation registry or fallback to URL parsing
 * @param url - The URL to get entry info for
 * @returns Object with display name and optional icon
 * @example
 * getEntryInfo('/')
 * // => { name: 'Dashboard', icon: { iconComponent: DashboardIcon } }
 *
 * getEntryInfo('/containers')
 * // => { name: 'Containers', icon: { ... } }
 *
 * getEntryInfo('/containers/abc123/logs')
 * // => { name: 'Containers → abc123', icon: { ... } }
 *
 * getEntryInfo('/preferences/default/resources')
 * // => { name: 'Resources', icon: { iconComponent: SettingsIcon } }
 */
function getEntryInfo(url: string): { name: string; icon?: HistoryEntryIcon } {
  const { path } = parseUrl(url);

  // Handle Dashboard
  if (path === '/') {
    return { name: 'Dashboard', icon: { iconComponent: DashboardIcon } };
  }

  // Handle Preferences
  if (path.startsWith('/preferences/default/')) {
    return { name: 'Preferences', icon: { iconComponent: SettingsIcon } };
  }

  // Check navigation registry
  const registry = get(navigationRegistry);
  const result = findNavigationEntry(url, registry);
  if (result) {
    // Always use urlToDisplayName, passing registry breadcrumb for base routes
    return { name: urlToDisplayName(url, result.breadcrumb), icon: result.entry.icon };
  }

  // Check settings navigation entries (sorted by specificity)
  const sortedEntries = settingsNavigationEntries.toSorted((a, b) => b.href.length - a.href.length);
  for (const route of sortedEntries) {
    if (matchesRoute(path, route.href)) {
      return {
        name: route.title,
        icon: route.icon ? { iconComponent: route.icon } : undefined,
      };
    }
  }

  // Fallback to URL-based name
  return { name: urlToDisplayName(url), icon: undefined };
}

/**
 * Get display name and icon for a history stack entry
 * @param stackEntry - The history stack entry to get info for
 * @returns Object with display name and optional icon
 * @example
 * getStackEntryInfo({ url: '/containers' })
 * // => { name: 'Containers', icon: { ... } }
 *
 * getStackEntryInfo({
 *   url: '/__extension__/my-extension/model-1',
 *   extensionEntry: { extensionId: 'my-extension', id: 'model-1', label: 'Model 1' },
 * })
 * // => { name: 'My Extension → Model 1', icon: { iconImage: '...' } }
 */
function getStackEntryInfo(stackEntry: HistoryStackEntry): { name: string; icon?: HistoryEntryIcon } {
  const { extensionEntry } = stackEntry;
  if (!extensionEntry) {
    return getEntryInfo(stackEntry.url);
  }

  const extension = get(extensionInfos).find(ext => ext.id === extensionEntry.extensionId);
  const label = truncate(extensionEntry.label, 24);

  return {
    name: extension ? `${truncate(extension.displayName, 24)} → ${label}` : label,
    icon: extension?.icon ? { iconImage: extension.icon } : undefined,
  };
}

/**
 * Navigate to a specific index in the history stack
 * @param index - The history stack index to navigate to
 * @returns True if navigation occurred, false if index is invalid or current
 * @example
 * // If history is ['/', '/containers', '/images'] and index is 1:
 * navigateToIndex(0) // navigates to '/', returns true
 * navigateToIndex(1) // already at index 1, returns false
 * navigateToIndex(5) // invalid index, returns false
 */
function navigateToIndex(index: number): boolean {
  if (index < 0 || index >= navigationHistory.stack.length || index === navigationHistory.index) {
    return false;
  }

  navigationHistory.index = index;
  const entry = navigationHistory.stack[index];
  if (entry?.extensionEntry) {
    extensionsNavigatingHistory.add(entry.extensionEntry.extensionId);
    window
      .navigateToExtensionHistoryEntry(entry.extensionEntry.extensionId, entry.extensionEntry.id)
      .catch(console.error);
  } else if (entry) {
    isNavigatingHistory = true;
    router.goto(entry.url);
  }
  return true;
}

/**
 * Navigate back one step in history (browser-like back button)
 * @example
 * // If history is ['/', '/containers', '/images'] and currently at index 2:
 * goBack() // navigates to '/containers' (index 1)
 */
export function goBack(): void {
  if (navigateToIndex(navigationHistory.index - 1)) {
    window.telemetryTrack('navigation.back').catch(console.error);
  }
}

/**
 * Navigate forward one step in history (browser-like forward button)
 * @example
 * // If history is ['/', '/containers', '/images'] and currently at index 0:
 * goForward() // navigates to '/containers' (index 1)
 */
export function goForward(): void {
  if (navigateToIndex(navigationHistory.index + 1)) {
    window.telemetryTrack('navigation.forward').catch(console.error);
  }
}

/**
 * Navigate to a URL while replacing the current history entry instead of pushing.
 * Used for auto-redirects (e.g. detail page base path → default tab) so that the
 * transient redirect URL does not remain in the stack and trap the user in a loop.
 * @param url - The URL to navigate to
 * @example
 * // Stack: ['/', '/containers', '/containers/abc123/'], index 2
 * replaceCurrentUrl('/containers/abc123/tty')
 * // Stack: ['/', '/containers', '/containers/abc123/tty'], index 2
 */
export function replaceCurrentUrl(url: string): void {
  if (navigationHistory.index >= 0 && navigationHistory.index < navigationHistory.stack.length) {
    const currentEntry = navigationHistory.stack[navigationHistory.index];
    if (currentEntry?.url === url) {
      return;
    }
    navigationHistory.stack = navigationHistory.stack.map((entry, i) =>
      i === navigationHistory.index ? { url } : entry,
    );
    isNavigatingHistory = true;
  }
  // When the stack is empty (no entry to replace), we intentionally skip setting
  // isNavigatingHistory so the router subscription pushes the URL as a new entry.
  router.goto(url);
}

// In production we are going from 'index.html' to the Dashboard page during startup, so we need to skip this route
function isValidRoute(url: string): boolean {
  // Must start with '/' for relative routes
  if (!url.startsWith('/')) {
    return false;
  }

  if (url.includes('.html')) {
    return false;
  }

  return true;
}

/**
 * Navigate to a specific index in the history stack (public API)
 * @param index - The history stack index to navigate to
 * @example
 * // User clicks on a specific history entry in a dropdown
 * goToHistoryIndex(3) // jumps to the entry at index 3
 */
export function goToHistoryIndex(index: number): void {
  navigateToIndex(index);
}

/**
 * Get history entries in a specific direction (back or forward)
 * @param direction - Either BACK or FORWARD
 * @returns Array of history entries with index, name, and icon
 * @example
 * // If history is ['/', '/containers', '/images', '/volumes'] and index is 2:
 * getEntries(BACK)
 * // => [
 * //   { index: 1, name: 'Containers', icon: {...} },
 * //   { index: 0, name: 'Dashboard', icon: {...} }
 * // ]
 *
 * getEntries(FORWARD)
 * // => [{ index: 3, name: 'Volumes', icon: {...} }]
 */
function getEntries(direction: Direction): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  const start = direction === BACK ? navigationHistory.index - 1 : navigationHistory.index + 1;
  const condition = (i: number): boolean => (direction === BACK ? i >= 0 : i < navigationHistory.stack.length);
  const step = direction === BACK ? -1 : 1;

  for (let i = start; condition(i); i += step) {
    const url = navigationHistory.stack[i];
    if (url) {
      const info = getStackEntryInfo(url);
      entries.push({
        index: i,
        name: info.name,
        icon: info.icon,
      });
    }
  }
  return entries;
}

/**
 * Get all history entries that can be navigated backward to
 * @returns Array of history entries before the current position
 * @example
 * // If history is ['/', '/containers', '/images'] and currently at index 2:
 * getBackEntries()
 * // => [
 * //   { index: 1, name: 'Containers', icon: {...} },
 * //   { index: 0, name: 'Dashboard', icon: {...} }
 * // ]
 */
export function getBackEntries(): HistoryEntry[] {
  return getEntries(BACK);
}

/**
 * Get all history entries that can be navigated forward to
 * @returns Array of history entries after the current position
 * @example
 * // If history is ['/', '/containers', '/images'] and currently at index 0:
 * getForwardEntries()
 * // => [
 * //   { index: 1, name: 'Containers', icon: {...} },
 * //   { index: 2, name: 'Images', icon: {...} }
 * // ]
 */
export function getForwardEntries(): HistoryEntry[] {
  return getEntries(FORWARD);
}

/**
 * Check if a URL is a submenu base route that immediately redirects.
 * Submenu routes (like /kubernetes) redirect to their first item (like /kubernetes/dashboard)
 * and should not be added to history to prevent navigation issues when going back.
 */
function isSubmenuBaseRoute(url: string): boolean {
  const registry = get(navigationRegistry);
  return registry.some(entry => entry.type === 'submenu' && entry.link === url);
}

// Initialize router subscription
router.subscribe(navigation => {
  if (navigation.url) {
    if (isNavigatingHistory) {
      isNavigatingHistory = false;
      return;
    }

    // Skip submenu base routes - they immediately redirect to a sub-page
    // and shouldn't be in the history stack
    if (isSubmenuBaseRoute(navigation.url)) {
      // When going to Kubernetes page (submenu) - `/kubernetes` and you:
      // 1. DONT have created cluster yet, you will be redirected to the Empty page - `/kubernetes`
      // 2. HAVE created cluster, you are imidiatly redirected to the Dashboard page - `/kubernetes/dashboard`
      // When going back in case:
      // 1. We want to go to `/kubernetes` page where should be the Empty Kubernetes page
      // 2. We want to skip the `kubernetes` submenu base route - `/kubernetes` since we have not actually navigated to it
      // (we have been imidiatly redirected to the Kubernetes Dashboard page)
      if (!get(kubernetesNoCurrentContext)) {
        return;
      }
    }

    if (!isValidRoute(navigation.url)) {
      return;
    }

    // Skip webview/contribs URLs — extensions push their own history entries via
    // navigation.pushHistoryEntry, so recording the plain URL too would cause
    // duplicate/interleaved entries for the same navigation.
    const urlPath = navigation.url.split('?')[0];
    if (urlPath.startsWith('/webviews/') || urlPath.startsWith('/contribs/')) {
      return;
    }

    // Truncate forward history if we're not at the end
    if (navigationHistory.index < navigationHistory.stack.length - 1) {
      navigationHistory.stack = navigationHistory.stack.slice(0, navigationHistory.index + 1);
    }

    const currentEntry = navigationHistory.stack[navigationHistory.index];

    // Add every URL change to history (including tab changes)
    if (currentEntry?.url !== navigation.url) {
      navigationHistory.stack = [...navigationHistory.stack, { url: navigation.url }];
      navigationHistory.index = navigationHistory.stack.length - 1;
    }
  }
});

// Listen for navigation commands from command palette
window.events?.receive('navigation-go-back', () => {
  goBack();
});

window.events?.receive('navigation-go-forward', () => {
  goForward();
});

// Listen for history entries pushed by extensions via navigation.pushHistoryEntry
window.events?.receive('navigation-history-push', (entry: NavigationHistoryPushInfo) => {
  // The extension is replaying its initial route after being navigated to via
  // back/forward (webview re-mount) — this push is stale, ignore it once.
  if (extensionsNavigatingHistory.has(entry.extensionId)) {
    extensionsNavigatingHistory.delete(entry.extensionId);
    return;
  }

  // Truncate forward history if we're not at the end
  if (navigationHistory.index < navigationHistory.stack.length - 1) {
    navigationHistory.stack = navigationHistory.stack.slice(0, navigationHistory.index + 1);
  }

  const currentEntry = navigationHistory.stack[navigationHistory.index];
  const isSameEntry =
    currentEntry?.extensionEntry?.extensionId === entry.extensionId && currentEntry?.extensionEntry?.id === entry.id;

  if (!isSameEntry) {
    const stackEntry: HistoryStackEntry = {
      url: `/__extension__/${entry.extensionId}/${entry.id}`,
      extensionEntry: entry,
    };
    navigationHistory.stack = [...navigationHistory.stack, stackEntry];
    navigationHistory.index = navigationHistory.stack.length - 1;
  }
});
