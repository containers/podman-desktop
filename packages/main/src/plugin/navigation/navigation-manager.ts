import type { ApiSenderType } from '/@/plugin/api.js';
import type { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { NavigationRequest } from '/@/plugin/navigation/navigation-request.js';
import { NavigationPage } from '/@/plugin/navigation/navigation-page.js';
import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { WebviewRegistry } from '../webview/webview-registry.js';

export class NavigationManager {
  constructor(
    private apiSender: ApiSenderType,
    private containerRegistry: ContainerProviderRegistry,
    private contributionManager: ContributionManager,
    private webviewRegistry: WebviewRegistry,
  ) {}

  navigateTo(navigateRequest: NavigationRequest) {
    this.apiSender.send('navigate', navigateRequest);
  }

  async navigateToHelp(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.HELP,
    });
  }

  async navigateToTroubleshooting(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.TROUBLESHOOTING,
    });
  }

  async navigateToContainers(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.CONTAINERS,
    });
  }

  private async assertContainerExist(id: string): Promise<void> {
    if (!(await this.containerRegistry.containerExist(id))) throw new Error(`Container with id ${id} cannot be found.`);
  }

  async navigateToContainerLogs(id: string): Promise<void> {
    await this.assertContainerExist(id);

    this.navigateTo({
      page: NavigationPage.CONTAINER_LOGS,
      parameters: {
        id: id,
      },
    });
  }

  async navigateToContainerInspect(id: string): Promise<void> {
    await this.assertContainerExist(id);

    this.navigateTo({
      page: NavigationPage.CONTAINER_INSPECT,
      parameters: {
        id: id,
      },
    });
  }

  async navigateToContainerTerminal(id: string): Promise<void> {
    await this.assertContainerExist(id);

    this.navigateTo({
      page: NavigationPage.CONTAINER_TERMINAL,
      parameters: {
        id: id,
      },
    });
  }

  async navigateToContainer(id: string): Promise<void> {
    await this.assertContainerExist(id);

    this.navigateTo({
      page: NavigationPage.CONTAINER,
      parameters: {
        id: id,
      },
    });
  }

  async assertImageExist(id: string, engineId: string, tag: string): Promise<void> {
    if (!(await this.containerRegistry.imageExist(id, engineId, tag)))
      throw new Error(`Image with id ${id}, engine id ${engineId} and tag ${tag} cannot be found.`);
  }

  async navigateToImages(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.IMAGES,
    });
  }

  async navigateToImage(id: string, engineId: string, tag: string): Promise<void> {
    await this.assertImageExist(id, engineId, tag);

    this.navigateTo({
      page: NavigationPage.IMAGE,
      parameters: {
        id: id,
        engineId: engineId,
        tag: tag,
      },
    });
  }

  async assertVolumeExist(id: string, engineId: string): Promise<void> {
    if (!(await this.containerRegistry.volumeExist(id, engineId)))
      throw new Error(`Volume with name ${name} and engine id ${engineId} cannot be found.`);
  }

  async navigateToVolumes(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.VOLUMES,
    });
  }

  async navigateToVolume(name: string, engineId: string): Promise<void> {
    await this.assertVolumeExist(name, engineId);
    this.navigateTo({
      page: NavigationPage.VOLUME,
      parameters: {
        name: name,
        engineId: engineId,
      },
    });
  }

  async assertPodExist(kind: string, name: string, engineId: string): Promise<void> {
    if (!(await this.containerRegistry.podExist(kind, name, engineId)))
      throw new Error(`Pod with kind ${kind}, name ${name} and engine id ${engineId} cannot be found.`);
  }

  async navigateToPods(): Promise<void> {
    this.navigateTo({
      page: NavigationPage.PODS,
    });
  }

  async navigateToPod(kind: string, name: string, engineId: string): Promise<void> {
    await this.assertPodExist(kind, name, engineId);

    this.navigateTo({
      page: NavigationPage.POD,
      parameters: {
        kind: kind,
        name: name,
        engineId: engineId,
      },
    });
  }

  protected assertContributionExist(name: string): void {
    const contribs = this.contributionManager.listContributions();
    if (contribs.find(contrib => contrib.name === name) === undefined) {
      throw new Error(`Contribution with name ${name} cannot be found.`);
    }
  }

  async navigateToContribution(name: string): Promise<void> {
    this.assertContributionExist(name);

    this.navigateTo({
      page: NavigationPage.CONTRIBUTION,
      parameters: {
        name: name,
      },
    });
  }

  protected assertWebviewExist(webviewId: string): void {
    const webviews = this.webviewRegistry.listWebviews();
    if (webviews.find(webview => webview.id === webviewId) === undefined) {
      throw new Error(`Webview with id ${webviewId} cannot be found.`);
    }
  }

  async navigateToWebview(webviewId: string): Promise<void> {
    this.assertWebviewExist(webviewId);

    this.navigateTo({
      page: NavigationPage.WEBVIEW,
      parameters: {
        id: webviewId,
      },
    });
  }
}
