/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import Markdown from './Markdown.svelte';

async function waitRender(customProperties: object): Promise<void> {
  render(Markdown, { ...customProperties });
  await tick();
}

beforeAll(() => {
  Object.defineProperty(window, 'executeCommand', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getUrlProtocol).mockResolvedValue('podman-desktop');
});

test('Expect to have bold', async () => {
  await waitRender({ markdown: '**bold**' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<strong>bold</strong>');
});

test('Expect to have italic', async () => {
  await waitRender({ markdown: '_italic_' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<em>italic</em>');
});

describe('Custom button', () => {
  test('Expect button to be rendered as a link without attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<a class="px-4 py-[6px] rounded-[4px] text-[var(--pd-button-text)]! text-[13px] whitespace-nowrap bg-[var(--pd-button-primary-bg)] hover:bg-[var(--pd-button-primary-hover-bg)]! no-underline!">Name of the button</a>',
    );
  });

  test('Expect button to be rendered as a link with all attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]{href=https://my-link title="tooltip text"}' });
    const markdownButton = screen.getByRole('link');
    expect(markdownButton).toBeInTheDocument();
    expect(markdownButton).toHaveTextContent('Name of the button');
    expect(markdownButton).toHaveAttribute('href', 'https://my-link');
    expect(markdownButton).toHaveAttribute('title', 'tooltip text');
  });

  test('Expect button to be rendered as a button with attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]{command=command}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<button class="px-4 py-[6px] rounded-[4px] text-[var(--pd-button-text)] text-[13px] whitespace-nowrap bg-[var(--pd-button-primary-bg)] hover:bg-[var(--pd-button-primary-hover-bg)] no-underline"',
    );
    expect(markdownContent).toContainHTML('data-command="command"');
    expect(markdownContent).toContainHTML('Name of the button</button>');
  });

  test('Expect button to be rendered as a icon with args with default size ', async () => {
    vi.mocked(window.executeCommand).mockResolvedValue({});

    const icon = 'faIconIcon';
    await waitRender({ markdown: `:button[${icon}]{command=command args='["arg1"]'}` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      `<button class="fa-solid ${icon} before:px-1 fa-3x hover:text-[var(--pd-button-icon-primary-hover-text)]"`,
    );
    expect(markdownContent).toContainHTML('data-command="command"');
    expect(markdownContent).toContainHTML(`data-args="arg1"`);
    expect(markdownContent).toContainHTML('</button>');

    const iconButton = screen.getByRole('button', { name: icon });
    expect(iconButton).toBeDefined();
    await fireEvent.click(iconButton);
    expect(window.executeCommand).toBeCalledWith('command', 'arg1');
  });

  test('Expect button to be rendered as a icon with args with custom size ', async () => {
    vi.mocked(window.executeCommand).mockResolvedValue({});

    const icon = 'faIconIcon';
    await waitRender({ markdown: `:button[${icon}]{command=command args='["arg1"]' size='fa-xs'}` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      `<button class="fa-solid ${icon} before:px-1 fa-xs hover:text-[var(--pd-button-icon-primary-hover-text)]"`,
    );
    expect(markdownContent).toContainHTML('data-command="command"');
    expect(markdownContent).toContainHTML(`data-args="arg1"`);
    expect(markdownContent).toContainHTML('</button>');

    const iconButton = screen.getByRole('button', { name: icon });
    expect(iconButton).toBeDefined();
    await fireEvent.click(iconButton);
    expect(window.executeCommand).toBeCalledWith('command', 'arg1');
  });
});

