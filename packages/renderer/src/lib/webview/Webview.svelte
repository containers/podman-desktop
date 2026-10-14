<script lang="ts">
import type { WebviewInfo } from '@desktop-framework/api';
import { onDestroy } from 'svelte';

import Route from '/@/Route.svelte';
import { webviews } from '/@/stores/webviews';

import { webviewLifecycle } from './webview-directive';

// webview id
interface Props {
  id: string;
}
let { id }: Props = $props();

// script to load for the webview
let preloadPath = $derived(await window.getWebviewPreloadPath());

// exposed port of the server providing pages for the webview
let webViewPort = $derived(await window.getWebviewRegistryHttpPort());

// webview HTML element used to communicate
let webviewElement = $state<HTMLElement | undefined>(undefined);

// info about the webview retrieved from the id
let webviewInfo: WebviewInfo | undefined = $derived($webviews.find(webview => webview.id === id));

// reactive options for webview lifecycle directive - updates when webviewInfo changes
let lifecycleOptions = $derived({ webviewInfo });

$effect(() => {
  if (webviewInfo) {
    window
      .makeDefaultWebviewVisible(webviewInfo.id)
      .catch((err: unknown) => console.error(`Error make default webview visible ${webviewInfo?.id}`, err));
  }
});

// function to notify webview when messages are coming
const postMessageToWebview = (webviewEvent: unknown): void => {
  const webviewEventTyped = webviewEvent as { id: string; message: unknown };
  if (
    id === webviewEventTyped.id &&
    webviewElement &&
    'send' in webviewElement &&
    typeof webviewElement.send === 'function'
  ) {
    webviewElement.send('webview-post-message', { message: webviewEventTyped.message });
  }
};

// call postMessageToWebview when receiving messages from the main process
const webviewPostMessageDisposable = window.events?.receive('webview-post-message', postMessageToWebview);

const updateHtmlOfWebview = (webviewEvent: unknown): void => {
  const webviewEventTyped = webviewEvent as { id: string; html: string };
  if (
    id === webviewEventTyped.id &&
    webviewElement &&
    'send' in webviewElement &&
    typeof webviewElement.send === 'function'
  ) {
    webviewElement.send('webview-update-html', webviewEventTyped.html);
  }
};

const webviewUpdateHtmlDisposable = window.events?.receive('webview-update:html', updateHtmlOfWebview);

const openDevtoolsDisposable = window.events?.receive('dev-tools:open-webview', (id: unknown) => {
  if (
    id === webviewInfo?.id &&
    webviewElement &&
    'openDevTools' in webviewElement &&
    typeof webviewElement.openDevTools === 'function'
  ) {
    webviewElement.openDevTools();
  }
});

onDestroy(() => {
  webviewPostMessageDisposable.dispose();
  webviewUpdateHtmlDisposable.dispose();
  openDevtoolsDisposable.dispose();

  // no webviews are visible anymore
  window
    .makeDefaultWebviewVisible('')
    .catch((err: unknown) => console.error('Error make default webviews visible', err));
});
</script>

{#if preloadPath && webViewPort && webviewInfo}
  <Route path="/*" breadcrumb={webviewInfo.name}>
    <webview
      bind:this={webviewElement}
      use:webviewLifecycle={lifecycleOptions}
      aria-label="Webview {webviewInfo?.name}"
      role="document"
      httpreferrer="http://{webviewInfo?.uuid}.webview.localhost:{webViewPort}"
      src="http://{webviewInfo?.uuid}.webview.localhost:{webViewPort}?webviewId={webviewInfo?.id}"
      preload={preloadPath}
      style="height: 100%; width: 100%"></webview>
  </Route>
{/if}
