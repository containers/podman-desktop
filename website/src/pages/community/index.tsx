import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { faBluesky, faDiscord, faGithub, faLinkedin, faMastodon, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdoptersCard from '@site/src/components/AdoptersCard';
import CommunityBanner from '@site/src/components/CommunityBanner';
import CommunityVideoCard from '@site/src/components/CommunityVideoCard';
import GradientButton from '@site/src/components/GradientButton';
import PodmanMeetingBanner from '@site/src/components/PodmanMeetingBanner';
import TailWindThemeSelector from '@site/src/components/TailWindThemeSelector';
import Layout from '@theme/Layout';
import React from 'react';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  // Video data array
  const learningVideos = [
    {
      id: 'getting-started',
      url: 'https://www.youtube.com/watch?v=2GKZa1WJnz4',
      thumbnail: '/img/video1.png',
      alt: 'getting-started-video',
      caption: 'How to get started with Podman Desktop',
    },
    {
      id: 'what-is-podman',
      url: 'https://www.youtube.com/watch?v=5WML8gX2F1c',
      thumbnail: '/img/video2.png',
      alt: 'what-is-podman',
      caption: 'What is Podman Desktop?',
    },
    {
      id: 'zero-to-hero',
      url: 'https://www.youtube.com/watch?v=YXfA5O5Mr18',
      thumbnail: '/img/video3.png',
      alt: 'zero-to-hero',
      caption: 'Podman tutorial from zero to hero',
    },
    {
      id: 'rag-app',
      url: 'https://www.youtube.com/watch?v=mouu4PR5Dqg',
      thumbnail: '/img/video4.png',
      alt: 'rag-app',
      caption: 'How to develop a RAG application using Podman Desktop',
    },
  ];

  const adoptersLogos = [
    {
      id: 'amadeus-logo',
      logo: '/img/adopters/amadeus_logo_light.svg',
      logoDark: '/img/adopters/amadeus_logo_dark.svg',
      alt: 'amadeus',
      url: 'https://amadeus.com/',
      width: '167px',
      height: '68px',
    },

    {
      id: 'eost-logo',
      logo: '/img/adopters/eost.png',
      alt: 'eost',
      url: 'https://eost.unistra.fr/',
      width: '83px',
      height: '83px',
    },
  ];

  return (
    <Layout title={siteConfig.title} description="Podman Desktop Community page">
      <TailWindThemeSelector />
      <CommunityBanner />

      <div className="max-w-4xl mx-auto p-6 text-center text-base">
        <div className="bg-hero-pattern bg-no-repeat bg-center">
          <img
            src={useBaseUrl('img/seals-community.png')}
            alt="Podman Desktop Community Mascots"
            className="mx-auto mb-8 w-[70%]"
          />
        </div>

        <section className="mb-24">
          <h1 className="text-3xl font-bold mb-6">Podman Desktop Community</h1>
          <p className="text-base">
            Welcome to the Podman Desktop Community! We're excited to have you here. This is the place to connect with
            fellow developers, share your experiences, contribute to the project, and help shape the future of Podman
            Desktop.
          </p>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-6 text-center">Contribute to the Project</h2>
          <p className="mb-14">We welcome contributions of all kinds! Here's how you can get started:</p>
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <a className="font-semibold uppercase" href="https://github.com/containers/podman-desktop">
                Contribute code
              </a>
              <p className="mt-1">
                Tackle open issues, add features, or improve performance by contributing code to our GitHub repository.
              </p>
            </div>
            <div>
              <a className="font-semibold uppercase" href={useBaseUrl('/docs/intro')}>
                Documentation
              </a>
              <p className="mt-1">
                Enhance our docs by clarifying instructions, adding guides, or fixing mistakes for the benefit of all
                users.
              </p>
            </div>
            <div>
              <a className="font-semibold uppercase" href="https://github.com/containers/podman-desktop/issues">
                Report issues
              </a>
              <p className="mt-1">
                Help us improve by reporting bugs or suggesting features through our issue tracker.
              </p>
            </div>
            <div>
              <a className="font-semibold uppercase" href={useBaseUrl('/tutorial')}>
                Tutorials
              </a>
              <p className="mt-1">
                Create or update tutorials to help users get started or explore advanced Podman Desktop features.
              </p>
            </div>
            <div>
              <a
                className="font-semibold uppercase"
                href="https://github.com/podman-desktop/community/blob/main/presentations/README.md">
                Presentations and demos
              </a>
              <p className="mt-1">
                Share or watch community presentations and demos to learn and inspire others with your workflows.
              </p>
            </div>
          </div>
        </section>

        <section id="community-events" className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Attend Community Events</h2>
          <p className="mb-14">Join us for upcoming meetups, webinars, and conferences.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="flex flex-col items-center text-center justify-center">
              <p className="mb-1 font-semibold pb-8 uppercase">View Recordings</p>
              <div className="flex items-center mb-6">
                <a
                  href="https://www.youtube.com/watch?v=l7wtkeCH5Lc&list=PLwQSOOPzuslql836gEAqF66FAYLm5sno-&index=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full relative">
                  <img
                    src="/img/community-meeting.png"
                    alt="meeting thumbnail"
                    style={{
                      width: '243px',
                      height: '153px',
                      borderRadius: '4px',
                      borderWidth: '2px',
                      opacity: 1,
                    }}
                    className="border-solid shadow-lg hover:shadow-xl transition-shadow cursor-pointer "
                  />
                  <img
                    src="/img/play-overlay-button.png"
                    alt="play overlay"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[60px] h-[60px] opacity-80"
                  />
                </a>
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <GradientButton href="https://www.youtube.com/playlist?list=PLwQSOOPzuslql836gEAqF66FAYLm5sno-">
                  Watch All Recordings
                </GradientButton>
              </div>
            </div>

            <div className="flex flex-col items-start justify-start ">
              <p className="mb-1 font-semibold pb-16 uppercase  ">Join community meeting</p>
              <div className="flex gap-2 mb-8">
                <FontAwesomeIcon icon={faCalendar} />
                <span>Every 4th Thursday of the month</span>
              </div>

              <div className="flex gap-2 mb-8 pb-8">
                <FontAwesomeIcon icon={faClock} />
                <span>9–10 am EST</span>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row items-center justify-center">
                <GradientButton
                  href="https://github.com/podman-desktop/community/issues?q=is%3Aissue%20state%3Aopen%20Agenda%20for%20Podman%20Desktop"
                  solid={true}>
                  Join Us!
                </GradientButton>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PodmanMeetingBanner />

      <div className="max-w-6xl mx-auto p-6 text-center text-base">
        <section className="pb-8 pt-8 bg-hero-pattern bg-no-repeat bg-center mb-6">
          <h2 className="text-3xl font-bold mb-6">Get Involved</h2>
          <p className="mb-14">Connect with the community through our official channels:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-8 text-black dark:text-white justify-items-center">
            {/* Row 1 */}
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon icon={faDiscord} size="4x" className="mb-4" />
              <GradientButton href="https://discord.com/invite/x5GzFF6QH4">Join our Discord</GradientButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon icon={faGithub} size="4x" className="mb-4" />
              <GradientButton href="https://github.com/podman-desktop/podman-desktop/discussions">
                GitHub discussions
              </GradientButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon icon={faBluesky} size="4x" className="mb-4" />
              <GradientButton href="https://bsky.app/profile/podman-desktop.io">Follow us on Bluesky</GradientButton>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon icon={faXTwitter} size="4x" className="mb-4" />
              <GradientButton href="https://x.com/podmandesktop">Follow us on X</GradientButton>
            </div>

            {/* Row 2: Center the last two */}
            <div className="contents sm:flex sm:justify-center sm:col-span-4">
              <div className="flex flex-col items-center gap-2 sm:mx-10">
                <FontAwesomeIcon icon={faLinkedin} size="4x" className="mb-4" />
                <GradientButton href="https://www.linkedin.com/company/podman-desktop">
                  Connect on LinkedIn
                </GradientButton>
              </div>
              <div className="flex flex-col items-center gap-2 sm:mx-10">
                <FontAwesomeIcon icon={faMastodon} size="4x" className="mb-4" />
                <GradientButton href="https://fosstodon.org/@podmandesktop">Follow us on Mastodon</GradientButton>
              </div>
            </div>
          </div>
        </section>
        <section id="learning-videos" className="pb-8 pt-8 bg-hero-pattern bg-no-repeat bg-center mb-2">
          <h2 className="text-3xl font-bold mb-12">Learn with Podman Desktop Videos </h2>
          <div className="grid grid-cols-1  md:grid-cols-4 gap-10 text-black dark:text-white justify-items-center">
            {learningVideos.map(video => (
              <CommunityVideoCard
                key={video.id}
                url={video.url}
                thumbnail={video.thumbnail}
                caption={video.caption}
                alt={video.caption}
              />
            ))}
          </div>
          <div className="flex justify-center ">
            <GradientButton href="https://www.youtube.com/playlist?list=PLwQSOOPzuslqqUIaVWGKzO4yd37Qbt2I0">
              See More Content
            </GradientButton>
          </div>
        </section>
      </div>

      <div className="max-w-4xl mx-auto p-6 text-center text-base">
        <section id="adopters" className="pb-8 pt-8  mb-6">
          <h2 className="text-3xl font-bold mb-6">Adopters</h2>
          <p className="mb-14">Organizations and companies using Podman Desktop in production.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-6 text-black dark:text-white justify-items-center">
            {adoptersLogos.map(logo => (
              <AdoptersCard
                key={logo.id}
                logo={logo.logo}
                logoDark={logo.logoDark}
                alt={logo.alt}
                url={logo.url}
                width={logo.width}
                height={logo.height}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <GradientButton href="https://github.com/podman-desktop/podman-desktop/blob/main/ADOPTERS.md">
              <FontAwesomeIcon icon={faGithub} size="1x" className="mr-2" />
              View all Adopters
            </GradientButton>
          </div>
        </section>
      </div>
    </Layout>
  );
}
