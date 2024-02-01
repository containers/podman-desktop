import * as cheerio from 'cheerio';
import * as fs from 'fs';

const allowed: string[] = [
  '/api/namespaces/commands',
  '/api/enumerations/ProgressLocation',
  '/api/classes/Disposable',
  '/api/interfaces/Command',
  '/api/type-aliases/StatusBarAlignment',
  '/api/variables/StatusBarItemDefaultPriority',
];

// Extract a list of pathnames, given a fs path to a sitemap.xml file
// Docusaurus generates a build/sitemap.xml file for you!
export function extractSitemapPathnames(sitemapPath: string): string[] {
  const sitemap = fs.readFileSync(sitemapPath).toString();
  const $ = cheerio.load(sitemap, { xmlMode: true });
  let urls: string[] = [];
  $('loc').each(function handleLoc() {
    urls.push($(this).text());
  });

  // filter out all /tags/ pages
  urls = urls.filter(url => !url.includes('/tags/') && !url.endsWith('/tags'));

  let pathnames = urls.map(url => new URL(url).pathname);

  // filter out all /api pages since they are auto generated
  // keeping an example of each type (namespace, enum, class, interface, type, variable) to avoid regression.
  pathnames = pathnames.filter(url => !url.startsWith('/api') || allowed.includes(url));

  return pathnames;
}

// Converts a pathname to a decent screenshot name
export function pathnameToArgosName(pathname: string): string {
  return pathname.replace(/^\/|\/$/g, '') || 'index';
}
