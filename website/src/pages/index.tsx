import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import TailWindThemeSelector from '../components/TailWindThemeSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import {
  faBeer,
  faCertificate,
  faCloudArrowDown,
  faCogs,
  faGaugeHigh,
  faPlug,
  faRocket,
  faGears,
  faRotateRight,
  faPaste,
  faDiagramProject,
} from '@fortawesome/free-solid-svg-icons';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Admonition from '@theme/Admonition';

function EAP() {
  return (
    <div className="max-w-6xl mx-auto">
      <Admonition type="info" title="We are participating in Hacktoberfest 2022!">
        <p>
          Do you love container tools and frontend technologies like Electron, Svelte and Tailwind CSS? Then come join
          Podman Desktop for Hacktoberfest 2022. You can start off with some issues by clicking{' '}
          <Link to="https://bit.ly/3rrTCEP">
            <u>here</u>
          </Link>
          , but feel free to explore the{' '}
          <Link to="https://github.com/containers/podman-desktop">
            <u>repository</u>
          </Link>
          .
        </p>
      </Admonition>
    </div>
  );
}

function DownloadClientLinks() {
  let operatingSystem = '';
  let varIcon = null;
  const userAgent = navigator.userAgent;

  if (userAgent.indexOf('Windows') != -1) {
    operatingSystem = 'Windows';
    varIcon = 'faWindows';
  } else if (userAgent.indexOf('Mac') != -1) {
    operatingSystem = 'macOS';
    varIcon = 'faApple';
  } else if (userAgent.indexOf('Linux') != -1) {
    operatingSystem = 'Linux';
    varIcon = 'faLinux';
  }

  let mainButton;
  let otherButton;

  if (operatingSystem !== '') {
    mainButton = (
      <div>
        <Link
          className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-violet-600 border-0 py-4 px-8 mt-6 mb-1 focus:outline-none hover:bg-violet-700 rounded text-lg"
          to={'/downloads/' + operatingSystem}>
          <FontAwesomeIcon size="2x" icon={varIcon as IconProp} className="px-2" /> Download Now
        </Link>
        <caption className="block mt-0 dark:text-gray-300">
          For <strong>{operatingSystem}</strong> <em>(browser-detected)</em>
        </caption>
      </div>
    );
    otherButton = (
      <div>
        <Link
          className="underline font-semibold hover:underline ml-4 inline-flex py-2 px-6 my-4  focus:outline-none text-lg"
          to="/downloads">
          Other downloads
        </Link>
      </div>
    );
  } else {
    mainButton = (
      <Link
        className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        to="/downloads">
        Download Page
      </Link>
    );
  }

  return (
    <div className="flex justify-center flex-col">
      {mainButton}
      {otherButton}
    </div>
  );
}

function DownloadGenericLinks() {
  return (
    <div className="flex justify-center">
      <Link
        className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        to="/downloads">
        Download Page
      </Link>
    </div>
  );
}

function Hero() {
  // const { siteConfig } = useDocusaurusContext();
  return (
    <section className="text-gray-600 dark:text-gray-300 body-font">
      <div className="container mx-auto flex px-5 pb-24 pt-4 items-center justify-center flex-col">
        <div className="text-center lg:w-2/3 w-full bg-hero-pattern bg-no-repeat bg-center">
          <div className="bg-white/30 dark:bg-transparent">
            <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-8 font-medium text-gray-900 dark:text-white">
              Containers and Kubernetes for application developers
            </h1>
            <p className="text-base md:text-lg">
              Podman Desktop enables you to easily work with containers from your local environment. Podman Desktop
              leverages{' '}
              <a href="https://podman.io/" className="text-purple-700 dark:text-purple-400" target="_blank">
                Podman Engine
              </a>{' '}
              to provide a lightweight and daemon-less container tool.
            </p>
            <div className="flex-none">
              {/* With client mode, provides the link to the client browser */}
              <BrowserOnly fallback={<DownloadGenericLinks></DownloadGenericLinks>}>
                {() => {
                  return <DownloadClientLinks />;
                }}
              </BrowserOnly>
            </div>
          </div>
        </div>
        <div className="text-center w-full text-center">
          <img
            className="py-4 md:w-5/6 lg:w-11/12 w-full"
            alt="Podman Desktop home page"
            src="img/features/homepage.png"
          />
        </div>
      </div>
    </section>
  );
}

function SectionTitle(props) {
  return (
    <div>
      <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-purple-900 uppercase rounded-full dark:bg-purple-400 bg-purple-400">
        {props.name}
      </p>
    </div>
  );
}

function WorkInProgress() {
  return <div className="text-sm font-extralight text-purple-900 dark:text-purple-300">Work in progress</div>;
}

