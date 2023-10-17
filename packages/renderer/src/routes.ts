export class PodDetailsRoute {
  static path(): string {
    return '/pods/:kind/:name/:engineId/*';
  }

  static getRoute({ kind, name, engineId }: { kind: string; name: string; engineId: string }, other?: string): string {
    return `/pods/${encodeURI(kind)}/${encodeURI(name)}/${encodeURIComponent(engineId)}${other}`;
  }

  static getKind(params: Record<string, string>): string {
    return decodeURI(params.kind);
  }

  static getName(params: Record<string, string>): string {
    return decodeURI(params.name);
  }

  static getEngineId(params: Record<string, string>): string {
    return decodeURIComponent(params.engineId);
  }
}
