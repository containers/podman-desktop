<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { get, type Unsubscriber } from 'svelte/store';

import { webviews } from '/@/stores/webviews';
import type { WebviewInfo } from '/@api/webview-info';

import Route from '../../Route.svelte';

// webview id
export let id: string;

// script to load for the webview
let preloadPath: string;

// exposed port of the server providing pages for the webview
let webViewPort: number | undefined;

// info about the webview retrieved from the id
let webviewInfo: WebviewInfo | undefined;

$: webviewInfo = get(webviews).find(webview => webview.id === id);

const notifyNewWebwievState = () => {
  if (webviewInfo) {
    window.makeDefaultWebviewVisible(webviewInfo.id);
  }
};

$: webviewInfo && notifyNewWebwievState();
// webview HTML element used to communicate
let webviewElement: HTMLWebViewElement | undefined;

// function to notify webview when messages are coming
const postMessageToWebview = (webviewEvent: unknown) => {
  const webviewEventTyped = webviewEvent as { id: string; message: unknown };
  if (id === webviewEventTyped.id) {
    (webviewElement as any)?.send('webview-post-message', { message: webviewEventTyped.message });
  }
};

// call postMessageToWebview when receiving messages from the main process
const webviewPostMessageDisposable = window.events?.receive('webview-post-message', postMessageToWebview);

const updateHtmlOfWebview = (webviewEvent: unknown) => {
  const webviewEventTyped = webviewEvent as { id: string; html: string };
  if (id === webviewEventTyped.id) {
    (webviewElement as any)?.send('webview-update-html', webviewEventTyped.html);
  }
};

const webviewUpdateHtmlDisposable = window.events?.receive('webview-update:html', updateHtmlOfWebview);

const openDevtoolsDisposable = window.events?.receive('dev-tools:open-webview', (id: unknown) => {
  if (id === webviewInfo?.id) {
    (webviewElement as any)?.openDevTools();
  }
});

let unsubscriber: Unsubscriber | undefined;
onMount(async () => {
  preloadPath = await window.getWebviewPreloadPath();
  webViewPort = await window.getWebviewRegistryHttpPort();

  // subscribe to webviews
  unsubscriber = webviews.subscribe(webviews => {
    webviewInfo = webviews.find(webview => webview.id === id);
  });
});

onDestroy(() => {
  webviewPostMessageDisposable.dispose();
  webviewUpdateHtmlDisposable.dispose();
  openDevtoolsDisposable.dispose();
  unsubscriber?.();

  // no webviews are visible anymore
  window.makeDefaultWebviewVisible('');
});
</script>

{#if preloadPath && webViewPort && webviewInfo}
  <Route path="/*" breadcrumb={webviewInfo.name}>
    <webview
      bind:this={webviewElement}
      aria-label="Webview {webviewInfo?.name}"
      role="document"
      httpreferrer="http://{webviewInfo?.uuid}.webview.localhost:{webViewPort}"
      src="http://{webviewInfo?.uuid}.webview.localhost:{webViewPort}?webviewId={webviewInfo?.id}"
      preload={preloadPath}
      style="height: 100%; width: 100%"></webview>
  </Route>
{/if}
