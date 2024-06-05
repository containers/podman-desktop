import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faMicrosoft, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faDownload, faPaste, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';

async function grabfilenameforWindows(
  setDownloadData: React.Dispatch<
    SetStateAction<{
      version: string;
      binaryX64: string;
      binaryArm64: string;
      setupX64: string;
      setupArm64: string;
      airgapsetupX64: string;
      airgapsetupArm64: string;
    }>
  >,
): Promise<void> {
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const windowsX64SetupAssets = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-setup-x64.exe') && !asset.name.includes('airgap'),
  );
  if (windowsX64SetupAssets.length !== 1) {
    throw new Error('Unable to grab setup.exe');
  }
  const windowsArm64SetupAssets = assets.filter(
    (asset: { name: string }) => (asset.name as string).endsWith('-setup-arm64.exe') && !asset.name.includes('airgap'),
  );
  const setupX64Asset = windowsX64SetupAssets?.[0];
  const setupX64 = setupX64Asset?.browser_download_url;
  const setupArm64Asset = windowsArm64SetupAssets?.[0];
  const setupArm64 = setupArm64Asset?.browser_download_url;

  const binaryOnlyX64WindowsAssets = assets.filter(
    (asset: { name: string }) =>
      (asset.name as string).endsWith('x64.exe') &&
      !asset.name.includes('airgap') &&
      asset.name !== setupX64Asset?.name,
  );
  const binaryX64 = binaryOnlyX64WindowsAssets?.[0]?.browser_download_url;

  const binaryOnlyArm64WindowsAssets = assets.filter(
    (asset: { name: string }) =>
      (asset.name as string).endsWith('arm64.exe') &&
      !asset.name.includes('airgap') &&
      asset.name !== setupArm64Asset?.name,
  );
  const binaryArm64 = binaryOnlyArm64WindowsAssets?.[0]?.browser_download_url;

  /* Find Windows installer for restricted environment */
  const windowsX64AirgapSetupAssets = assets.filter(
    (asset: { name: string }) =>
      (asset.name as string).endsWith('-setup-x64.exe') &&
      asset.name.includes('airgap') &&
      asset.name !== setupX64Asset?.name,
  );

  const airgapsetupX64 = windowsX64AirgapSetupAssets?.[0]?.browser_download_url;

  const windowsArm64AirgapSetupAssets = assets.filter(
    (asset: { name: string }) =>
      (asset.name as string).endsWith('-setup-arm64.exe') &&
      asset.name.includes('airgap') &&
      asset.name !== setupArm64Asset?.name,
  );

  const airgapsetupArm64 = windowsArm64AirgapSetupAssets?.[0]?.browser_download_url;

  const data = {
    version: jsonContent.name,
    binaryX64,
    setupX64,
    airgapsetupX64,
    binaryArm64,
    setupArm64,
    airgapsetupArm64,
  };
  setDownloadData(data);
}

export function WindowsDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    binaryX64: '',
    setupX64: '',
    airgapsetupX64: '',
    binaryArm64: '',
    setupArm64: '',
    airgapsetupArm64: '',
  });

  const copyCliInstructions = async (): Promise<void> => {
    await navigator.clipboard.writeText('winget install -e --id RedHat.Podman-Desktop');
  };

  useEffect(() => {
    grabfilenameforWindows(setDownloadData).catch((err: unknown) => {
      console.error(err);
    });
  }, []);

  return (
    <div className="basis-1/3 py-2 rounded-lg dark:text-gray-400 text-gray-900  bg-zinc-300/25 dark:bg-zinc-700/25 bg-blend-multiply text-center items-center">
      <FontAwesomeIcon size="4x" icon={faWindows} className="my-4" />
      <h2 className="w-full text-center text-4xl title-font font-medium pb-3 border-purple-500 border-b-2">Windows</h2>
      <div className="flex p-1 flex-col md:flex-col items-center align-top">
        <div className="flex flex-col align-middle items-center">
          <h3 className="mt-0">Podman Desktop for Windows</h3>
          <div className="pt-8">
            <Link
              className="mt-auto no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-500 rounded text-md font-semibold"
              to={downloadData.setupX64}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Download Now
            </Link>
            <caption className="block w-full mt-1 text/50 dark:text-white/50">
              Windows installer x64, version {downloadData.version}
            </caption>
          </div>
          <div className="mt-4">
            <div>Other Windows downloads:</div>

            <div className="pt-4 pb-4 flex flex-col">
              <div className="">Installer:</div>
              <div className="flex flex-row justify-center">
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-3 font-semibold text-md"
                  to={downloadData.setupX64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  x64
                </Link>
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-3 font-semibold text-md"
                  to={downloadData.setupArm64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  arm64
                </Link>
              </div>
            </div>

            <div className="pt-2 pb-4 flex flex-col">
              <div className="">Portable binary:</div>
              <div className="flex flex-row justify-center">
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-2 font-semibold text-md"
                  to={downloadData.binaryX64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  x64
                </Link>
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-2 font-semibold text-md"
                  to={downloadData.binaryArm64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  arm64
                </Link>
              </div>
            </div>

            <div className="pt-2 pb-4 flex flex-col">
              <div className="">Installer for restricted environments:</div>
              <div className="flex flex-row justify-center">
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
                  to={downloadData.airgapsetupX64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  x64
                </Link>
                <Link
                  className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
                  to={downloadData.airgapsetupArm64}>
                  <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
                  arm64
                </Link>
              </div>
            </div>

            <Link
              className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
              to="/docs/installation/windows-install">
              <FontAwesomeIcon size="1x" icon={faWindows} className="mr-2" />
              Package Managers Guide
            </Link>
          </div>
          <div className="flex flex-col align-middle items-center">
            <div className="items-center text-center pt-6">
              <p className="text-lg">
                Using <strong>winget</strong>? Install in one command:
              </p>
              <div className="flex flex-row pt-3">
                <p className="text-xl p-1">
                  <FontAwesomeIcon size="sm" icon={faMicrosoft} className="mx-1 mt-2" />
                </p>
                <div className="dark:bg-charcoal-800/50 bg-zinc-300/50 p-1 text-xl dark:text-purple-200 text-purple-600 flex flex-row">
                  <div className="w-72 truncate">
                    <FontAwesomeIcon size="xs" icon={faTerminal} className="mx-2 mt-3" />
                    winget install -e --id RedHat.Podman-Desktop
                  </div>
                  <div>
                    <button title="Copy To Clipboard" className="mr-2 p-1">
                      {' '}
                      <FontAwesomeIcon
                        size="xs"
                        icon={faPaste}
                        className="ml-3  cursor-pointer text-xl  text-white-500"
                        onClick={() => {
                          copyCliInstructions().catch((err: unknown) => {
                            console.error('unable to copy instructions', err);
                          });
                        }}
                      />
                    </button>
                  </div>
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
    <Layout title={siteConfig.title} description="Downloads for Windows">
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
