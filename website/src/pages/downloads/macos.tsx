import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faApple } from '@fortawesome/free-brands-svg-icons';
import { faBeer, faDownload, faPaste, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<
    SetStateAction<{
      version: string;
      universal: string;
      x64: string;
      arm64: string;
      airgapsetupX64: string;
      airgapsetupArm64: string;
    }>
  >,
): Promise<void> {
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const armMacDmg = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-arm64.dmg') && !asset.name.includes('airgap'),
  );
  if (armMacDmg.length !== 1) {
    throw new Error('Unable to grab arm64 dmg');
  }
  const armLink = armMacDmg[0];

  const intelMacDmg = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-x64.dmg') && !asset.name.includes('airgap'),
  );
  if (intelMacDmg.length !== 1) {
    throw new Error('Unable to grab x64 dmg');
  }
  const intelLink = intelMacDmg[0];

  /* Find macOS universal Disk Image for restricted environments */
  const universalMacAirgapDmgAssets = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('universal.dmg') && asset.name.includes('airgap'),
  );
  // temporary fix to restore regular Mac downloads even if airgap is not available
  let universalMacAirgapDmgAsset;
  if (universalMacAirgapDmgAssets.length !== 1) {
    console.log('Error: Unable to find Apple Disk Image for restricted environments');
  } else {
    universalMacAirgapDmgAsset = universalMacAirgapDmgAssets[0];
  }

  const universalMacDmgResults = assets.filter(
    (asset: { name: string }) =>
      (asset.name as string).endsWith('.dmg') &&
      !asset.name.includes('airgap') &&
      asset.name !== armLink.name &&
      asset.name !== intelLink.name,
  );
  if (universalMacDmgResults.length !== 1) {
    throw new Error('Unable to grab unified dmg');
  }
  const unifiedMacLink = universalMacDmgResults[0];

  /* Find macOS installer for restricted environment */
  const macosX64AirgapSetupAssets = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-x64.dmg') && asset.name.includes('airgap'),
  );

  const airgapsetupX64 = macosX64AirgapSetupAssets?.[0]?.browser_download_url;

  const macosArm64AirgapSetupAssets = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-arm64.dmg') && asset.name.includes('airgap'),
  );

  const airgapsetupArm64 = macosArm64AirgapSetupAssets?.[0]?.browser_download_url;

  const data = {
    version: jsonContent.name,
    universal: unifiedMacLink.browser_download_url,
    x64: intelLink.browser_download_url,
    arm64: armLink.browser_download_url,
    airgapsetup: universalMacAirgapDmgAsset?.browser_download_url,
    airgapsetupX64,
    airgapsetupArm64,
  };
  setDownloadData(data);
}

export function MacOSDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    universal: '',
    x64: '',
    arm64: '',
    airgapsetupX64: '',
    airgapsetupArm64: '',
  });

  const copyBrewInstructions = async (): Promise<void> => {
    await navigator.clipboard.writeText('brew install podman-desktop');
  };

  useEffect(() => {
    grabfilenameforMac(setDownloadData).catch((err: unknown) => {
      console.error(err);
    });
  }, []);
  return (
    <div className="basis-1/3 py-2 rounded-lg dark:text-gray-400 text-gray-900  bg-zinc-300/25 dark:bg-zinc-700/25 bg-blend-multiply text-center items-center">
      <FontAwesomeIcon size="4x" icon={faApple} className="my-4" />
      <h2 className="w-full text-center text-4xl title-font font-medium pb-3 border-purple-500 border-b-2">macOS</h2>
      <div className="flex p-1 flex-col md:flex-col items-center align-top">
        <div className="flex flex-col align-middle items-center">
          <h3 className="mt-0">Podman Desktop for macOS</h3>
          <div className="pt-8">
            <Link
              className="mt-auto no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-500 rounded text-md font-semibold"
              to={downloadData.universal}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Download Now
            </Link>
            <caption className="block w-full mt-1 text/50 dark:text-white/50">
              Universal *.dmg, version {downloadData.version}
            </caption>
          </div>
          <div className="mt-4">
            <div>Other macOS downloads:</div>
            <Link
              className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
              to={downloadData.x64}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Intel
            </Link>
            <Link
              className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 text-md font-semibold"
              to={downloadData.arm64}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Apple silicon
            </Link>
          </div>
          <div className="pt-2 pb-4 flex flex-col">
            <div className="">Installer for restricted environments:</div>
            <div className="flex flex-row justify-center">
              <Link
                className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
                to={downloadData.airgapsetupX64}>
                <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                Intel
              </Link>
              <Link
                className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
                to={downloadData.airgapsetupArm64}>
                <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                Apple silicon
              </Link>
            </div>
          </div>

          <div className="flex flex-col align-middle items-center">
            <div className="items-center text-center pt-6">
              <p className="text-lg">
                Using <strong>Brew</strong>? Install in one command:
              </p>
              <div className="flex flex-row pt-3">
                <p className="text-xl p-1">
                  <FontAwesomeIcon size="sm" icon={faBeer} className="mx-1 mt-2" />
                </p>
                <div className="dark:bg-charcoal-800/50 bg-zinc-300/50 p-1 truncate">
                  <p className="text-xl dark:text-purple-200 text-purple-600">
                    <FontAwesomeIcon size="xs" icon={faTerminal} className="mx-2 mt-3" />
                    brew install podman-desktop
                    <button title="Copy To Clipboard" className="mr-2 p-1">
                      {' '}
                      <FontAwesomeIcon
                        size="xs"
                        icon={faPaste}
                        className="ml-3  cursor-pointer text-xl  text-white-500"
                        onClick={() => {
                          copyBrewInstructions().catch((err: unknown) => {
                            console.error('unable to copy instructions', err);
                          });
                        }}
                      />
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            macOS Downloads
          </h1>
          <main className="h-screen">
            <MacOSDownloads />
          </main>
        </div>
      </section>
    </Layout>
  );
}