describe('Custom link', () => {
  test('Expect link to be rendered as a link without attributes', async () => {
    await waitRender({ markdown: ':link[Name of the link]' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML('<a>Name of the link</a>');
  });

  test('Expect link to be rendered as a link with all attributes', async () => {
    await waitRender({ markdown: ':link[Name of the link]{href=https://my-link title="tooltip text"}' });
    const markdownLink = screen.getByRole('link');
    expect(markdownLink).toBeInTheDocument();
    expect(markdownLink).toHaveTextContent('Name of the link');
    expect(markdownLink).toHaveAttribute('href', 'https://my-link');
    expect(markdownLink).toHaveAttribute('title', 'tooltip text');
  });

  test('Expect link to be rendered as a link without href and with command attribute', async () => {
    await waitRender({ markdown: ':link[Name of the link]{command=example.onboarding.command.checkRequirements}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<a data-command="example.onboarding.command.checkRequirements">Name of the link</a>',
    );
  });

  test('expect a tags to be renderer as working links', async () => {
    await waitRender({ markdown: '- **important info**: some more info. <a href="/some/link">click here to test</a>' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML('<a href="/some/link">click here to test</a>');
  });

  test('expect internal protocol to be simplified', async () => {
    await waitRender({
      markdown: 'See <a href="podman-desktop://containers">containers</a>',
    });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML('<a href="/containers">containers</a>');
  });

  test('expect unknown protocol to be removed', async () => {
    await waitRender({
      markdown: 'See <a title="Foo link" href="foo://bar">foo</a>',
    });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });

    const link = within(markdownContent).getByTitle('Foo link');
    expect(link).toBeInTheDocument();
    expect(link).not.toHaveAttribute('href');
  });
});

describe('Custom image', () => {
  test('Expect image to be rendered as a image without attributes', async () => {
    await waitRender({ markdown: ':image[Name of the image]{src=path/to/image.png}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<img src="path/to/image.png" alt="Name of the image" class="max-w-full h-auto rounded-md shadow-md block transition-shadow duration-300" loading="lazy"/>',
    );
  });

  test('Expect base64 image to be rendered as a image', async () => {
    const src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    const alt = 'Base 64 Image';

    await waitRender({ markdown: `:image[${alt}]{src="${src}"}` });

    const img = screen.getByRole('img', { name: alt });
    expect(img).toBeInTheDocument();

    expect(img).toHaveAttribute('src', src);
  });

  test('Expect image to be rendered as a image with all attributes', async () => {
    await waitRender({
      markdown: ':image[Name of the image]{src=path/to/image.png title="Image title" width="300" height="200"}',
    });
    const markdownImage = screen.getByRole('img');
    expect(markdownImage).toBeInTheDocument();
    expect(markdownImage).toHaveAttribute('alt', 'Name of the image');
    expect(markdownImage).toHaveAttribute('height', '200');
    expect(markdownImage).toHaveAttribute('width', '300');
    expect(markdownImage).toHaveAttribute('title', 'Image title');
  });
});

describe('Custom warnings', () => {
  test('Expect warning failed status and description', async () => {
    const warnings = [
      {
        state: 'failed',
        description: 'description',
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('description');
    expect(markdownContent.textContent).toContain('❌');
  });

  test('Expect warning successful status and description', async () => {
    const warnings = [
      {
        state: 'successful',
        description: 'successful description',
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('successful description');
    expect(markdownContent.textContent).toContain('✅');
  });

  test('Expect command, docdescription and links to be rendered correctly', async () => {
    const warnings = [
      {
        state: 'successful',
        description: 'successful description',
        command: {
          id: 'command',
          title: 'command title',
        },
        docDescription: 'this is the doc description',
        docLinks: [
          {
            url: 'url',
            title: 'first link',
          },
        ],
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('this is the doc description');
    const button = screen.getByRole('button', { name: 'command title' });
    expect(button).toBeDefined();
    // open expandable section to check if link is there
    const moreInfoButton = screen.getByRole('button', { name: 'micromark-expandable-4' });
    expect(moreInfoButton).toBeDefined();
    await fireEvent.click(moreInfoButton);

    const link = screen.getByRole('link', { name: 'first link' });
    expect(link).toBeDefined();
  });

  test('Expect button to be in error mode if execution fails', async () => {
    vi.mocked(window.executeCommand).mockRejectedValue('error');
    const warnings = [
      {
        state: 'failed',
        description: 'failed description',
        command: {
          id: 'command',
          title: 'command title',
        },
        docDescription: 'this is the doc description',
        docLinks: [
          {
            url: 'url',
            title: 'first link',
          },
        ],
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(warnings)}]` });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent.textContent).toContain('this is the doc description');
    const button = screen.getByRole('button', { name: 'command title' });
    expect(button).toBeDefined();
    await fireEvent.click(button);

    const buttonFailedStatus = await screen.findByText('command title failed');
    expect(buttonFailedStatus).toBeDefined();
  });

  test('XSS prevention - comprehensive attack vectors', async () => {
    // Test multiple XSS attack vectors in different fields
    const attackVectors = [
      // Script injections
      {
        state: 'successful',
        description: '<script>alert(1)</script>',
        command: { id: 'cmd1', title: 'safe' },
      },
      {
        state: 'failed',
        description: '<script src=//evil.com></script>',
        command: { id: 'cmd2', title: 'safe' },
      },
      // Event handler injections
      {
        state: 'successful',
        description: '<img src=x onerror=alert(1)>',
        command: { id: 'cmd3', title: 'safe' },
      },
      {
        state: 'failed',
        description: '<svg onload=alert(1)>',
        command: { id: 'cmd4', title: 'safe' },
      },
      {
        state: 'successful',
        description: '<body onload=alert(1)>',
        command: { id: 'cmd5', title: 'safe' },
      },
      {
        state: 'failed',
        description: '<input onfocus=alert(1) autofocus>',
        command: { id: 'cmd6', title: 'safe' },
      },
      // JavaScript protocol
      {
        state: 'successful',
        description: 'safe',
        docLinks: [{ url: 'javascript:alert(1)', title: 'click' }],
      },
      {
        state: 'failed',
        description: 'safe',
        docLinks: [{ url: 'JaVaScRiPt:alert(1)', title: 'click' }],
      },
      // Data URIs
      {
        state: 'successful',
        description: 'safe',
        docLinks: [{ url: 'data:text/html,<script>alert(1)</script>', title: 'click' }],
      },
      // Iframe injection
      {
        state: 'failed',
        command: { id: 'cmd7', title: '<iframe src=javascript:alert(1)></iframe>' },
      },
      // HTML entity encoding bypass attempts
      {
        state: 'successful',
        description: '<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>',
        command: { id: 'cmd8', title: 'safe' },
      },
      // Object/embed tags
      {
        state: 'failed',
        description: '<object data=javascript:alert(1)>',
        command: { id: 'cmd9', title: 'safe' },
      },
      {
        state: 'successful',
        description: '<embed src=javascript:alert(1)>',
        command: { id: 'cmd10', title: 'safe' },
      },
      // Meta refresh
      {
        state: 'failed',
        description: '<meta http-equiv=refresh content=0;url=javascript:alert(1)>',
        command: { id: 'cmd11', title: 'safe' },
      },
      // Form action
      {
        state: 'successful',
        description: '<form action=javascript:alert(1)><button>click</button></form>',
        command: { id: 'cmd12', title: 'safe' },
      },
      // Link stylesheet
      {
        state: 'failed',
        description: '<link rel=stylesheet href=javascript:alert(1)>',
        command: { id: 'cmd13', title: 'safe' },
      },
      // Style tag
      {
        state: 'successful',
        description: '<style>body{background:url(javascript:alert(1))}</style>',
        command: { id: 'cmd14', title: 'safe' },
      },
      // Base tag
      {
        state: 'failed',
        description: '<base href=javascript:alert(1)//>',
        command: { id: 'cmd15', title: 'safe' },
      },
      // OnError in command title
      {
        state: 'successful',
        command: { id: 'cmd16', title: '<img src=x onerror=alert(1)>' },
      },
      // Multiple event handlers
      {
        state: 'failed',
        description: '<div onclick=alert(1) onmouseover=alert(2) onfocus=alert(3)>test</div>',
        command: { id: 'cmd17', title: 'safe' },
      },
      // SVG with various attacks
      {
        state: 'successful',
        docDescription: '<svg><script>alert(1)</script></svg>',
      },
      {
        state: 'failed',
        docDescription: '<svg><animate onbegin=alert(1)>',
      },
      // DocLinks title XSS
      {
        state: 'successful',
        docLinks: [{ url: '#', title: '<script>alert(1)</script>' }],
      },
      {
        state: 'failed',
        docLinks: [{ url: '#', title: '<img src=x onerror=alert(1)>' }],
      },
      // Template tag
      {
        state: 'successful',
        description: '<template><script>alert(1)</script></template>',
        command: { id: 'cmd18', title: 'safe' },
      },
      // HTML comments with script
      {
        state: 'failed',
        description: '<!--<script>alert(1)</script>-->',
        command: { id: 'cmd19', title: 'safe' },
      },
      // CDATA section
      {
        state: 'successful',
        description: '<![CDATA[<script>alert(1)</script>]]>',
        command: { id: 'cmd20', title: 'safe' },
      },
    ];

    await waitRender({ markdown: `:warnings[${JSON.stringify(attackVectors)}]` });

    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });

    // Verify no script tags made it through
    expect(markdownContent.querySelectorAll('script').length).toBe(0);

    // Verify no iframes
    expect(markdownContent.querySelectorAll('iframe').length).toBe(0);

    // Verify no dangerous elements
    expect(markdownContent.querySelectorAll('object').length).toBe(0);
    expect(markdownContent.querySelectorAll('embed').length).toBe(0);
    expect(markdownContent.querySelectorAll('meta').length).toBe(0);
    expect(markdownContent.querySelectorAll('base').length).toBe(0);
    expect(markdownContent.querySelectorAll('link[rel="stylesheet"]').length).toBe(0);

    // Verify no event handlers on any elements
    const allElements = markdownContent.querySelectorAll('*');
    const dangerousEvents = [
      'onload',
      'onerror',
      'onclick',
      'onmouseover',
      'onfocus',
      'onbegin',
      'onmouseout',
      'onkeydown',
      'onkeyup',
      'onchange',
      'onsubmit',
      'onanimationstart',
      'onanimationend',
      'ontransitionend',
    ];

    for (const el of allElements) {
      for (const event of dangerousEvents) {
        expect(el.hasAttribute(event)).toBe(false);
      }
      // Also check that no inline event handlers exist in the element's attributes
      for (let i = 0; i < el.attributes.length; i++) {
        const attrName = el.attributes[i].name.toLowerCase();
        expect(attrName.startsWith('on')).toBe(false);
      }
    }

    // Verify no javascript: protocols in links
    const links = markdownContent.querySelectorAll('a');
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href) {
        expect(href.toLowerCase()).not.toContain('javascript:');
        expect(href.toLowerCase()).not.toContain('data:text/html');
      }
    }

    // Verify no dangerous protocols in other elements
    const imgs = markdownContent.querySelectorAll('img');
    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (src) {
        expect(src.toLowerCase()).not.toContain('javascript:');
      }
    }
  });
});

describe('jump to TOC section', () => {
  test('Expect TOC to be clickable', async () => {
    await waitRender({
      markdown:
        '### Title\n#### Topics\n- [Technology](#technology)\n    - [Extension features](#extension-features)\n\n\n\n\n## Technology\nhello world',
    });

    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();

    // get all the <li> elements
    const allLi = screen.getAllByRole('listitem');
    // get the first <li> element
    const li = allLi[0];
    // get the first <a> element
    const technologyLink = li.querySelector('a');
    // check if the <a> element is defined

    expect(technologyLink).toBeDefined();

    // check the title
    expect(technologyLink).toHaveTextContent('Technology');

    // grab the h2 element
    const h2 = screen.getByRole('heading', { name: 'Technology' });
    // check if the h2 element is defined
    expect(h2).toBeDefined();
    // check the title
    expect(h2).toHaveTextContent('Technology');

    // add the scrollIntoView function to the window object
    h2.scrollIntoView = vi.fn();

    if (technologyLink) {
      await fireEvent.click(technologyLink);
    }

    // check we scrolled to the right section
    expect(h2.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  });
});
