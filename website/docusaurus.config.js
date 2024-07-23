// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import { resolve } from 'node:path';
import Storybook from './storybook';

const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

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
            to: '/downloads/windows',
            from: '/downloads/Windows',
          },
          {
            to: '/downloads/macos',
            from: '/downloads/macOS',
          },
          {
            to: '/downloads/linux',
            from: '/downloads/Linux',
          },
          {
            to: '/docs/intro',
            from: '/docs',
          },
          {
            to: '/docs/installation',
            from: '/docs/Installation',
          },
          {
            to: '/docs/installation/windows-install',
            from: [
              '/docs/installation/windows-install/installing-podman-desktop-silently-with-the-windows-installer',
              '/docs/installation/windows-install/installing-podman-desktop-with-chocolatey',
              '/docs/installation/windows-install/installing-podman-desktop-with-scoop',
              '/docs/installation/windows-install/installing-podman-desktop-with-winget',
              '/docs/installation/windows-install/installing-podman-with-openshift-local',
              '/docs/installation/windows-install/installing-podman-with-podman-desktop',
              '/docs/onboarding-for-containers/installing-podman-with-openshift-local-on-windows',
              '/docs/onboarding-for-containers/installing-podman',
              '/docs/onboarding/containers/installing-podman-with-openshift-local-on-windows',
              '/docs/onboarding/containers/installing-podman-with-podman-desktop-on-windows',
              '/docs/onboarding/containers/installing-podman',
              '/docs/podman/installing-podman-with-openshift-local-on-windows',
              '/docs/podman/installing',
            ],
          },
          {
            to: '/docs/proxy',
            from: [
              '/docs/installation/windows-install/installing-podman-desktop-and-podman-in-a-restricted-environment',
              '/docs/installation/linux-install/installing-podman-desktop-from-a-compressed-tar-file',
              '/docs/proxy/using-a-proxy-in-your-containers',
              '/docs/proxy/using-a-proxy-on-linux',
              '/docs/proxy/using-a-proxy-requiring-a-custom-ca',
              '/docs/proxy/using-a-proxy',
              '/docs/proxy/using-a-vpn-on-windows',
            ],
          },
          {
            to: '/docs/compose',
            from: ['/docs/podman-compose', '/docs/compose/compose-spec', '/docs/compose/podman-compose'],
          },
          {
            to: '/docs/kubernetes',
            from: '/docs/onboarding-for-kubernetes',
          },
          {
            to: '/docs/containers/onboarding',
            from: ['/docs/onboarding-for-containers', '/docs/onboarding', '/docs/onboarding/containers'],
          },
          {
            to: '/docs/lima/creating-a-lima-instance',
            from: [
              '/docs/onboarding-for-containers/creating-a-lima-instance-with-podman-desktop',
              '/docs/Installation/creating-a-lima-instance-with-podman-desktop',
              '/docs/onboarding/containers/creating-a-lima-instance-with-podman-desktop',
            ],
          },
          {
            to: '/docs/podman/creating-a-podman-machine',
            from: [
              '/docs/onboarding-for-containers/creating-a-podman-machine-with-podman-desktop',
              '/docs/Installation/creating-a-podman-machine-with-podman-desktop',
              '/docs/onboarding/containers/creating-a-podman-machine-with-podman-desktop',
            ],
          },
          {
            to: '/docs/openshift/developer-sandbox',
            from: [
              '/docs/onboarding-for-kubernetes/developer-sandbox',
              '/docs/kubernetes/openshift/configuring-access-to-a-developer-sandbox',
              '/docs/onboarding/kubernetes/developer-sandbox',
            ],
          },
          {
            to: '/docs/kubernetes/existing-kubernetes',
            from: [
              '/docs/onboarding-for-kubernetes/existing-kubernetes',
              '/docs/kubernetes/configuring-access-to-a-kubernetes-cluster',
              '/docs/onboarding/kubernetes/existing-kubernetes',
            ],
          },
          {
            to: '/docs/kind/installing',
            from: [
              '/docs/onboarding-for-kubernetes/kind/installing-kind',
              '/docs/kubernetes/kind/installing-kind',
              '/docs/onboarding/kubernetes/kind/installing-kind',
            ],
          },
          {
            to: '/docs/kind/configuring-podman-for-kind-on-windows',
            from: [
              '/docs/onboarding-for-kubernetes/kind/configuring-podman-for-kind-on-windows',
              '/docs/kubernetes/kind/configuring-podman-for-kind-on-windows',
              '/docs/onboarding/kubernetes/kind/configuring-podman-for-kind-on-windows',
            ],
          },
          {
            to: '/docs/kind/creating-a-kind-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/kind/creating-a-kind-cluster',
              '/docs/kubernetes/kind/creating-a-kind-cluster',
              '/docs/onboarding/kubernetes/kind/creating-a-kind-cluster',
            ],
          },
          {
            to: '/docs/kind/restarting-your-kind-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/kind/restarting-your-kind-cluster',
              '/docs/kubernetes/kind/restarting-your-kind-cluster',
              '/docs/onboarding/kubernetes/kind/restarting-your-kind-cluster',
            ],
          },
          {
            to: '/docs/kind/deleting-your-kind-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/kind/deleting-your-kind-cluster',
              '/docs/kubernetes/kind/deleting-your-kind-cluster',
              '/docs/onboarding/kubernetes/kind/deleting-your-kind-cluster',
            ],
          },
          {
            to: '/docs/lima',
            from: [
              '/docs/onboarding-for-kubernetes/lima',
              '/docs/onboarding/kubernetes/creating-a-lima-instance-with-podman-desktop',
              '/docs/onboarding/kubernetes/lima',
            ],
          },
          {
            to: '/docs/minikube/installing',
            from: [
              '/docs/onboarding-for-kubernetes/minikube/installing-minikube',
              '/docs/kubernetes/minikube/installing-minikube',
              '/docs/onboarding/kubernetes/minikube/installing-minikube',
            ],
          },
          {
            to: '/docs/minikube/configuring-podman-for-minikube-on-windows',
            from: [
              '/docs/onboarding-for-kubernetes/minikube/configuring-podman-for-minikube-on-windows',
              '/docs/kubernetes/minikube/configuring-podman-for-minikube-on-windows',
              '/docs/onboarding/kubernetes/minikube/configuring-podman-for-minikube-on-windows',
            ],
          },
          {
            to: '/docs/minikube/creating-a-minikube-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/minikube/creating-a-minikube-cluster',
              '/docs/kubernetes/minikube/creating-a-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/creating-a-minikube-cluster',
            ],
          },
          {
            to: '/docs/minikube/restarting-your-minikube-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/minikube/restarting-your-minikube-cluster',
              '/docs/kubernetes/minikube/restarting-your-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/restarting-your-minikube-cluster',
            ],
          },
          {
            to: '/docs/minikube/deleting-your-minikube-cluster',
            from: [
              '/docs/onboarding-for-kubernetes/minikube/deleting-your-minikube-cluster',
              '/docs/kubernetes/minikube/deleting-your-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/deleting-your-minikube-cluster',
            ],
          },
          {
            to: '/docs/openshift/openshift-local',
            from: [
              '/docs/onboarding-for-kubernetes/openshift-local',
              '/docs/kubernetes/openshift/creating-an-openshift-local-cluster',
              '/docs/onboarding/kubernetes/openshift-local',
            ],
          },
          {
            to: '/docs/containers',
            from: ['/docs/working-with-containers', '/docs/getting-started/getting-started', '/docs/getting-started'],
          },
          {
            to: '/docs/containers/registries',
            from: [
              '/docs/containers/registries/authenticating-to-a-preconfigured-registry',
              '/docs/containers/registries/insecure-registry',
              '/docs/getting-started/authenticating-to-a-preconfigured-registry',
              '/docs/getting-started/insecure-registry',
              '/docs/working-with-containers/registries/authenticating-to-a-preconfigured-registry',
              '/docs/working-with-containers/registries/insecure-registry',
            ],
          },
          {
            to: '/docs/containers/images/building-an-image',
            from: ['/docs/working-with-containers/images/building-an-image', '/docs/getting-started/building-an-image'],
          },
          {
            to: '/docs/containers/images/pushing-an-image-to-a-registry',
            from: [
              '/docs/working-with-containers/images/pushing-an-image-to-a-registry',
              '/docs/getting-started/pushing-an-image-to-a-registry',
            ],
          },
          {
            to: '/docs/containers/images/pulling-an-image',
            from: ['/docs/working-with-containers/images/pulling-an-image', '/docs/getting-started/pulling-an-image'],
          },
          {
            to: '/docs/containers/starting-a-container',
            from: ['/docs/working-with-containers/starting-a-container', '/docs/getting-started/starting-a-container'],
          },
          {
            to: '/docs/containers/creating-a-pod',
            from: ['/docs/working-with-containers/creating-a-pod', '/docs/getting-started/creating-a-pod'],
          },
          {
            to: '/docs/podman/setting-podman-machine-default-connection',
            from: [
              '/docs/working-with-containers/switching-podman-machine-default-connection',
              '/docs/getting-started/switching-podman-machine-default-connection',
            ],
          },
          {
            to: '/docs/openshift',
            from: '/docs/kubernetes/openshift',
          },
          {
            to: '/docs/extensions/developing',
            from: [
              '/docs/extensions/write/',
              '/docs/extensions/write/onboarding-workflow',
              '/docs/extensions/write/when-clause-context',
              '/docs/extensions/write/adding-icons',
            ],
          },
        ],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: resolve('./sidebars-api.js'),
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        id: 'api',
        plugin: ['typedoc-plugin-markdown'],
        entryPoints: [resolve('../packages/extension-api/src/extension-api.d.ts')],
        out: 'api',
        hideBreadcrumbs: true,
        readme: 'none',
        tsconfig: resolve('../packages/extension-api/tsconfig.json'),
        hideGenerator: true,
      },
    ],
    // Custom Storybook integration
    /* [
      Storybook,
      ({
        id: 'storybook-docusaurus-integration',
        output: 'src/pages/storybook',
        storybookStatic: '../storybook/storybook-static',
      }),
    ], */
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarCollapsed: false,
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/containers/podman-desktop/tree/main/website',
        },
        blog: {
          blogTitle: 'Podman Desktop blog!',
          blogDescription: 'Discover articles about Podman Desktop',
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All blog posts',
          blogSidebarCount: 'ALL',
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
                label: 'Installing Podman Desktop',
                to: '/docs/installation',
              },
              {
                label: 'Migrating from Docker',
                to: '/docs/migrating-from-docker',
              },
              {
                label: 'Working with Kubernetes',
                to: '/docs/kubernetes',
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
                label: 'GitHub',
                href: 'https://github.com/containers/podman-desktop',
              },
              {
                label: 'Chat (bridged): #podman-desktop on Discord',
                href: 'https://discord.com/invite/x5GzFF6QH4',
              },
              {
                label: 'Other ways to Communicate',
                href: 'https://github.com/containers/podman-desktop#communication',
              },
              {
                label: 'Current Sprint',
                href: 'https://github.com/orgs/containers/projects/4/views/8',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${title} - Apache License 2.0 License`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['docker', 'shell-session', 'bash', 'json'],
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