function KeepUpToDate() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-900 bg-zinc-100 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <SectionTitle name="update" />

          <h2 className="max-w-lg mb-6 font-sans text-3xl font-light leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Install and keep up to date <span className="font-bold">Podman</span>
            <WorkInProgress />
          </h2>
        </div>

        <div className="flex flex-col w-full text-center">
          <div className="mx-10">
            <FontAwesomeIcon size="3x" icon={faRotateRight} className="ml-2 mb-4 text-gray-800 dark:text-gray-200" />
          </div>
          <div className="flex flex-col items-center">
            <p className="leading-relaxed text-base">
              Install Podman and other dependencies directly from Podman Desktop if not yet installed.
            </p>
            <p className="leading-relaxed text-base">Check for updates and get notified about new changes.</p>
            <p className="leading-relaxed text-base">
              Available on{' '}
              <a href="/downloads/windows" className="text-purple-700 dark:text-purple-400" target="_blank">
                Windows
              </a>
              !
            </p>
            <p className="leading-relaxed text-base">Coming soon on MacOS.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Extensibility() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-800 bg-zinc-200 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <SectionTitle name="extensibility" />

          <h2 className="max-w-lg mb-6 font-sans text-3xl font-light leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Bring new features with Podman Desktop plug-ins or Docker Desktop Extensions.
          </h2>
        </div>

        <div className="flex flex-col w-full text-center">
          <div className="mx-10">
            <FontAwesomeIcon size="3x" icon={faPlug} className="ml-2 mb-4 text-gray-800 dark:text-gray-200" />
          </div>

          <ul className="list-disc list-inside text-center">
            <li>Container engines are plugged through extension points</li>
            <li>JavaScript extensions can contribute new behaviour</li>
            <li>Reuse existing extensions directly in Podman Desktop</li>
          </ul>

          <div className="flex flex-col items-center">
            <div className="text-left my-4">
              <p className="-ml-5 text-base">
                Current Podman Desktop plug-ins: Podman, Docker, Lima and CRC/OpenShift Local.
              </p>
            </div>
          </div>

          <ThemedImage
            className="py-4 md:w-5/6 lg:w-11/12 w-full"
            alt="Reuse Docker Desktop extensions"
            sources={{
              light: useBaseUrl('img/ddextensions/dd-support.png'),
              dark: useBaseUrl('img/ddextensions/dd-support.png'),
            }}
          />

          <div className="flex flex-col items-center">
            <Link
              title="Extend Podman Desktop"
              className="no-underline hover:no-underline text-gray-900 dark:text-white hover:dark:text-violet-600 "
              to="/extend">
              <div className="mt-3 text-purple-900 dark:text-purple-400 inline-flex items-center">
                Learn More
                <svg
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  className="w-4 h-4 ml-2"
                  viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Configure() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-900 bg-zinc-100 body-font py-24">
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <SectionTitle name="Configure" />

          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Multiple configuration options
          </h2>
        </div>

        <div className="container px-5 pb-5 mx-auto">
          <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCogs} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Registries</h2>
                <p className="leading-relaxed text-base">Manage OCI registries. Add/edit/delete registries.</p>
              </div>
            </div>

            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCogs} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Proxy</h2>
                <p className="leading-relaxed text-base">Configure your proxy settings (in progress..).</p>
              </div>
            </div>

            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCogs} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">
                  Resources Utilization
                </h2>
                <p className="leading-relaxed text-base">
                  Configure CPU/Memory/Disk of Podman machines (work in progress)
                </p>
              </div>
            </div>

            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCogs} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">
                  Container Engines
                </h2>
                <p className="leading-relaxed text-base">
                  Handle multiple container engines at the same time (Podman, Docker, Lima...).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnterpriseReady() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-800 bg-zinc-200 body-font py-24">
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <SectionTitle name="enterprise" />

          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Enterprise ready
            <WorkInProgress />
          </h2>
        </div>
        <div className="container px-5 pb-5 mx-auto">
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 dark:text-gray-100 mb-20">
            Match configuration options.
          </h1>
          <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
            <div className="p-4 md:w-1/3 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCertificate} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Code signing</h2>

                <p className="leading-relaxed text-base">
                  macOS binaries are digitally signed (Windows certification is in)
                </p>
              </div>
            </div>
            <div className="p-4 md:w-1/3 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCloudArrowDown} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100  text-lg title-font font-medium mb-2">Proxy</h2>
                <p className="leading-relaxed text-base">
                  Configure proxy within the tool. Avoid any painful files to edit.
                </p>
              </div>
            </div>
            <div className="p-4 md:w-1/3 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faCogs} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Registries</h2>
                <p className="leading-relaxed text-base">Manage OCI registries. Add/edit/delete registries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const copyBrewInstructions = () => {
  navigator.clipboard.writeText('brew install podman-desktop');
};

