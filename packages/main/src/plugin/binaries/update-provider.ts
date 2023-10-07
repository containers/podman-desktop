export interface AssetInfo {
  id: number;
  name: string;
}

export abstract class UpdateProvider {
  protected constructor(public readonly protocol: string) {}
  abstract getCandidateVersions(uri: URL, limit?: number): Promise<AssetInfo[]>;
  abstract performInstall(uri: URL, asset: AssetInfo, destination: string): Promise<void>;
}
