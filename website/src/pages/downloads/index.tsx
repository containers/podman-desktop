import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import { MacOSDownloads } from '@site/src/pages/downloads/macOS';
import { WindowsDownloads } from '@site/src/pages/downloads/windows';
import { LinuxDownloads } from '@site/src/pages/downloads/linux';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Downloads">
      <TailWindThemeSelector />
      <WindowsDownloads />
      <MacOSDownloads />
      <LinuxDownloads />
    </Layout>
  );
}
