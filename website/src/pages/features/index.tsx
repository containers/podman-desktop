import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

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
          <ThemedImage
            className="py-4"
            alt="Pull image and manage registries"
            sources={{
              light: useBaseUrl('img/features/pull-image.png'),
              dark: useBaseUrl('img/features/pull-image.png'),
            }}
          />
        </div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
            Build, Pull and Push images
          </h1>

          <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Build images from the tool.</p>
          <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
            Pull and push images by managing registries.
          </p>
          <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Run containers from these images</p>
        </div>
      </div>
    </section>
  );
}

function FeatureManagementFromTrayIcon() {
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
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">Create new machine if needed</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureManagePods() {
  return (
    <div>
      <section className="text-gray-600 bg-zinc-200 dark:bg-zinc-800 dark:text-gray-400 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Create and start Pods with Podman
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Select containers to run as a Pod.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Play Kubernetes YAML locally without Kubernetes.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
              Generate Kubernetes YAML from Pods.
            </p>
          </div>
          <div className="lg:w-5/6 md:w-4/5 w-5/6 flex flex:col gap-10">
            <ThemedImage
              className="py-4"
              alt="Manage Pods"
              sources={{
                light: useBaseUrl('img/features/manage-pods.png'),
                dark: useBaseUrl('img/features/manage-pods.png'),
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureDDExtensions() {
  return (
    <section className="text-gray-600 bg-zinc-100 dark:bg-zinc-900 dark:text-gray-400 body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:w-5/6 md:w-4/5 w-5/6 flex flex:col gap-10">
          <ThemedImage
            className="py-4"
            alt="Pull image and manage registries"
            sources={{
              light: useBaseUrl('img/ddextensions/dd-support.png'),
              dark: useBaseUrl('img/ddextensions/dd-support.png'),
            }}
          />
        </div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
            Import Docker Desktop extensions
          </h1>
          <br className="hidden lg:inline-block" />
          <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
            Specify OCI image of a Docker Desktop extension to import it.
          </p>
          <p className="leading-relaxed list-item dark:text-gray-200 text-gray-800">
            For example: security scanner or deploy to OpenShift extensions.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Features">
      <TailWindThemeSelector />
      <FeatureManageContainers />
      <FeatureManageImages />
      <FeatureManagementFromTrayIcon />
      <FeatureManageResources />
      <FeatureManagePods />
      <FeatureDDExtensions />
    </Layout>
  );
}
