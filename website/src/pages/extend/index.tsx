import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faBook, faCertificate, faCloudArrowDown, faGears, faRocket } from '@fortawesome/free-solid-svg-icons';
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

      <section className="text-gray-900 dark:text-gray-700 body-font">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
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
              </ul>
            </div>
            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
              Extend capabilities with Podman Desktop extensions.
            </h1>
            <p>
              Podman Desktop leverages a variety of extensions to manage different container engines effectively.
              Discover and add new extensions to adapt Podman Desktop to your specific needs, whether it's managing
              containers or integrating new tools. This flexibility supports a broad range of container engines, such as
              Podman, Docker, or Lima, enhancing your development workflow.
            </p>
            <ThemedImage
              className="py-4"
              alt="Extensibility diagram"
              sources={{
                light: useBaseUrl('img/extend/extend-light.png'),
                dark: useBaseUrl('img/extend/extend-dark.png'),
              }}
            />

            <h1 className="mt-24 title-font sm:text-4xl text-3xl lg:text-6xl mb-4 font-medium text-gray-900 dark:text-white">
              Extend capabilities with Docker Desktop extensions.
            </h1>
            <p>
              Utilizing Docker Desktop UI extensions, Podman Desktop is equipped with a wrapper that intercepts API
              calls, enabling seamless integration and extension of its capabilities. Add Docker Desktop extensions to
              enhance the functionality of Podman Desktop with innovative features.
            </p>
            <ThemedImage
              className="py-4"
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
