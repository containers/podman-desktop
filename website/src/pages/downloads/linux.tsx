import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Link from '@docusaurus/Link';

let grabbed = false;

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<SetStateAction<{ version: string; binary: string }>>,
): Promise<void> {
  if (grabbed) {
    return;
  }
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const linuxAssets = assets.filter(asset => (asset.name as string).endsWith('.tar.gz'));
  if (linuxAssets.length !== 1) {
    throw new Error('Unable to grab .tar.gz');
  }
  const linuxAsset = linuxAssets[0];
  const data = {
    version: jsonContent.name,
    binary: linuxAsset.browser_download_url,
  };
  setDownloadData(data);
  grabbed = true;
}

export function LinuxDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    binary: '',
    setup: '',
  });

  useEffect(() => {
    grabfilenameforMac(setDownloadData);
  });

  return (
    <section className="text-gray-400 bg-gray-900 min-h-full">
      <div className="container px-5 py-24 mx-auto center">
        <h1 className="text-3xl font-medium title-font text-white mb-12 text-center">
          {downloadData.version}: Downloads for Linux
        </h1>
        <div className="w-2/3 flex mx-auto justify-center center">
          <div className="p-4 ">
            <div className="h-full bg-gray-800 bg-opacity-40 p-8 rounded">
              <div className="w-full flex flex-col justify-center center">
                <p className="mb-6 text-5xl">Tgz archive of binary</p>
                <Link
                  className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                  to={downloadData.binary}>
                  <svg
                    className="w-5 h-5 mr-2 mt-1"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                    <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                  </svg>
                  Download .tgz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Downloads for macOS">
      <TailWindThemeSelector />
      <main className="h-screen"></main>
      <LinuxDownloads />
    </Layout>
  );
}
