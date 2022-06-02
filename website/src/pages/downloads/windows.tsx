import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Link from '@docusaurus/Link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindows } from '@fortawesome/free-brands-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
let grabbed = false;

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<SetStateAction<{ version: string; binary: string; setup: string }>>,
): Promise<void> {
  if (grabbed) {
    return;
  }
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
  grabbed = true;
}

export function WindowsDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    binary: '',
    setup: '',
  });

  useEffect(() => {
    grabfilenameforMac(setDownloadData);
  });

  return (
    <section className=" dark:bg-zinc-800 bg-zinc-200 py-24 dark:text-gray-300 text-gray-700">
    <div className="w-5/6 mx-auto">
      <div className="flex rounded-lg bg-zinc-300 dark:bg-zinc-700 bg-opacity-60 p-8 flex-col md:flex-row  ">
        <div className="flex align-middle items-center mb-3 flex-col ">
          <FontAwesomeIcon size="8x" icon={faWindows} />
          <div className="inline-flex items-center justify-center rounded-full  flex-shrink-0"></div>
          <h2 className=" text-lg title-font font-medium">Windows</h2>
        </div>
        <div className="h-full flex w-full flex-col align-middle items-center">
          <div className="flex flex-col align-middle items-center">
            <div className='pt-8 space-x-4'>

            <Link
              className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-sm"
              to={downloadData.binary}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Exe
            </Link>
            
            </div>
            <div className='font-light mt-4'>Version {downloadData.version}</div>
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
      <main className="h-screen">
        <WindowsDownloads />
      </main>
    </Layout>
  );
}
