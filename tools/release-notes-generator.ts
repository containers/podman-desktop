import { graphql } from '@octokit/graphql';

const RELEASE_NOTES_SECTION_TAG = '// release-notes';

const DEFAULT_MAPPINGS = new Map<string, string>([
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['docs', 'Documentation'],
  ['chore', 'Other'],
]);

const DEFAULT_CATEGORY = 'Other';

interface PullRequestInfo {
  title: string;
  link: string;
  number: number;
  sections: string[];
}
class Generator {
  private client;
  constructor(
    private token: string,
    private organization: string,
    private repo: string,
    private isUser: boolean,
    private milestone: string | undefined,
  ) {
    this.client = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  private getMilestoneQuery(): string {
    return `query {
  ${this.isUser ? 'user' : 'organization'}(login: "${this.organization}") {
    repository(name: "${this.repo}") {
      milestones(last:1, states: OPEN${this.milestone ? ', query: "' + `${this.milestone}` + '"' : ''}) {
    nodes {
    id
    title
    }
    }
    }
  }
}`;
  }

  private getPullRequestsQuery(milestone: string, latestPR?: string): string {
    return `query {
  ${this.isUser ? 'user' : 'organization'}(login: "${this.organization}") {
      repository(name: "${this.repo}") {
        milestones(last:1, states: OPEN, query: "${milestone}") {
          nodes {
            pullRequests(first: 100, states: MERGED${latestPR ? ', after: "' + `${latestPR}` + '"' : ''}) {
              pageInfo {
                endCursor
                startCursor
              }
              nodes {
                title
                state
                id
                number
                body
                permalink
              }
            }
          }
        }
      }
    }
  }`;
  }

  async getMilestone() {
    const query = this.getMilestoneQuery();
    const result = await this.client(query);
    if (this.isUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).user?.repository?.milestones?.nodes[0];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).organization?.repository?.milestones?.nodes[0];
    }
  }

  async getPullRequests(milestone: string, latestPr?: string) {
    const query = this.getPullRequestsQuery(milestone, latestPr);
    const result = await this.client(query);
    if (this.isUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).user?.repository?.milestones?.nodes[0].pullRequests;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any).organization?.repository?.milestones?.nodes[0].pullRequests;
    }
  }

  public getReleaseNotesSections(input: string): string[] {
    const sections = [];

    let index = 0;
    while ((index = input.indexOf(RELEASE_NOTES_SECTION_TAG, index)) != -1) {
      const endIndex = input.indexOf(RELEASE_NOTES_SECTION_TAG, index + RELEASE_NOTES_SECTION_TAG.length);
      if (endIndex != -1) {
        sections.push(input.substring(index + RELEASE_NOTES_SECTION_TAG.length, endIndex));
        index = endIndex + RELEASE_NOTES_SECTION_TAG.length;
      } else {
        sections.push(input.substring(index + RELEASE_NOTES_SECTION_TAG.length));
        break;
      }
    }
    return sections;
  }

  private processPullRequestTitle(title: string): { category: string; title: string } {
    const index = title.indexOf(':');
    if (index > 0) {
      let category: string | undefined = title.substring(0, index);
      const subIndex = category.indexOf('(');
      if (subIndex > 0) {
        category = category.substring(0, subIndex);
      }
      title = title.substring(index + 1).trim();
      category = DEFAULT_MAPPINGS.get(category);
      if (!category) {
        category = DEFAULT_CATEGORY;
      }
      return { category, title };
    } else {
      return { category: DEFAULT_CATEGORY, title };
    }
  }

  async generate(): Promise<string> {
    const milestone = await this.getMilestone();
    if (milestone) {
      const prInfos = new Map<string, PullRequestInfo[]>();
      let latestPR = undefined;
      let done = false;
      while (!done) {
        const pullRequests = await this.getPullRequests(milestone.title, latestPR);
        latestPR = pullRequests?.pageInfo?.endCursor;
        if (pullRequests?.nodes?.length) {
          for (const pr of pullRequests.nodes) {
            if (pr.body && pr.title) {
              const sections = this.getReleaseNotesSections(pr.body);
              if (sections.length > 0) {
                const { category, title } = this.processPullRequestTitle(pr.title);
                let categoryInfos = prInfos.get(category);
                if (!categoryInfos) {
                  categoryInfos = [];
                  prInfos.set(category, categoryInfos);
                }
                categoryInfos.push({ title, link: pr.permalink, number: pr.number, sections });
              }
            }
          }
        } else {
          done = true;
        }
      }
      let content = '';
      prInfos.forEach((prInfos1, category) => {
        content += `### ${category}\n`;
        prInfos1.forEach(prInfo => {
          content += `  - ${prInfo.title} [(#${prInfo.number})](${prInfo.link})\n`;
          content += prInfo.sections.join('');
          content += '\n';
        });
      });
      return content;
    } else {
      throw new Error(this.milestone ? `Milestone ${this.milestone} not found` : 'no milestone found');
    }
  }
}

async function run() {
  let token = process.env.GITHUB_TOKEN;
  if (!token) {
    token = process.env.GH_TOKEN;
  }
  const args = process.argv.slice(2);
  let organization = 'containers';
  let repo = 'podman-desktop';
  let isUser = false;
  let milestone = undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token') {
      token = args[++i];
    } else if (args[i] === '--org') {
      organization = args[++i];
    } else if (args[i] === '--user') {
      organization = args[++i];
      isUser = true;
    } else if (args[i] === '--repo') {
      repo = args[++i];
    } else if (args[i] === '--milestone') {
      milestone = args[++i];
    }
  }
  if (token) {
    const rn = await new Generator(token, organization, repo, isUser, milestone).generate();

    console.log(`${rn}`);
  } else {
    console.log('No token found use either GITHUB_TOKEN or pass it as an argument');
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
