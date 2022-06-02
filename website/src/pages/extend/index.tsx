import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Extensibility">
      <TailWindThemeSelector />

      <section className="text-gray-600 dark:text-gray-400 body-font">
      <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        <div className="text-center lg:w-2/3 w-full">
          <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
            Extend capabilities with plug-ins.
          </h1>
          <p>Podman Desktop is using plug-ins under the hood to manage the different container engine.</p>
          <p>By adding a new plugin, you can extend the capabilities of Podman Desktop.</p>
          <p>For example plug a new container Engine likes Podman, Docker, Lima, etc.</p>

          <ThemedImage className="py-4" alt="Extensibility diagram" sources={{
              light: useBaseUrl('img/extend/extend-light.png'),
              dark: useBaseUrl('img/extend/extend-dark.png'),
            }} />
          
          <h3 className='pt-2 pb-24 font-semibold'><div>Extensions are written in JavaScript/Typescript</div><div>It consumes a TypeScript definition of the extension model.</div></h3>

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
