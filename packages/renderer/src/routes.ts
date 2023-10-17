interface parameters {
  kind: string;
  name: string;
  engineId: string;
}

export class PodDetailsRoute {
  static path(): string {
    return '/pods/:kind/:name/:engineId/*';
  }

  static getRoute({ kind, name, engineId }: parameters, other?: string): string {
    return `/pods/${encodeURI(kind)}/${encodeURI(name)}/${encodeURIComponent(engineId)}${other}`;
  }

  static getParameters(params: Record<string, string>): parameters {
    return {
      kind: decodeURI(params.kind),
      name: decodeURI(params.name),
      engineId: decodeURIComponent(params.engineId),
    };
  }
}
