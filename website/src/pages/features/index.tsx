import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { useState } from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDigging,
  faChevronDown,
  faEye,
  faListCheck
} from '@fortawesome/free-solid-svg-icons';

function FeatureManageContainers() {
  return (
    <div>
      <section className="text-gray-600 bg-zinc-200 dark:bg-zinc-800 dark:text-gray-400 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Manage containers
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="mb-8 leading-relaxed dark:text-gray-200 text-gray-800">
              List, Search, Inspect, Connect, Run and Stop containers.
            </p>
          </div>
          <div className="lg:w-5/6 md:w-4/5 w-5/6 flex flex:col gap-10">
            <ThemedImage
              className="py-4"
              alt="Manage containers"
              sources={{
                light: useBaseUrl('img/features/manage-containers.png'),
                dark: useBaseUrl('img/features/manage-containers.png'),
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureManageImages() {
  return (
  <section className="text-gray-600 bg-zinc-100 dark:text-gray-400 dark:bg-zinc-900 body-font">
  <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
    <div className="w-5/6 mb-10 md:mb-0">
    <ThemedImage className="py-4" alt="Pull image and manage registries" sources={{
              light: useBaseUrl('img/features/pull-image.png'),
              dark: useBaseUrl('img/features/pull-image.png'),
            }} />
    </div>
<div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
  <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">Build, Pull and Push images</h1>

<p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Build images from the tool.</p>
<p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Pull and push images by managing registries.</p>
<p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Run containers from these images</p></div>

</div>
</section>);

}

function FeatureManagementFromTrayIcon() {
  const setEffect = useState(false);
  return (
    <div>
      <section className="text-gray-600 bg-zinc-200 dark:bg-zinc-800 dark:text-gray-400 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Management from the tray icon
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Check status and start/stop container engines.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Create new machine if needed as well as start or stop Podman machines directly from the tray icon.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Quickly check activity status and stay updated without losing focus from other tasks.
            </p>
          </div>
          <div className="lg:w-5/6 md:w-4/5 w-5/6 flex flex:col gap-10">
            <ThemedImage
              className="rounded-lg shadow-lg"
              alt="Manage Podman Machine"
              sources={{
                light: useBaseUrl('img/features/management-from-tray-icon.png'),
                dark: useBaseUrl('img/features/management-from-tray-icon.png'),
              }}
            />
          </div>
        </div>
      </section>
      <section>
        <details className="text-gray-500">
          <summary className="w-full text-center rounded-lg bg-purple-100 px-4 py-2 font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
            Click Here to Learn More
          </summary>
          <section className="text-gray-600 dark:text-gray-400 dark:bg-zinc-800 bg-zinc-200 body-font py-24">
            <div className="container px-5 mx-auto flex flex-wrap">
            <div className="flex flex-col text-center w-full mb-5">
              <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mx-auto">
                Management from the tray icon
              </h2>
            </div>
            <div className="container px-5 pb-5 mx-auto">
              <h1 className="sm:text-3xl text-2xl font-medium title-font text-center text-gray-900 dark:text-gray-100 mb-20">
                Check status and start/stop container engines.
              </h1>
              <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
                <div className="p-4 md:w-1/3 flex">
                  <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-800 mb-4 flex-shrink-0">
                    <FontAwesomeIcon size="2x" icon={faEye} className="w-6 h-6 " />
                  </div>
                  <div className="flex-grow pl-6">
                    <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Status</h2>

                    <p className="leading-relaxed text-base">See the status of engine by looking at the icon.</p>
                    <div className="inline-block">
                      - icon <img className="text-purple-400 inline-block" src="img/tray/tray-icon-empty.svg" /> means no
                      container engine have been detected.
                    </div>
                    <div className="inline-block">
                      - icon <img className="text-purple-400 inline-block" src="img/tray/tray-icon.svg" /> means container
                      engine is ready to use.
                    </div>
                  </div>
                </div>
                <div className="p-4 md:w-1/3 flex">
                  <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                    <FontAwesomeIcon size="2x" icon={faDigging} className="w-6 h-6 " />
                  </div>
                  <div className="flex-grow pl-6">
                    <h2 className="text-gray-900 dark:text-gray-100  text-lg title-font font-medium mb-2">Progress</h2>
                    <p className="leading-relaxed text-base">
                      Check progress of actions by animated tray icons. <br />
                      Stay focused without notification/pop-up to discover if something is happening on the engine side
                    </p>
                  </div>
                </div>
                <div className="p-4 md:w-1/3 flex">
                  <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-gray-400 text-purple-900 mb-4 flex-shrink-0">
                    <FontAwesomeIcon size="2x" icon={faListCheck} className="w-6 h-6 " />
                  </div>
                  <div className="flex-grow pl-6">
                    <h2 className="text-gray-900 dark:text-gray-100 text-lg title-font font-medium mb-2">Quick actions</h2>
                    <p className="leading-relaxed text-base">Start or stop Podman machines directly from the tray icon.</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </section>
        </details>
      </section>
    </div>
  );
}



function FeatureManageResources() {
  return (
    <div>
      <section className="text-gray-600 bg-zinc-100 dark:bg-zinc-900 dark:text-gray-400 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:w-5/6 md:w-4/5 w-5/6 flex flex:col gap-10">
            <ThemedImage
              className="py-4"
              alt="Manage Podman Machine"
              sources={{
                light: useBaseUrl('img/features/manage-podman-machine.png'),
                dark: useBaseUrl('img/features/manage-podman-machine.png'),
              }}
            />
          </div>
          <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Manage Podman resources
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              View allocated memory, CPU and storage.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Create new machine if needed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


function FeatureDDExtensions() {
  return (
  <section className="text-gray-600 bg-zinc-200 dark:bg-zinc-800 dark:text-gray-400 body-font">
  <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
    
<div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
  <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">Import Docker Desktop extensions</h1>

<p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Specify OCI image of a Docker Desktop extension to import it.</p>
<p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">For example: security scanner or deploy to OpenShift extensions.</p>
</div>
<div className="w-5/6 mb-10 md:mb-0">
    <ThemedImage className="py-4" alt="Pull image and manage registries" sources={{
              light: useBaseUrl('img/ddextensions/dd-support.png'),
              dark: useBaseUrl('img/ddextensions/dd-support.png'),
            }} />
    </div>

</div>
</section>);

}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Features">
      <TailWindThemeSelector />
      <FeatureManageContainers />
      <FeatureManageImages />
      <FeatureManagementFromTrayIcon/>
      <FeatureManageResources />
      <FeatureDDExtensions />
    </Layout>
  );
}
