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
            to: '/docs/installing-podman-desktop',
            from: [
              '/docs/installation',
              '/docs/Installation',
              '/docs/installation/linux-install',
              '/docs/Installation/linux-install',
              '/docs/installation/linux-install/installing-podman-desktop-from-a-compressed-tar-file',
              '/docs/Installation/linux-install/installing-podman-desktop-from-a-compressed-tar-file',
              '/docs/installation/linux-install/installing-podman-desktop-from-a-flatpak-bundle',
              '/docs/Installation/linux-install/installing-podman-desktop-from-a-flatpak-bundle',
              '/docs/installation/macos-install',
              '/docs/Installation/macos-install',
              '/docs/installation/windows-install',
              '/docs/Installation/windows-install',
              '/docs/installation/windows-install/installing-podman-desktop-silently-with-the-windows-installer',
              '/docs/Installation/windows-install/installing-podman-desktop-silently-with-the-windows-installer',
              '/docs/installation/windows-install/installing-podman-desktop-with-chocolatey',
              '/docs/Installation/windows-install/installing-podman-desktop-with-chocolatey',
              '/docs/installation/windows-install/installing-podman-desktop-with-scoop',
              '/docs/Installation/windows-install/installing-podman-desktop-with-scoop',
              '/docs/installation/windows-install/installing-podman-desktop-with-winget',
              '/docs/Installation/windows-install/installing-podman-desktop-with-winget',
            ],
          },
          {
            to: '/docs/proxy',
            from: [
              '/docs/installation/windows-install/installing-podman-desktop-and-podman-in-a-restricted-environment',
              '/docs/Installation/windows-install/installing-podman-desktop-and-podman-in-a-restricted-environment',
            ],
          },
          {
            to: '/docs/compose',
            from: ['/docs/podman-compose', '/docs/compose/compose-spec', '/docs/compose/podman-compose'],
          },
          {
            to: '/docs/onboarding-for-containers',
            from: ['/docs/onboarding', '/docs/onboarding/containers'],
          },
          {
            to: '/docs/onboarding-for-containers/installing-podman',
            from: [
              '/docs/onboarding/containers/installing-podman',
              '/docs/Installation/windows-install/installing-podman-with-podman-desktop',
              '/docs/onboarding/containers/installing-podman-with-podman-desktop-on-windows',
            ],
          },
          {
            to: '/docs/onboarding-for-containers/installing-podman-with-openshift-local-on-windows',
            from: [
              '/docs/Installation/windows-install/installing-podman-with-openshift-local',
              '/docs/onboarding/containers/installing-podman-with-openshift-local-on-windows',
            ],
          },
          {
            to: '/docs/onboarding-for-containers/creating-a-lima-instance-with-podman-desktop',
            from: [
              '/docs/Installation/creating-a-lima-instance-with-podman-desktop',
              '/docs/onboarding/containers/creating-a-lima-instance-with-podman-desktop',
            ],
          },
          {
            to: '/docs/onboarding-for-containers/creating-a-podman-machine-with-podman-desktop',
            from: [
              '/docs/Installation/creating-a-podman-machine-with-podman-desktop',
              '/docs/onboarding/containers/creating-a-podman-machine-with-podman-desktop',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/developer-sandbox',
            from: [
              '/docs/kubernetes/openshift/configuring-access-to-a-developer-sandbox',
              '/docs/onboarding/kubernetes/developer-sandbox',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/existing-kubernetes',
            from: [
              '/docs/kubernetes/configuring-access-to-a-kubernetes-cluster',
              '/docs/onboarding/kubernetes/existing-kubernetes',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/kind/installing-kind',
            from: ['/docs/kubernetes/kind/installing-kind', '/docs/onboarding/kubernetes/kind/installing-kind'],
          },
          {
            to: '/docs/onboarding-for-kubernetes/kind/configuring-podman-for-kind-on-windows',
            from: [
              '/docs/kubernetes/kind/configuring-podman-for-kind-on-windows',
              '/docs/onboarding/kubernetes/kind/configuring-podman-for-kind-on-windows',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/kind/creating-a-kind-cluster',
            from: [
              '/docs/kubernetes/kind/creating-a-kind-cluster',
              '/docs/onboarding/kubernetes/kind/creating-a-kind-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/kind/restarting-your-kind-cluster',
            from: [
              '/docs/kubernetes/kind/restarting-your-kind-cluster',
              '/docs/onboarding/kubernetes/kind/restarting-your-kind-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/kind/deleting-your-kind-cluster',
            from: [
              '/docs/kubernetes/kind/deleting-your-kind-cluster',
              '/docs/onboarding/kubernetes/kind/deleting-your-kind-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/lima',
            from: [
              '/docs/onboarding/kubernetes/creating-a-lima-instance-with-podman-desktop',
              '/docs/onboarding/kubernetes/lima',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/minikube/installing-minikube',
            from: [
              '/docs/kubernetes/minikube/installing-minikube',
              '/docs/onboarding/kubernetes/minikube/installing-minikube',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/minikube/configuring-podman-for-minikube-on-windows',
            from: [
              '/docs/kubernetes/minikube/configuring-podman-for-minikube-on-windows',
              '/docs/onboarding/kubernetes/minikube/configuring-podman-for-minikube-on-windows',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/minikube/creating-a-minikube-cluster',
            from: [
              '/docs/kubernetes/minikube/creating-a-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/creating-a-minikube-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/minikube/restarting-your-minikube-cluster',
            from: [
              '/docs/kubernetes/minikube/restarting-your-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/restarting-your-minikube-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/minikube/deleting-your-minikube-cluster',
            from: [
              '/docs/kubernetes/minikube/deleting-your-minikube-cluster',
              '/docs/onboarding/kubernetes/minikube/deleting-your-minikube-cluster',
            ],
          },
          {
            to: '/docs/onboarding-for-kubernetes/openshift-local',
            from: [
              '/docs/kubernetes/openshift/creating-an-openshift-local-cluster',
              '/docs/onboarding/kubernetes/openshift-local',
            ],
          },
          {
            to: '/docs/working-with-containers',
            from: ['/docs/getting-started/getting-started', '/docs/getting-started'],
          },
          {
            to: '/docs/working-with-containers/registries/authenticating-to-a-preconfigured-registry',
            from: '/docs/getting-started/authenticating-to-a-preconfigured-registry',
          },
          {
            to: '/docs/working-with-containers/registries/insecure-registry',
            from: '/docs/getting-started/insecure-registry',
          },
          {
            to: '/docs/working-with-containers/images/building-an-image',
            from: '/docs/getting-started/building-an-image',
          },
          {
            to: '/docs/working-with-containers/images/pushing-an-image-to-a-registry',
            from: '/docs/getting-started/pushing-an-image-to-a-registry',
          },
          {
            to: '/docs/working-with-containers/images/pulling-an-image',
            from: '/docs/getting-started/pulling-an-image',
          },
          {
            to: '/docs/working-with-containers/starting-a-container',
            from: '/docs/getting-started/starting-a-container',
          },
          {
            to: '/docs/working-with-containers/creating-a-pod',
            from: '/docs/getting-started/creating-a-pod',
          },
          {
            to: '/docs/working-with-containers/switching-podman-machine-default-connection',
            from: '/docs/getting-started/switching-podman-machine-default-connection',
          },
          {
            to: '/docs/kubernetes',
            from: '/docs/kubernetes/openshift',
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
                label: 'Installing Podman Desktop',
                to: '/docs/installation',
              },
              {
                label: 'Onboarding for containers',
                to: '/docs/onboarding/containers',
              },
              {
                label: 'Onboarding for Kubernetes',
                to: '/docs/onboarding-for-kubernetes',
              },
              {
                label: 'Working with containers',
                to: '/docs/working-with-containers',
              },
              {
                label: 'Migrating from Docker',
                to: '/docs/migrating-from-docker',
              },
              {
                label: 'Working with Compose',
                to: '/docs/compose',
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
