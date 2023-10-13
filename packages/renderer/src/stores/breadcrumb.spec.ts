import type { TinroBreadcrumb } from 'tinro';
import { lastPage, currentPage, history } from './breadcrumb';

export function mockBreadcrumb() {
  history.set([{ name: 'List', path: '/list' } as TinroBreadcrumb]);
  lastPage.set({ name: 'Previous', path: '/last' } as TinroBreadcrumb);
  currentPage.set({ name: 'Current', path: '/current' } as TinroBreadcrumb);
}
