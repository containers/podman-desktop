export class Filter {
  rawFilter: string;

  constructor(filter: string) {
    this.rawFilter = filter;
  }

  searchTerm(): string {
    return this.rawFilter
      .split(' ')
      .filter(part => !part.startsWith('is:'))
      .join(' ');
  }

  setState(isRunning: boolean, isStopped: boolean): string {
    const parts = this.rawFilter.split(' ').filter(part => !part.startsWith('is:'));
    if (isRunning) {
      parts.push('is:running');
    } else if (isStopped) {
      parts.push('is:stopped');
    }
    return parts.join(' ');
  }

  isRunning(): boolean {
    return this.rawFilter.split(' ').includes('is:running');
  }

  isStopped(): boolean {
    return this.rawFilter.split(' ').includes('is:stopped');
  }

  createRunningURL() {
    return `running?filter=${this.setState(true, false)}`;
  }

  createStoppedURL() {
    return `stopped?filter=${this.setState(false, true)}`;
  }

  createAllURL() {
    return `all?filter=${this.setState(false, false)}`;
  }
}
