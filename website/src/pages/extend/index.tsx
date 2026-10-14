import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  faBook,
  faCertificate,
  faCloudArrowDown,
  faGears,
  faPalette,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import React from 'react';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Extensibility">
      <TailWindThemeSelector />

      <section className="text-charcoal-300 dark:text-gray-700 body-font">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-charcoal-300 dark:text-white">
              Extensibility Documentation and Resources
            </h1>
            <p>Explore our comprehensive guides on extending Podman Desktop:</p>
            <div className="text-center">
              <ul className="list-none pl-0 mt-2">
                <li>
                  <FontAwesomeIcon icon={faBook} className="mr-2" />
                  <a href={useBaseUrl('/extensions')}>View our Extensions Catalog</a>
                </li>
                <li>
                  <FontAwesomeIcon icon={faRocket} className="mr-2" />
                  <a href={useBaseUrl('/docs/extensions/developing')}>Developing an Extension</a>
                </li>
                <li>
                  <FontAwesomeIcon icon={faCloudArrowDown} className="mr-2" />
                  <a href={useBaseUrl('/docs/extensions/install')}>Installing an Extension</a>
                </li>
                <li>
                  <FontAwesomeIcon icon={faCertificate} className="mr-2" />
                  <a href={useBaseUrl('/docs/extensions/publish')}>Publishing an Extension</a>
                </li>
                <li>
                  <FontAwesomeIcon icon={faGears} className="mr-2" />
                  <a href={useBaseUrl('/api')}>API Reference</a>
                </li>
                <li>
                  <FontAwesomeIcon icon={faPalette} className="mr-2" />
                  <a href={useBaseUrl('/storybook')}>Storybook</a>
                </li>
              </ul>
            </div>

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-charcoal-300 dark:text-white">
              What are Extensions?
            </h1>
            <p>
              Extensions in Podman Desktop allow users to enhance and customize their container management experience.
              They enable new functionalities such as:
            </p>
            <ul className="list-disc list-inside text-center mx-auto max-w-3xl">
              <li>Adding support for different container engines like Docker, Lima, or Kubernetes.</li>
              <li>Providing command-line integrations with tools like Helm or Kubectl.</li>
              <li>Introducing UI elements such as custom actions, badges, views, and workflows.</li>
              <li>Automating tasks and integrating with external services.</li>
            </ul>

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-charcoal-300 dark:text-white">
              Getting Started with Extensions
            </h1>
            <p>
              You can easily extend the capabilities of Podman Desktop by installing or developing extensions. Here’s
              how:
            </p>
            <h2 className="text-2xl font-semibold mt-6">1. Install Extensions</h2>
            <p>
              Browse the{' '}
              <a href={useBaseUrl('/extensions')} className="text-blue-500">
                Extensions Catalog
              </a>{' '}
              to find and install pre-built extensions.
            </p>

            <h2 className="text-2xl font-semibold mt-6">2. Develop Your Own Extension</h2>
            <p>
              Want to create something new? Check out our guide on{' '}
              <a href={useBaseUrl('/docs/extensions/developing')} className="text-blue-500">
                Developing an Extension
              </a>{' '}
              to learn how to build and contribute your own.
            </p>

            <h2 className="text-2xl font-semibold mt-6">3. Publish Your Extension</h2>
            <p>
              Share your extension with the community by publishing it to the catalog. Learn more about the process{' '}
              <a href={useBaseUrl('/docs/extensions/publish')} className="text-blue-500">
                here
              </a>
              .
            </p>

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-charcoal-300 dark:text-white">
              Visualizing Extension Capabilities
            </h1>
            <ThemedImage
              className="mx-auto py-4"
              alt="Extensibility diagram"
              sources={{
                light: useBaseUrl('img/extend/extend-light.png'),
                dark: useBaseUrl('img/extend/extend-dark.png'),
              }}
            />

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-charcoal-300 dark:text-white">
              Extend Podman Desktop with Docker Desktop Extensions
            </h1>
            <p>
              Podman Desktop can also leverage Docker Desktop UI extensions through a built-in wrapper that intercepts
              API calls, making integration seamless. Use Docker Desktop extensions to further enhance Podman Desktop’s
              capabilities.
            </p>
            <ThemedImage
              className="mx-auto py-4"
              alt="Extend with Docker Desktop extensions"
              sources={{
                light: useBaseUrl('img/extend/extend-dd-light.png'),
                dark: useBaseUrl('img/extend/extend-dd-dark.png'),
              }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
