import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import React from 'react';

import { CNCFCommunityBanner } from '../components/CNCFCommunityBanner';
import { DownloadClientLinks, DownloadGenericLinks } from '../components/DownloadButton';
import { ExpandableFAQ } from '../components/ExpandableFAQ';
import { ReadTheDocsButton } from '../components/ReadTheDocsButton';
import TailWindThemeSelector from '../components/TailWindThemeSelector';
import { TestimonialCard } from '../components/TestimonialCard';
import { VendorCards } from '../components/Vendors';

function Hero(): JSX.Element {
  return (
    <section className="text-charcoal-300 dark:text-gray-400 body-font">
      <div className="container mx-auto flex px-5 pb-24 pt-4 items-center justify-center flex-col">
        <div className="text-center lg:w-3/4 w-full bg-hero-pattern bg-no-repeat bg-center">
          <div className="bg-white/30 dark:bg-transparent">
            <h1 className="title-font text-4xl leading-[3rem] lg:text-5xl lg:leading-[4rem] font-extrabold text-charcoal-300 dark:text-white mt-[80px] lg:w-3/4 mx-auto">
              Best Free &amp; Open Source Tool for Containers &amp; Kubernetes
            </h1>
            <p className="text-base font-bold leading-[1.9rem] md:text-lg md:leading-[1.9rem] mt-[88px]">
              The best free and open source tool for developers to work with containers and Kubernetes. Simplify
              container management, streamline Kubernetes workflows, and transition from local development to production
              with ease.
            </p>
            <div className="flex-none">
              {/* With client mode, provides the link to the client browser */}
              <BrowserOnly fallback={<DownloadGenericLinks></DownloadGenericLinks>}>
                {() => {
                  return <DownloadClientLinks />;
                }}
              </BrowserOnly>
            </div>
          </div>
        </div>
        <div className="sm:pl-8 md:pl-12 lg:pl-36 text-center w-full">
          <img
            className="sm:w-full md:w-full lg:w-10/12"
            alt="Podman Desktop home page"
            src="img/features/homepage.webp"
          />
        </div>
        <CNCFCommunityBanner />
      </div>
    </section>
  );
}

function SectionLabel(props: Readonly<{ name: string }>): JSX.Element {
  return (
    <div className="text-right p-[2px] rounded-full border-gradient bg-gradient-to-r from-sky-500 to-purple-500 w-fit mb-5">
      <p className="inline-block bg-white dark:bg-charcoal-400 text-charcoal-300 dark:text-white px-3 py-1 rounded-full transition-colors duration-200 mb-0 text-sm">
        {props.name}
      </p>
    </div>
  );
}

function Testimonials(): JSX.Element {
  return (
    <section className="relative text-charcoal-300 dark:text-white body-font py-24 dark:bg-fuchsia-900 bg-purple-200">
      <div className="absolute bg-white/50 dark:bg-black/70 top-0 bottom-0 right-0 left-0 z-0"></div>
      <div className="container mx-auto flex flex-col">
        <h2 className="text-4xl/[1.5] font-bold mb-6 text-charcoal-300 dark:text-white pb-11 z-10">
          What People Are Saying ✨
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
          <TestimonialCard
            username="Ayush Pande"
            source="XDA Developers"
            userImage="https://static1.xdaimages.com/wordpress%2Fwp-content%2Fauthors%2F66963136cc077-ayush-pande.jpg?q=50&fit=crop&w=360&h=360&dpr=1.5"
            date="April 20 2025"
            text="Unlike its rival, Podman Desktop not only supports multiple container runtimes (including Docker Desktop), but also includes a ton of extensions to boost your workstation's capabilities."
          />
          <TestimonialCard
            username="DonSchenck"
            userImage="https://pbs.twimg.com/profile_images/1774956557161115648/Y_GLSoGT_400x400.jpg"
            source="X"
            date="April 25 2025"
            text="Dude ... podman. And Podman Desktop. Seriously. Open Source and doesn't run as root."
          />
          <TestimonialCard
            username="anonymous"
            source="GitHub discussions"
            date="April 5 2024"
            text="I have spent a lot of hours trying out various projects in the past few months for my homelab to test some custom workloads.... OpenStack (Devstack), k3s, rancher, portainer, minikube, docker desktop, etc. and I have found what I needed with your Podman Desktop."
          />
          <TestimonialCard
            username="José Bayoán Santiago Calderón"
            userImage="https://s.gravatar.com/avatar/a8070ca24f919e30e60dce8a763c8177?s=200"
            source="LinkedIn"
            text="I'm pleasantly surprised by how well Podman Desktop integrates with the Visual Studio Code Dev Containers extension. #dev #opensource #containers"
          />
        </div>
      </div>
    </section>
  );
}

