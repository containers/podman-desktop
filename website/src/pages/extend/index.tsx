import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import React from 'react';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Extensibility">
      <TailWindThemeSelector />

      <section className="text-gray-900 dark:text-gray-700 body-font">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
              Extend capabilities with Docker Desktop extensions.
            </h1>
            <p>
              Podman Desktop is able to use Docker Desktop UI plug-ins by adding a wrapper to intercept the API calls.
            </p>
            <p>By adding a Docker Desktop extension, you can extend the capabilities of Podman Desktop.</p>

            <ThemedImage
              className="py-4"
              alt="Extend with Docker Desktop extensions"
              sources={{
                light: useBaseUrl('img/extend/extend-dd-light.png'),
                dark: useBaseUrl('img/extend/extend-dd-dark.png'),
              }}
            />

            <ThemedImage
              className="py-4"
              alt="Reuse Docker Desktop extensions"
              sources={{
                light: useBaseUrl('img/ddextensions/dd-support.png'),
                dark: useBaseUrl('img/ddextensions/dd-support.png'),
              }}
            />

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
              Extend capabilities with Podman Desktop plug-ins.
            </h1>
            <p>Podman Desktop is using plug-ins under the hood to manage the different container engine.</p>
            <p>By adding a new plugin, you can extend the capabilities of Podman Desktop.</p>
            <p>For example plug a new container engine like Podman, Docker, or use Lima.</p>

            <ThemedImage
              className="py-4"
              alt="Extensibility diagram"
              sources={{
                light: useBaseUrl('img/extend/extend-light.png'),
                dark: useBaseUrl('img/extend/extend-dark.png'),
              }}
            />

            <h3 className="pt-2 pb-24 font-semibold">
              <div>Extensions are written in JavaScript/Typescript</div>
              <div>It consumes a TypeScript definition of the extension model.</div>
            </h3>

            <h1 className="title-font sm:text-2xl text-2xl lg:text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              More extension points
            </h1>
            <p>Several extension points exists in addition to adding a Provider connection.</p>
            <p>User interaction, dialogs, launching commands are among the possible ways to extend Podman Desktop</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
