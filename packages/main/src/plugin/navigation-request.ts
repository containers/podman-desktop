import type { NavigationPage } from '/@/plugin/navigation-page.js';

export interface NavigationRequest {
  page: NavigationPage;
  parameters?: { [key: string]: string };
}
