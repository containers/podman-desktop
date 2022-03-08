interface Window {
    readonly events: { send: (channel: string, data: string) => void; receive: (channel: string, func: any) => void; };
    readonly listContainers: () => Promise<import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/container-info").ContainerInfo[]>;
    readonly listImages: () => Promise<import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/image-info").ImageInfo[]>;
    readonly startContainer: (engine: string, containerId: string) => Promise<void>;
    readonly createAndStartContainer: (engine: string, options: import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/container-info").ContainerCreateOptions) => Promise<void>;
    readonly stopContainer: (engine: string, containerId: string) => Promise<void>;
    readonly startProviderLifecycle: (providerName: string) => Promise<void>;
    readonly stopProviderLifecycle: (providerName: string) => Promise<void>;
    readonly buildImage: (buildDirectory: string, imageName: string, eventCollect: (eventName: string, data: string) => void) => Promise<unknown>;
    readonly getImageInspect: (engine: string, imageId: string) => Promise<import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/image-inspect-info").ImageInspectInfo>;
    readonly getProviderInfos: () => Promise<import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/provider-info").ProviderInfo[]>;
    readonly listExtensions: () => Promise<import("/Users/benoitf/git/benoitf/container-desktop/packages/preload/src/api/extension-info").ExtensionInfo[]>;
    readonly stopExtension: (extensionId: string) => Promise<void>;
    readonly startExtension: (extensionId: string) => Promise<void>;
    readonly openExternal: (link: string) => void;
}
