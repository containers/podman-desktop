import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faSimplybuilt } from '@fortawesome/free-brands-svg-icons';
import { faBoltLightning, faBoxOpen, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import React from 'react';

function CoreValueHead(): JSX.Element {
  return (
    <div>
      <section className="text-gray-900 dark:text-gray-700 dark:bg-charcoal-600 bg-zinc-200 body-font">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
              Podman Desktop: Core Values
            </h1>
            <p>Podman Desktop is designed and built with the following core values in mind.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FastAndLight(): JSX.Element {
  return (
    <div>
      <section className="text-gray-900 dark:text-gray-700 dark:bg-charcoal-800 bg-zinc-100 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Fast and Light
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
              Daemon-less and using the fastest technologies to make Podman Desktop fast to use.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
              Reactive and light on resources utilized from your environment.
            </p>
          </div>
          <div className="lg:w-1/3 md:w-1/2 w-1/3 flex justify-center gap-10 text-purple-700">
            <FontAwesomeIcon icon={faBoltLightning} size="8x" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Open(): JSX.Element {
  return (
    <section className="text-gray-900 dark:text-gray-700 dark:bg-charcoal-600 bg-zinc-200 body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:w-1/3 md:w-1/2 w-1/3 flex justify-center gap-10 text-purple-700">
          <FontAwesomeIcon icon={faBoxOpen} size="8x" />
        </div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">Open</h1>
          <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
            While focusing on Podman as a container engine packaged by default, Podman Desktop also enables other
            container engines.
          </p>
          <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
            This gives the end-user a single tool to manage all their containers independently from the engine used.
          </p>
        </div>
      </div>
    </section>
  );
}

function Simple(): JSX.Element {
  return (
    <div>
      <section className="text-gray-900 dark:text-gray-700 dark:bg-charcoal-800 bg-zinc-100 body-font">
        <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
          <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
              Simple
              <br className="hidden lg:inline-block" />
            </h1>
            <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
              Managing a container engine locally can be hard.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
              Running Kubernetes in a local environment requires knowledge.
            </p>
            <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
              Podman Desktop takes care of this complexity and enables developers to focus on their code.
            </p>
          </div>
          <div className="lg:w-1/3 md:w-1/2 w-1/3 flex justify-center gap-10 text-purple-700">
            <FontAwesomeIcon icon={faSimplybuilt} size="8x" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ExtensibleWorkflow(): JSX.Element {
  return (
    <section className="text-gray-900 dark:text-gray-700 dark:bg-charcoal-600 bg-zinc-200 body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <div className="lg:w-1/3 md:w-1/2 w-1/3 flex justify-center gap-10 text-purple-700">
          <FontAwesomeIcon icon={faChartLine} size="8x" />
        </div>
        <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900 dark:text-white">
            Extensible Workflow
          </h1>
          <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
            Podman Desktop provides extensions points to enable the community to build more features.
          </p>
          <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
            This allows more in-deep integrations with other tools and technologies to extend workflows and capabilities
            of the tool.
          </p>
          <p className="leading-relaxed list-item dark:text-gray-300 text-gray-900">
            Thus giving the developer a single tool to manage all their containers independently from the engine used.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Core Values">
      <TailWindThemeSelector />
      <CoreValueHead />
      <FastAndLight />
      <Open />
      <Simple />
      <ExtensibleWorkflow />
    </Layout>
  );
}
