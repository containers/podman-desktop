import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Link from '@docusaurus/Link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<SetStateAction<{ version: string; binary: string; setup: string }>>,
): Promise<void> {
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const windowsSetupAssets = assets.filter(asset => (asset.name as string).endsWith('-setup.exe'));
  if (windowsSetupAssets.length !== 1) {
    throw new Error('Unable to grab setup.exe');
  }
  const windowsSetupAsset = windowsSetupAssets[0];

  const binaryOnlyWindowsAssets = assets.filter(
    asset => (asset.name as string).endsWith('.exe') && asset.name !== windowsSetupAsset.name,
  );
  const binaryAsset = binaryOnlyWindowsAssets[0];
  const data = {
    version: jsonContent.name,
    binary: binaryAsset.browser_download_url,
    setup: windowsSetupAsset.browser_download_url,
  };
  setDownloadData(data);
}

export function WindowsDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    binary: '',
    setup: '',
  });

  useEffect(() => {
    grabfilenameforMac(setDownloadData);
  }, []);

  return (
    <div className="basis-1/3 py-2 rounded-lg dark:text-gray-300 text-gray-700  bg-zinc-300/25 dark:bg-zinc-700/25 bg-blend-multiply text-center items-center">
      <FontAwesomeIcon size="4x" icon={faWindows} className="my-4" />
      <h2 className="w-full text-center text-4xl title-font font-medium pb-3 border-purple-600 border-b-2">Windows</h2>
      <div className="flex p-1 flex-col md:flex-col items-center align-top">
        <div className="flex flex-col align-middle items-center">
          <h3 className="mt-0">Podman Desktop for Windows</h3>
          <div className="pt-8 space-x-4">
            <Link
              className="mt-auto no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-md font-semibold"
              to={downloadData.binary}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Download Now
            </Link>
          </div>
          <div className="font-light mt-4">Version {downloadData.version}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Downloads for macOS">
      <TailWindThemeSelector />
      <section className="container mx-auto flex justify-center flex-col">
        <div className="w-full flex flex-col">
          <h1 className="title-font sm:text-3xl text-2xl lg:text-5xl mb-10 font-medium text-gray-900 dark:text-white">
            Windows Downloads
          </h1>
          <main className="h-screen">
            <WindowsDownloads />
          </main>
        </div>
      </section>
    </Layout>
  );
}
