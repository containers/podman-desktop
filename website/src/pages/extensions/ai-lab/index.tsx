import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight,
  faFileLines,
  faMagnifyingGlassChart,
  faMessage,
  faMicrophone,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getGradient, GradientText } from '@site/src/components/GradientText';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import React from 'react';

interface Recipe {
  id: string;
  name: string;
  content: string;
  icon: IconDefinition;
  colorFrom: string;
  colorTo: string;
  iconColor: string;
}

const RECIPES: Recipe[] = [
  {
    id: 'chatbot',
    name: 'LLM Chatbot',
    content: 'Experiment prompting locally',
    icon: faMessage,
    colorFrom: '#9bfacc',
    colorTo: '#fff',
    iconColor: '#36f8a7',
  },
  {
    id: 'summarizer',
    name: 'Text Summarizer',
    content: 'Get insight on large text corpus',
    icon: faFileLines,
    colorFrom: '#9cf4fd',
    colorTo: '#fff',
    iconColor: '#2fecfc',
  },
  {
    id: 'speech-to-text',
    name: 'Speech to text',
    content: 'Get transcript from any audio file',
    icon: faMicrophone,
    colorFrom: '#f4acce',
    colorTo: '#fff',
    iconColor: '#e54b95',
  },
  {
    id: 'obj-detection',
    name: 'Object Detection',
    content: 'Get started with computer vision',
    icon: faMagnifyingGlassChart,
    colorFrom: '#fbe696',
    colorTo: '#fff',
    iconColor: '#fccf44',
  },
];

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
                to={'/docs/ai-lab/installing'}>
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
            <div className="my-12 rounded-xl from-purple-500 bg-gradient-to-r to-fuschia-500">
              <div className="p-8">
                <video className="rounded-xl w-full h-full" controls>
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
          </div>
          {/* Recipes sections */}
          <div className="space-y-3 mb-5 lg:w-2/3 w-full items-center justify-center flex flex-col">
            <h2 className="sm:text-2xl text-3xl lg:text-4xl font-bold text-charcoal-500 dark:text-white text-center">
              Experiment with free{' '}
              <GradientText gradientAngle={90} colorFrom="#7D2D79" colorTo="#6d48bf" content="Open Source" /> recipes
            </h2>
            <div className="w-full grid grid-cols-2 gap-2 lg:grid-cols-4">
              {RECIPES.map(recipe => (
                <div
                  className="px-8 py-4 rounded-xl from-purple-500 from-70% bg-gradient-to-t to-white flex flex-col items-center text-black text-center"
                  style={{
                    background: getGradient(recipe.colorFrom, recipe.colorTo),
                    border: `1px solid ${recipe.colorFrom}`,
                  }}
                  key={recipe.id}>
                  <FontAwesomeIcon className="mb-2" color={recipe.iconColor} size="lg" icon={recipe.icon} />
                  <div className="text-xl font-black text-black">{recipe.name}</div>
                  <div className="text-xs font-semibold text-charcoal-100 mb-2">{recipe.content}</div>
                </div>
              ))}
            </div>
            <h2 className="sm:text-1xl text-2xl lg:text-3xl mb-4 font-bold text-charcoal-500 dark:text-white text-center w-full">
              All built to run <span className="text-bold">locally</span> on your laptop
            </h2>
          </div>
          {/* Videos sections */}
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
