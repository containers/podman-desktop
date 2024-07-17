/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { PropSidebarItem } from '@docusaurus/plugin-content-docs';
import { useLocation } from '@docusaurus/router';
import { ThemeClassNames, useColorMode } from '@docusaurus/theme-common';
import DocSidebar from '@theme/DocSidebar';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import styles from './styles.module.css';

// the iframe is by default not taking all height
// adding an observer to ensure it always takes all the space it need
function observe(iframe: HTMLIFrameElement): void {
  const body = iframe.contentDocument?.body;
  if (!body) return;

  const observerCallback: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    window.requestAnimationFrame((): void | undefined => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      iframe.style.height = `${body.scrollHeight}px`;
    });
  };
  const resizeObserver = new ResizeObserver(observerCallback);
  resizeObserver.observe(body);
}

function StorybookRoot(): JSX.Element {
  // eslint-disable-next-line no-null/no-null
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isDarkTheme } = useColorMode();

  const { search } = useLocation();
  const [id, setId] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const queryId = new URLSearchParams(search).get('id');
    if (queryId) {
      setId(queryId);
    }
  }, [search]);

  const storybookItems: PropSidebarItem[] = [];

  const notifyIframe = (): void => {
    // we send the iframe the dark mode change https://storybook.js.org/addons/storybook-dark-mode
    iframeRef?.current?.contentWindow?.postMessage(
      JSON.stringify({
        key: 'storybook-channel',
        event: { type: 'DARK_MODE', args: [isDarkTheme] },
      }),
    );
  };

  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement>): void => {
    // observe resize
    observe(e.currentTarget);

    // https://github.com/storybookjs/storybook/blob/1943ee6b88d89c963f15ef4087aeabe64d05c9a1/code/lib/core-events/src/index.ts#L65
    window.addEventListener('message', message => {
      if (message.source !== iframeRef?.current?.contentWindow) {
        return;
      }

      const data = JSON.parse(message.data);
      if (!('key' in data) || data['key'] !== 'storybook-channel') return;
      if (!('event' in data) || typeof data['event'] !== 'object' || data['event']['type'] !== 'docsRendered') return;

      notifyIframe();
    });
  };

  useEffect(() => {
    notifyIframe();
  }, [isDarkTheme]);

  return (
    <div className={clsx(styles.storybookRoot)}>
      <aside className={clsx(ThemeClassNames.docs.docSidebarContainer, styles.docSidebarContainer)}>
        <DocSidebar isHidden={false} onCollapse={() => {}} sidebar={storybookItems} path="/storybook"></DocSidebar>
      </aside>
      <iframe
        ref={iframeRef}
        onLoad={onLoad}
        src={`/storybook-iframe?id=${id}`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// to use `useColorMode` we need to be wrapped in Layout component
// ref https://docusaurus.io/docs/api/themes/configuration#use-color-mode
export default function Storybook(): JSX.Element {
  return (
    <Layout title="Storybook">
      <StorybookRoot />
    </Layout>
  );
}
