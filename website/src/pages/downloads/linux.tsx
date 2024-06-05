import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faLinux } from '@fortawesome/free-brands-svg-icons';
import { faDownload, faPaste, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import type { SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';

async function grabfilenameforMac(
  setDownloadData: React.Dispatch<SetStateAction<{ version: string; binary: string; flatpak: string }>>,
): Promise<void> {
  const result = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
  const jsonContent = await result.json();
  const assets = jsonContent.assets;
  const linuxAssets = assets.filter((asset: { name: string }) => (asset.name as string).endsWith('.tar.gz'));
  if (linuxAssets.length !== 1) {
    throw new Error('Unable to grab .tar.gz');
  }
  const linuxAsset = linuxAssets[0];

  const flatpakAssets = assets.filter((asset: { name: string }) => (asset.name as string).endsWith('.flatpak'));
  if (flatpakAssets.length !== 1) {
    throw new Error('Unable to grab .flatpak');
  }
  const flatpakAsset = flatpakAssets[0];
  const data = {
    version: jsonContent.name,
    binary: linuxAsset.browser_download_url,
    flatpak: flatpakAsset.browser_download_url,
  };

  setDownloadData(data);
}

export function LinuxDownloads(): JSX.Element {
  const [downloadData, setDownloadData] = useState({
    version: '',
    binary: '',
    flatpak: '',
  });

  const copyFlathubInstructions = async (): Promise<void> => {
    await navigator.clipboard.writeText('flatpak install flathub io.podman_desktop.PodmanDesktop');
  };

  useEffect(() => {
    grabfilenameforMac(setDownloadData).catch((err: unknown) => {
      console.error(err);
    });
  }, []);

  return (
    <div className="basis-1/3 py-2 rounded-lg dark:text-gray-400 text-gray-900  bg-zinc-300/25 dark:bg-zinc-700/25 bg-blend-multiply text-center items-center">
      <FontAwesomeIcon size="4x" icon={faLinux} className="my-4" />
      <h2 className="w-full text-center text-4xl title-font font-medium pb-3 border-purple-500 border-b-2">Linux</h2>
      <div className="flex p-1 flex-col md:flex-col items-center align-top">
        <div className="flex flex-col align-middle items-center">
          <h3 className="mt-0">Podman Desktop for Linux</h3>
          <div className="pt-8">
            <Link
              className="mt-auto no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-500 rounded text-md font-semibold"
              to={downloadData.flatpak}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              Download Now
            </Link>
            <caption className="block w-full mt-1 text/50 dark:text-white/50">
              Linux *.flatpak, version {downloadData.version}
            </caption>
          </div>
          <div className="mt-4">
            <div>Other Linux downloads:</div>
            <Link
              className="underline inline-flex dark:text-white text-purple-500 hover:text-purple-200 py-2 px-6 font-semibold text-md"
              to={downloadData.binary}>
              <FontAwesomeIcon size="1x" icon={faDownload} className="mr-2" />
              AMD64 binary (tar.gz)
            </Link>
          </div>
          <div className="flex flex-col align-middle items-center">
            <div className="items-center text-center pt-6">
              <p className="text-lg">
                Using{' '}
                <a className="text-purple-500" href="https://flathub.org/apps/details/io.podman_desktop.PodmanDesktop">
                  Flathub
                </a>{' '}
                ? Install in one command:
              </p>
              <div className="flex flex-row pt-3 pb-7">
                <p className="text-xl p-1 mx-1">
                  <svg width="35px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M12 2.604l-.43.283L0 10.459v6.752l6.393 4.184L12 17.725l5.607 3.671L24 17.211v-6.752L12 2.604zm0 .828l5.434 3.556-2.717 1.778L12 10.545l-2.717-1.78-2.717-1.777L12 3.432zM6.39 7.104l5.434 3.556-5.408 3.54-5.434-3.557 5.409-3.54zm11.22 0l5.431 3.554-5.434 3.557-5.433-3.555 5.435-3.556zM.925 10.867l5.379 3.52a.123.08 0 00.027.013v5.647l-5.406-3.54v-5.64zm11.213.115l5.408 3.54v5.664l-5.408-3.54v-5.664z" />
                  </svg>
                </p>
                <div className="dark:bg-charcoal-800/50 bg-zinc-300/50 p-1 text-xl dark:text-purple-200 text-purple-600 flex flex-row">
                  <div className="w-72 truncate">
                    <FontAwesomeIcon size="xs" icon={faTerminal} className="mx-2 mt-3" />
                    flatpak install flathub io.podman_desktop.PodmanDesktop
                  </div>
                  <div>
                    <button title="Copy To Clipboard" className="mr-2 p-1">
                      {' '}
                      <FontAwesomeIcon
                        size="xs"
                        icon={faPaste}
                        className="ml-3  cursor-pointer text-xl  text-white-500"
                        onClick={() => {
                          copyFlathubInstructions().catch((err: unknown) => {
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
    <Layout title={siteConfig.title} description="Downloads for macOS">
      <TailWindThemeSelector />
      <section className="container mx-auto flex justify-center flex-col">
        <div className="w-full flex flex-col">
          <h1 className="title-font sm:text-3xl text-2xl lg:text-5xl mb-10 font-medium text-gray-900 dark:text-white">
            Linux Downloads
          </h1>
          <main className="h-screen">
            <LinuxDownloads />
          </main>
        </div>
      </section>
    </Layout>
  );
}