function FAQ(): JSX.Element {
  return (
    <section className="dark:text-white text-charcoal-300 py-24 font-body text-4xl leading-[1.2] bg-white dark:bg-black bg-gradient-to-br from-purple-300/70 dark:from-purple-800 to-transparent">
      <div className="container mx-auto flex flex-col">
        <h2 className="text-4xl font-bold leading-[1.2]">FAQ</h2>
        <div className="p-8">
          <ExpandableFAQ
            title="Is Podman Desktop free?"
            text={
              <p>
                Yes, Podman Desktop is an open-source project released under the Apache License 2.0. This means that it
                is freely available for use, modification, and distribution by anyone, without charge or licensing fees.
                Users can download and use Podman Desktop at no cost, making it accessible to individuals and
                organizations alike.
              </p>
            }
          />
          <ExpandableFAQ
            title="Is Podman Desktop suitable for enterprise use?"
            text={
              <p>
                Yes, Podman Desktop is well-suited for enterprise use, offering a robust and secure application for
                managing containers and Kubernetes. Its support for rootless containers enhances security and simplifies
                compliance, while its compatibility with Docker and seamless integration with existing enterprise tools
                and workflows make it an attractive option for organizations looking to modernize their development.
              </p>
            }
          />
          <ExpandableFAQ
            title="How do I get involved on the project?"
            text={
              <p>
                You can get invloved in the project by visiting our{' '}
                <Link
                  title="GitHub page"
                  href="https://github.com/podman-desktop/podman-desktop"
                  className="dark:text-purple-300">
                  GitHub page
                </Link>{' '}
                and opening a PR, reporting bugs, suggesting new features and enhancements, providing feedback, and
                more. Every action counts and helps us improve Podman Desktop.
              </p>
            }
          />
          <ExpandableFAQ
            title="Does Podman Desktop support Compose?"
            text={
              <p>
                Yes, Podman Desktop supports Compose. You can download the Compose extension to help set up Compose if
                it is not yet installed. For more information and examples, visit our{' '}
                <Link
                  title="Getting started with Compose"
                  to="/tutorial/getting-started-with-compose"
                  className="dark:text-purple-300">
                  Getting started with Compose
                </Link>
                . page.
              </p>
            }
          />
        </div>
      </div>
    </section>
  );
}

