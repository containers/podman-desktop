import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';

function ExtensionListFromIframe(): JSX.Element {
  return (
    <iframe
      title="Extensions Catalog"
      src="https://registry.podman-desktop.io/"
      className="w-full min-h-[2000px] h-full"
    />
  );
}

export default function Extensions(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Extensions" wrapperClassName="h-full">
      <TailWindThemeSelector />
      <ExtensionListFromIframe />
    </Layout>
  );
}
