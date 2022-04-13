import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import BrowserOnly from '@docusaurus/BrowserOnly';

function DownloadClientLinks() {
  let operatingSystem = '';
  const userAgent = navigator.userAgent;

  if (userAgent.indexOf('Windows') != -1) {
    operatingSystem = 'Windows';
  } else if (userAgent.indexOf('Mac') != -1) {
    operatingSystem = 'macOS';
  } else if (userAgent.indexOf('Linux') != -1) {
    operatingSystem = 'Linux';
  }

  let mainButton;
  let otherButton;

  if (operatingSystem !== '') {
    mainButton = (
      <Link
        className="no-underline hover:no-underline inline-flex text-white hover:text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        to={'/downloads/' + operatingSystem}>
        Downloads for {operatingSystem}
      </Link>
    );
    otherButton = (
      <Link
        className="no-underline hover:no-underline ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg"
        to="/downloads">
        Other downloads
      </Link>
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
    <div className="flex justify-center">
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
  const { siteConfig } = useDocusaurusContext();
  return (
    <section className="text-gray-600 dark:text-gray-400 body-font">
      <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        <div className="text-center lg:w-2/3 w-full">
          <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
            {siteConfig.title}
          </h1>
          <p className="mb-3 py-3 leading-relaxed">
            This tool allows to browse, manage lifecycle of containers, inspect containers, images from different
            container engines. It includes a tray icon support. It can connect to multiple engines at the same time and
            provides an unified interface.
          </p>
          <div className="flex justify-center"></div>
        </div>
        <div className="flex justify-center">
          {/* With client mode, provides the link to the client browser */}
          <BrowserOnly fallback={<DownloadGenericLinks></DownloadGenericLinks>}>
            {() => {
              return <DownloadClientLinks />;
            }}
          </BrowserOnly>
        </div>
        <img className="w-2/3" src="https://raw.githubusercontent.com/containers/podman-desktop/media/screenshot.png" />
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Manage containers">
      <TailWindThemeSelector />
      <Hero />
    </Layout>
  );
}