function MainFeatures(): JSX.Element {
  return (
    <section className="text-charcoal-300 dark:text-gray-400 bg-gradient-to-bl dark:from-black dark:to-purple-700 from-purple-300 to-gray-200 body-font py-24">
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-left w-full mb-5">
          <div className="flex md:flex-row flex-col items-center space-x-10 xl:space-x-44">
            <div className="lg:grow md:w-1/2 flex flex-col md:items-start md:text-left items-center text-center">
              <SectionLabel name="Essential Features for Containers" />
              <h1 className="title-font text-3xl leading-[3rem] lg:text-4xl lg:leading-[4rem] font-extrabold text-charcoal-300 dark:text-white">
                Simplify Container Management and Boost Developer Productivity
              </h1>
              <p className="leading-relaxed py-5 dark:text-gray-300 text-charcoal-300">
                Podman Desktop enhances developer productivity by integrating with popular container runtimes,
                registries, and developer tools, making it easier to handle containerized applications locally. Whether
                you're building, debugging, or deploying, Podman Desktop provides robust features and seamless controls,
                empowering you to work smarter and faster with containers.
              </p>
              <ReadTheDocsButton to="/docs/containers" />
            </div>
            <ThemedImage
              className="py-4 w-full md:w-1/2 mb-10 md:mb-0"
              alt="Essential Features for Containers"
              sources={{
                light: useBaseUrl('img/features/containers.png'),
                dark: useBaseUrl('img/features/containers.png'),
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 space-x-10 xl:space-x-44 pt-16">
            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Intuitive Graphical Interface"
                sources={{
                  light: useBaseUrl('img/graphical.svg'),
                  dark: useBaseUrl('img/graphical.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white font-bold">
                Intuitive Graphical Interface
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Podman Desktop provides a simple and user-friendly interface for managing containers, making it easier
                for developers to focus on writing code rather than manually handling container configurations.
              </p>
            </div>

            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Container with Security"
                sources={{
                  light: useBaseUrl('img/secured_container.svg'),
                  dark: useBaseUrl('img/secured_container.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text2xl py-3 font-medium text-charcoal-300 dark:text-white font-bold">
                Containers with Security
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Podman is a secure container runtime through its focus on daemonless, rootless containers, SELinux
                support, network policy enforcement, immutable containers. This ensures robust security foundations for
                running Linux containers and Kubernetes workloads.
              </p>
            </div>

            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Cross-Platform Support"
                sources={{
                  light: useBaseUrl('img/platforms.svg'),
                  dark: useBaseUrl('img/platforms.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white font-bold">
                Cross-Platform Support
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Available on Linux®, macOS, and Windows, Podman Desktop lets developers create, manage, and delete
                containers without the need for complex scripting or manual intervention.
              </p>
            </div>

            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Built with Container Standards"
                sources={{
                  light: useBaseUrl('img/certified_container.svg'),
                  dark: useBaseUrl('img/certified_container.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white font-bold">
                Built with Container Standards
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Podman supports industry-standard container technologies like OCI, and Compose. This compatibility
                ensures a smooth transition without disrupting existing workflows or requiring extensive retooling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdditionalFeatures(): JSX.Element {
  return (
    <section className="text-charcoal-300 dark:text-white bg-white dark:bg-black bg-gradient-to-b from-purple-300 to-transparent dark:from-transparent dark:to-purple-700/40  py-24 body-font md:w-full">
      <div className="container mx-auto flex flex-col flex-wrap">
        <h2 className="text-4xl/[1.5] font-bold mb-6 text-charcoal-300 dark:text-white pb-11 ">
          And Many More Features ✨
        </h2>
        <div className="flex flex-row flex-wrap items-stretch justify-center gap-7">
          <div className="flex flex-col grow w-11/12 md:w-1/3 lg:w-1/6 items-start justify-start gap-1 bg-purple-100 dark:bg-purple-800 dark:grayscale-75 rounded-lg p-6">
            <p className="text-lg font-semibold leading-[1.5]">Learning center</p>
            <p className="text-xs leading-[1.5]">
              Demystify complex topics and expand knowledge of crucial technologies and components, through tutorials,
              videos and documentation resources.
            </p>
          </div>
          <div className="flex flex-col grow w-11/12 md:w-1/3 lg:w-1/6 items-start justify-start gap-1 bg-purple-100 dark:bg-purple-800 dark:grayscale-75 rounded-lg p-6">
            <p className="text-lg font-semibold leading-[1.5]">Extensions</p>
            <p className="text-xs leading-[1.5]">
              Podman Desktop extends its capabilities through extensions, allowing developers to tailor the tool to
              their unique needs and eventually build their own solutions.
            </p>
          </div>
          <div className="flex flex-col grow w-11/12 md:w-1/3 lg:w-1/6 items-start justify-start gap-1 bg-purple-100 dark:bg-purple-800 dark:grayscale-75 rounded-lg p-6">
            <p className="text-lg font-semibold leading-[1.5]">GPU Acceleration</p>
            <p className="text-xs leading-[1.5]">
              To support any of your local AI development workflows, Podman Desktop enables GPU acceleration and
              optimizes performance when running models with containers locally.
            </p>
          </div>
          <div className="flex flex-col grow w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/6 items-start justify-start gap-1 bg-purple-100 dark:bg-purple-800 dark:grayscale-75 rounded-lg p-6">
            <p className="text-lg font-semibold leading-[1.5]">Multi-arch Support</p>
            <p className="text-xs leading-[1.5]">
              Cross-platform multi-architecture support, to build and run containers for multiple hardware platforms,
              from ARM to x86_64.
            </p>
          </div>
          <div className="flex flex-col grow w-11/12 md:w-1/3 lg:w-1/6 items-start justify-start gap-1 bg-purple-100 dark:bg-purple-800 dark:grayscale-75 rounded-lg p-6">
            <p className="text-lg font-semibold leading-[1.5]">Enterprise Ready</p>
            <p className="text-xs leading-[1.5]">
              Extensive integrations, including VPN and Proxy support for secure networking configurations, streamlined
              image registry management, and options for air-gapped installations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pods(): JSX.Element {
  return (
    <section className="text-charcoal-300 dark:text-gray-400 bg-gradient-to-tr dark:from-black dark:to-purple-700 from-purple-300 to-gray-200 body-font py-24">
      <div className="container px-5 mx-auto flex flex-wrap">
        <div className="flex flex-col text-right w-full mb-5">
          <div className="flex md:flex-row flex-col-reverse items-center space-x-10 xl:space-x-44">
            <ThemedImage
              className="py-4 w-full md:w-1/2 mb-10 md:mb-0"
              alt="Streamline Kubernetes workflows"
              sources={{
                light: useBaseUrl('img/features/kubernetes.png'),
                dark: useBaseUrl('img/features/kubernetes.png'),
              }}
            />
            <div className="lg:grow md:w-1/2 flex flex-col md:items-end md:text-right items-center text-center">
              <SectionLabel name="Crafted for Kubernetes" />
              <h1 className="title-font text-3xl leading-[3rem] lg:text-4xl lg:leading-[4rem] font-extrabold text-charcoal-300 dark:text-white">
                Streamline Kubernetes workflows
              </h1>
              <p className="leading-relaxed py-5 dark:text-gray-300 text-charcoal-300">
                Podman Desktop isn't just a container manager; it's built with Kubernetes at its core. This deep
                integration means seamless workflows for developers. Work with Podman's native Kubernetes support or
                effortlessly spin up local Kind or Minikube clusters, bridge to remote environments, and manage your
                Kubernetes deployments directly through Podman Desktop's intuitive graphical interface. Inspect,
                configure, and orchestrate your pods, services, and deployments with ease, making Kubernetes management
                both powerful and user-friendly.
              </p>
              <ReadTheDocsButton to="docs/kubernetes" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 space-x-4 pt-16">
            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Develop and Test"
                sources={{
                  light: useBaseUrl('img/developtest.svg'),
                  dark: useBaseUrl('img/developtest.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white mb-0">
                Develop and Test
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Iterate faster with streamlined workflows enabling developers to develop locally and reducing
                turnarounds cycles.
              </p>
            </div>
            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Grow Your Skills at Your Pace"
                sources={{
                  light: useBaseUrl('img/grow.svg'),
                  dark: useBaseUrl('img/grow.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white mb-0">
                Grow Skills at Your Pace
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Start with containers and seamlessly transition to Kubernetes concepts with Podman capabilities. Podman
                Desktop makes learning and adoption Kubernetes easy.
              </p>
            </div>
            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Kubernetes Made Easy"
                sources={{
                  light: useBaseUrl('img/troubleshoot1.svg'),
                  dark: useBaseUrl('img/troubleshoot1.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white mb-0">
                Kubernetes Made Easy
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Whether working natively with Kubernetes objects or managing local or remote clusters, Podman Desktop
                streamlines your workflows with its intuitive graphical interface.
              </p>
            </div>
            <div className="flex flex-col md:items-start md:text-left items-center text-center">
              <ThemedImage
                className="py-4 h-[90px]"
                alt="Troubleshoot with Ease"
                sources={{
                  light: useBaseUrl('img/troubleshoot2.svg'),
                  dark: useBaseUrl('img/troubleshoot2.svg'),
                }}
              />
              <h2 className="title-font sm:text-3xl text-2xl py-3 font-medium text-charcoal-300 dark:text-white mb-0">
                Troubleshoot with Ease
              </h2>
              <p className="leading-relaxed py-3 dark:text-gray-300 text-charcoal-300">
                Directly access logs, metrics and debug tools with Podman Desktop intuitive graphical interface to
                resolve issues efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Podman Desktop - Containers and Kubernetes"
      description="Podman Desktop - An open source graphical tool for developing on containers and Kubernetes">
      <TailWindThemeSelector />
      <Hero />
      <MainFeatures />
      <Pods />
      <AdditionalFeatures />
      <Testimonials />
      <VendorCards />
      <FAQ />
    </Layout>
  );
}
