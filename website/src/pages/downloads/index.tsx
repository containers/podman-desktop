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
      <section id="all-downloads" className="container mx-auto flexjustify-left flex-col">
          <div className="lg:w-2/3 w-full">
            <h1 className="flex flex-col title-font sm:text-3xl text-2xl lg:text-5xl mb-10 font-medium text-gray-900 dark:text-white">
              Downloads
            </h1>
          </div>
        <div className="flex md:flex-row mb-12">
          <TailWindThemeSelector />
          <WindowsDownloads />
          <MacOSDownloads />
          <LinuxDownloads />
        </div>
      </section>
    </Layout>
  );
}
