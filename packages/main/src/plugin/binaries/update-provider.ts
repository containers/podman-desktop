export interface AssetInfo {
  id: number;
  name: string;
}

export abstract class UpdateProvider {
  abstract getCandidateVersions(limit?: number): Promise<AssetInfo[]>;
  abstract performInstall(asset: AssetInfo, destination: string): Promise<void>;
}
