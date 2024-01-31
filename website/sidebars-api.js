// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  typedocSidebar: [
    {
      type: 'category',
      label: 'Podman-Desktop API',
      link: {
        type: 'doc',
        id: 'index',
      },
      items: require('./api/typedoc-sidebar.cjs'),
    },
  ],
};
module.exports = sidebars;
