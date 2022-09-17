import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Link from '@docusaurus/Link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons';
import { faBeer, faDownload, faPaste, faTerminal } from '@fortawesome/free-solid-svg-icons';

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<SetStateAction<{ version: string; x64: string; arm64: string }>>,
): Promise<void> {
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const armMacDmg = assets.filter(asset => (asset.name as string).endsWith('-arm64.dmg'));
  if (armMacDmg.length !== 1) {
    throw new Error('Unable to grab arm64 dmg');
  }
  const armLink = armMacDmg[0];

  const intelMacDmg = assets.filter(asset => (asset.name as string).endsWith('-x64.dmg'));
  if (intelMacDmg.length !== 1) {
    throw new Error('Unable to grab x64 dmg');
  }
  const intelLink = intelMacDmg[0];

  const universalMacDmgResults = assets.filter(
    asset => (asset.name as string).endsWith('.dmg') && asset.name !== armLink.name && asset.name !== intelLink.name,
  );
  if (universalMacDmgResults.length !== 1) {
    throw new Error('Unable to grab unified dmg');
  }
  const unifiedMacLinj = universalMacDmgResults[0];
  const data = {
    version: jsonContent.name,
    universal: unifiedMacLinj.browser_download_url,
    x64: intelLink.browser_download_url,
    arm64: armLink.browser_download_url,
  };
  setDownloadData(data);
}

export function MacOSDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    universal: '',
    x64: '',
    arm64: '',
  });

  const copyBrewInstructions = () => {
    navigator.clipboard.writeText('brew install podman-desktop');
  };

  useEffect(() => {
    grabfilenameforMac(setDownloadData);
  }, []);
  return (
    <section className=" dark:bg-zinc-900 bg-zinc-100 py-24 dark:text-gray-300 text-gray-700">
      <div className="w-5/6 mx-auto">
        <div className="flex rounded-lg bg-zinc-300 dark:bg-zinc-700 bg-opacity-60 p-8 flex-col md:flex-row  ">
          <div className="flex align-middle items-center mb-3 flex-col ">
            <FontAwesomeIcon size="8x" icon={faApple} />
            <div className="inline-flex items-center justify-center rounded-full  flex-shrink-0"></div>
            <h2 className=" text-lg title-font font-medium">macOS</h2>
          </div>
          <div className="h-full flex w-full flex-col align-middle items-center">
            <div className="flex flex-col align-middle items-center">
              <div className="items-center text-center">
                <p className="text-base ">
                  <FontAwesomeIcon size="4x" icon={faBeer} className="ml-2" />
                </p>
                <p className="text-base ">Using Brew ?</p>
                <p className="text-base dark:text-purple-300 text-purple-700">
                  <FontAwesomeIcon size="1x" icon={faTerminal} className="mr-2" />
                  brew install podman-desktop
                  <button title="Copy To Clipboard" className="mr-5">
                    {' '}
                    <FontAwesomeIcon
                      size="xs"
                      icon={faPaste}
                      className="ml-3  cursor-pointer text-3xl  text-white-500"
                      onClick={() => copyBrewInstructions()}
                    />
                  </button>
                </p>
              </div>
              <div className="pt-8 space-x-4">
                <Link
                  className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-sm"
                  to={downloadData.universal}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  universal
                </Link>
                <Link
                  className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-sm"
                  to={downloadData.x64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  Intel
                </Link>
                <Link
                  className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-600 rounded text-sm"
                  to={downloadData.arm64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  Arm
                </Link>
              </div>
              <div className="font-light mt-4">Version {downloadData.version}</div>
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
        <MacOSDownloads />
      </main>
    </Layout>
  );
}
