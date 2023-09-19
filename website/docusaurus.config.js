// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'podman desktop';

const inDevMode = process.env.NODE_ENV === 'development';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Podman Desktop',
  url: inDevMode ? 'http://localhost:3000' : 'https://podman-desktop.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'containers',
  projectName: 'podman-desktop',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  plugins: [
    async () => {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
    'docusaurus-plugin-goatcounter',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/docs/compose',
            from: ['/docs/compose/compose-spec', '/docs/compose/podman-compose'],
          },
          {
            to: '/docs/getting-started',
            from: ['/docs/getting-started/getting-started'],
          },
        ],
      },
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/containers/podman-desktop/tree/main/website',
        },
        blog: {
          blogTitle: 'Podman Desktop blog!',
          blogDescription: 'Discover articles about Podman Desktop',
          postsPerPage: 'ALL',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} Podman Desktop`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
          hideable: true,
        },
      },
      navbar: {
        title,
        logo: {
          alt: 'Podman Desktop Logo',
          src: 'img/logo.svg',
          height: '56',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'mySidebar',
            position: 'left',
            label: 'Documentation',
          },
          { to: '/core-values', label: 'Core Values', position: 'left' },
          { to: '/features', label: 'Features', position: 'left' },
          { to: '/downloads', label: 'Downloads', position: 'left' },
          { to: '/extend', label: 'Extend', position: 'left' },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/containers/podman-desktop',
            className: 'header-github-link',
            position: 'right',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Installing Podman Desktop',
                to: '/docs/Installation',
              },
              {
                label: 'Getting started',
                to: '/docs/getting-started/getting-started',
              },
              {
                label: 'Migrating from Docker',
                to: '/docs/migrating-from-docker',
              },
              {
                label: 'Using Compose',
                to: '/docs/compose/podman-compose',
              },
              {
                label: 'Troubleshooting',
                to: '/docs/troubleshooting',
              },
            ],
          },
          {
            title: 'Links',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/containers/podman-desktop',
              },
              {
                label: 'General chat (bridged): #podman-desktop on Discord',
                href: 'https://discord.com/invite/x5GzFF6QH4',
              },
              {
                label: 'General chat (bridged): #podman-desktop@libera.chat on IRC',
                href: 'https://libera.chat',
              },
              {
                label: 'General chat (bridged): #podman-desktop@fedora.im on Matrix',
                href: 'https://fedora.im',
              },
              {
                label: 'Kubernetes chat: Join #podman-desktop on the Kubernetes Slack',
                href: 'https://slack.k8s.io/',
              },
              {
                label: 'Podman Desktop Planning & Roadmap',
                href: 'https://github.com/containers/podman-desktop/projects?type=beta',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${title}<br/>Apache License 2.0 License`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['docker', 'shell-session'],
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'MR01ANKQ9S',

        // Public API key: it is safe to commit it
        apiKey: '20bda7620dbcebd6a354840b4f92ac8e',

        // The index name to query
        indexName: 'podman-desktop',

        // Optional
        contextualSearch: true,

        // Optional
        searchPagePath: 'search',
      },
      goatcounter: {
        code: 'podman-desktop-website',
      },
      image: 'img/banner_podman-desktop.png',
    }),
};

module.exports = config;
