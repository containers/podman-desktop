// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const title = 'podman desktop';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Podman Desktop',
  url: 'https://podman-desktop.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'containers',
  projectName: 'podman-desktop',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
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
        // disable for now the blog posts
        blog: false,
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
        respectPrefersColorScheme: false,
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
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          { to: '/core-values', label: 'Core Values', position: 'left' },
          { to: '/features', label: 'Features', position: 'left' },
          { to: '/downloads', label: 'Downloads', position: 'left' },
          { to: '/extend', label: 'Extend', position: 'left' },
          /*{to: '/blog', label: 'Blog', position: 'left'},*/
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
                label: 'Troubleshooting',
                to: '/docs/troubleshooting',
              },
            ],
          },
          {
            title: 'Links',
            items: [
              /*{
                label: 'Blog',
                to: '/blog',
              },*/
              {
                label: 'GitHub',
                href: 'https://github.com/containers/podman-desktop',
              },
              {
                label: 'Chat with us',
                href: 'https://discordapp.com/invite/TCTB38RWpf',
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
    }),
};

module.exports = config;
