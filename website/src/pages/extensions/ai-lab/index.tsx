import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faArrowRight, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GradientText } from '@site/src/components/GradientText';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import React from 'react';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description="Extensibility">
      <TailWindThemeSelector />

      <section className="text-gray-900 dark:text-gray-700 body-font">
        <div className="container mx-auto flex px-5 py-6 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            {/* header section */}
            <h1 className="sm:text-4xl text-3xl lg:text-6xl mb-4 font-bold text-charcoal-500 dark:text-white">
              Run{' '}
              <GradientText gradientAngle={90} colorFrom="#7D2D79" colorTo="#6d48bf" content="Large Language Models" />{' '}
              locally with Podman AI Lab
            </h1>
            <p>
              Podman AI Lab is the easiest way to work with Large Language Models (LLMs) on your local developer
              workstation. Find a catalog of recipes, leverage a curated list of open source models, experiment and
              compare the models. Get ahead of the curve and take your development to new heights wth Podman AI Lab!
            </p>
            {/* buttons section */}
            <div className="mt-4 flex justify-center items-center gap-x-4">
              <Link
                className="items-center mt-auto no-underline hover:no-underline inline-flex text-white hover:text-white bg-purple-500 border-0 py-2 px-6 focus:outline-none hover:bg-purple-500 rounded-xl text-md font-semibold"
                to={'#'}>
                <FontAwesomeIcon size="1x" icon={faRocket} className="mr-2" />
                Get started
              </Link>

              <Link
                className="items-center mt-auto no-underline hover:no-underline inline-flex text-charcoal-500 dark:text-white border-0 py-2 px-6 focus:outline-none text-md font-semibold"
                to={'https://github.com/containers/podman-desktop-extension-ai-lab'}>
                Learn more on GitHub
                <FontAwesomeIcon size="1x" icon={faArrowRight} className="ml-2" />
              </Link>
            </div>

            {/* Application video */}
            <div className="my-12 rounded-xl border-black border-8">
              <video controls>
                <source
                  src="https://github.com/containers/podman-desktop-media/raw/ai-lab/videos/homepage/ai-lab-hero.mp4"
                  type="video/mp4"
                />
                <img
                  src={useBaseUrl('img/extensions/ai-lab/model-service-details.png')}
                  alt={'AI-Lab Model service page'}
                />
              </video>
            </div>
          </div>
          <div className="lg:w-2/3 w-full">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <video controls>
                    <source
                      src="https://github.com/containers/podman-desktop-media/raw/ai-lab/videos/homepage/ai-1.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div>
                  <div className="font-bold">Recipes Catalog</div>
                  <div className="text-sm">
                    Collection of pre-built solutions for various AI use cases and problem domains. Each recipe includes
                    detailed explanations and sample applications that can be run using different large language models
                    (LLMs). Get inspired by use cases and learn how to integrate AI in an optimal way. Recipes are
                    kubernetes ready.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <div className="font-bold">Models Catalog</div>
                  <div className="text-sm">
                    Curated list of open source large language models available out of the box. Check license and
                    required resources. Import your own models.
                  </div>
                </div>
                <div>
                  <video controls>
                    <source
                      src="https://github.com/containers/podman-desktop-media/raw/ai-lab/videos/homepage/ai-2.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <video controls>
                    <source
                      src="https://github.com/containers/podman-desktop-media/raw/ai-lab/videos/homepage/ai-3.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div>
                  <div className="font-bold">Model Serving</div>
                  <div className="text-sm">
                    Run models locally with an inference server. Get OpenAI compatible endpoints, use code snippets and
                    start integrating AI in your application.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <div className="font-bold">Playground Environments</div>
                  <div className="text-sm">
                    Experiment with large language models with a dedicated UI. Configure the models settings, system
                    prompts to test and validate your prompt workflows. Compare behavior of different models.
                  </div>
                </div>
                <div>
                  <video controls>
                    <source
                      src="https://github.com/containers/podman-desktop-media/raw/ai-lab/videos/homepage/ai-4.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