function RunAnywhere() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-900 bg-zinc-100 body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Available on Windows, Mac and Linux
          </h2>
          <p className="text-base text-gray-700 md:text-lg dark:text-gray-300">
            Use the same UI across different operating systems
          </p>
        </div>
        <div className="flex flex-wrap w-full">
          <div className="p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <div className="flex rounded-lg h-full bg-zinc-300 dark:bg-zinc-700 bg-opacity-60 p-8 flex-col">
              <Link
                title="Download for Windows"
                className="no-underline hover:no-underline text-gray-900 dark:text-white hover:dark:text-violet-600 "
                to="/downloads/Windows">
                <div className="flex items-center mb-3 flex-col">
                  <FontAwesomeIcon size="4x" icon={faWindows} />
                  <div className="inline-flex items-center justify-center rounded-full text-gray-900 dark:text-gray-300 flex-shrink-0"></div>
                  <h2 className=" text-lg title-font font-medium"> Windows</h2>
                </div>
              </Link>
              <div className="flex-grow">
                <div className="flex-grow w-full">
                  <p className="text-base text-center">exe or setup.exe</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <div className="flex rounded-lg h-full bg-zinc-300 dark:bg-zinc-700 bg-opacity-60 p-8 flex-col">
              <Link
                title="Download for macOS"
                className="no-underline hover:no-underline text-gray-900 dark:text-white hover:dark:text-violet-600 "
                to="/downloads/macOS">
                <div className="flex items-center mb-3 flex-col">
                  <FontAwesomeIcon size="4x" icon={faApple} />
                  <div className="inline-flex items-center justify-center rounded-full text-gray-900 dark:text-gray-300 flex-shrink-0"></div>
                  <h2 className=" text-lg title-font font-medium"> macOS</h2>
                </div>
              </Link>
              <div className="flex-grow w-full">
                <p className="text-base text-center">arm64, x64 or unified dmg</p>
                <p className="text-base text-center">
                  <FontAwesomeIcon size="1x" icon={faBeer} className="ml-2" /> brew install podman-desktop
                  <button title="Copy To Clipboard" className="mr-5">
                    <FontAwesomeIcon
                      size="1x"
                      icon={faPaste}
                      className="ml-3  cursor-pointer text-3xl  text-white-500"
                      onClick={() => copyBrewInstructions()}
                    />
                  </button>
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 w-11/12 md:w-1/2 lg:w-1/3">
            <div className="flex rounded-lg h-full bg-zinc-300 dark:bg-zinc-700 bg-opacity-60 p-8 flex-col">
              <Link
                title="Download for Linux"
                className="no-underline hover:no-underline text-gray-900 dark:text-white hover:dark:text-violet-600 "
                to="/downloads/Linux">
                <div className="flex items-center mb-3 flex-col">
                  <FontAwesomeIcon size="4x" icon={faLinux} />
                  <div className="inline-flex items-center justify-center rounded-full text-gray-900 dark:text-gray-300 flex-shrink-0"></div>
                  <h2 className=" text-lg title-font font-medium"> Linux</h2>
                </div>
              </Link>

              <div className="flex-grow">
                <p className="text-base text-center">flatpak or zip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MainFeatures() {
  return (
    <section className="text-gray-600 dark:text-gray-300 dark:bg-zinc-800 bg-zinc-200 body-font py-24">
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <SectionTitle name="features" />

          <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
            Build, run and manage containers.
          </h2>
        </div>
        <div className="container px-5 pb-5 mx-auto">
          <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faGears} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Build</h2>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faGaugeHigh} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Build images from Containerfile or Dockerfile
                </p>
              </div>
            </div>
            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faRocket} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Run</h2>

                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faDiagramProject} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Pull images from remote registries
                </p>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faGaugeHigh} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Start / Stop / Restart containers
                </p>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Start / Stop / Restart pods
                </p>
              </div>
            </div>
            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faGaugeHigh} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Inspect</h2>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Get a terminal in your container
                </p>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Inspect logs
                </p>
              </div>
            </div>
            <div className="p-4 md:w-1/4 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                <FontAwesomeIcon size="2x" icon={faDiagramProject} className="w-6 h-6 " />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Push</h2>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Push images to OCI registries
                </p>
                <p className="leading-relaxed text-base list-disc">
                  <FontAwesomeIcon icon={faRocket} className="text-purple-800 w-3 h-3 mt-1 mr-2" />
                  Deploy & Test images on Kubernetes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-center w-full mb-5">
          <Link
            title="Discover More"
            className="no-underline hover:no-underline text-gray-900 dark:text-white hover:dark:text-violet-600 "
            to="/features">
            <div className="mt-3 text-purple-900 dark:text-purple-400 inline-flex items-center">
              Discover More
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Leverage Podman with a Desktop App"
      description="Containers and Kubernetes for application developers">
      <TailWindThemeSelector />
      <EAP />
      <Hero />
      <RunAnywhere />
      <MainFeatures />
      <Configure />
      <Extensibility />
      <KeepUpToDate />
      <EnterpriseReady />
    </Layout>
  );
}
