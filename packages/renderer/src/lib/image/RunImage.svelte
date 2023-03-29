<script lang="ts">
import { runImageInfo } from '../../stores/run-image-store';
import { onMount } from 'svelte';
import type { ContainerCreateOptions, HostConfig } from '../../../../main/src/plugin/api/container-info';
import type { ImageInspectInfo } from '../../../../main/src/plugin/api/image-inspect-info';
import NavPage from '../ui/NavPage.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import { faFolderOpen, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import { router, Route } from 'tinro';
import type { NetworkInspectInfo } from '../../../../main/src/plugin/api/network-info';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import { ContainerUtils } from '../container/container-utils';
import { containersInfos } from '../../stores/containers';
import ErrorMessage from '../ui/ErrorMessage.svelte';
let image: ImageInfoUI;

let imageInspectInfo: ImageInspectInfo;

let containerName = '';
let containerNameError = '';

let invalidFields = false;

let containerPortMapping: string[];
let exposedPorts = [];
let createError;
let restartPolicyName = '';
let restartPolicyMaxRetryCount = 1;

// initialize with empty array
let environmentVariables: { key: string; value: string }[] = [{ key: '', value: '' }];
let volumeMounts: { source: string; target: string }[] = [{ source: '', target: '' }];
let hostContainerPortMappings: { hostPort: string; containerPort: string }[] = [];

// auto remove the container on exit
let autoRemove: boolean = false;

// privileged moade
let privileged: boolean = false;

// read-only moade
let readOnly: boolean = false;

// security options
let securityOpts: string[] = [''];

// Kernel capabilities
let capAdds: string[] = [''];
let capDrops: string[] = [''];

// user namespace
let userNamespace: string | undefined = undefined;

// hostname;
let hostname: string | undefined = undefined;

// dns servers
let dnsServers: string[] = [''];

// extra hosts
let extraHosts: { host: string; ip: string }[] = [{ host: '', ip: '' }];

// networking mode
let networkingMode = 'bridge';
// user defined network if user choose a pre-defined network
let networkingModeUserNetwork = '';
// container defined network if user choose a pre-defined container
let networkingModeUserContainer = '';

// tty
let useTty: boolean = true;

let runUser: string | undefined = undefined;
let dataReady = false;

let imageDisplayName = '';

let engineNetworks: NetworkInspectInfo[] = [];
let engineContainers: ContainerInfoUI[] = [];

onMount(async () => {
  // grab current value
  image = $runImageInfo;

  if (!image) {
    // go back to image list
    router.goto('/images/');
    return;
  }

  exposedPorts = [];
  containerPortMapping = [];

  imageInspectInfo = await window.getImageInspect(image.engineId, image.id);
  exposedPorts = Array.from(Object.keys(imageInspectInfo?.Config?.ExposedPorts || {}));

  // auto-assign ports from available free port
  containerPortMapping = new Array<string>(exposedPorts.length);
  await Promise.all(
    exposedPorts.map(async (port, index) => {
      const localPort = await getPort(port);
      containerPortMapping[index] = `${localPort}`;
    }),
  );
  dataReady = true;
  if (image.name && image.name.length > 60) {
    imageDisplayName = '...' + image.name.substring(image.name.length - 60);
  } else {
    imageDisplayName = image.name;
  }

  // grab all networks
  const allNetworks = await window.listNetworks();
  // keep only the network matching our engine
  engineNetworks = allNetworks.filter(network => network.engineId === image.engineId);

  if (engineNetworks.length > 0) {
    // try to match the bridge network
    const bridgeNetwork = engineNetworks.find(network => network.Name === 'bridge');
    if (bridgeNetwork) {
      networkingModeUserNetwork = bridgeNetwork.Id;
    } else {
      // fallback to the first network
      networkingModeUserNetwork = engineNetworks[0].Id;
    }
  }

  // grab all containers
  const allContainers = await window.listContainers();
  const containerUtils = new ContainerUtils();
  // keep only the containers matching our engine
  engineContainers = allContainers
    .filter(container => container.engineId === image.engineId)
    .map(container => containerUtils.getContainerInfoUI(container));

  if (engineContainers.length > 0) {
    // do we have a Running container ?
    // sort from newest to oldest
    const runningContainers = engineContainers
      .filter(container => container.state === 'RUNNING')
      .sort((a, b) => b.created - a.created);
    if (runningContainers.length > 0) {
      // use the first running container
      networkingModeUserContainer = runningContainers[0].id;
    } else {
      // fallback to the first container
      networkingModeUserContainer = engineContainers[0].id;
    }
  }
});

function getPort(portDescriptor: string): Promise<number | undefined> {
  let port: number;
  if (portDescriptor.endsWith('/tcp')) {
    port = parseInt(portDescriptor.substring(0, portDescriptor.length - 4));
  } else {
    port = parseInt(portDescriptor);
  }
  // invalid port
  if (isNaN(port)) {
    return Promise.resolve(undefined);
  }
  return window.getFreePort(port);
}

async function startContainer() {
  createError = undefined;
  // create ExposedPorts objects
  const ExposedPorts = {};

  const PortBindings = {};
  exposedPorts.forEach((port, index) => {
    if (containerPortMapping[index]) {
      PortBindings[port] = [{ HostPort: containerPortMapping[index] }];
    }
    ExposedPorts[port] = {};
  });

  hostContainerPortMappings
    .filter(pair => pair.hostPort && pair.containerPort)
    .map(pair => {
      PortBindings[pair.containerPort] = [{ HostPort: pair.hostPort }];
      ExposedPorts[pair.containerPort] = {};
    });

  const Env = environmentVariables
    // filter variables withouts keys
    .filter(env => env.key)
    // no value, use empty string
    .map(env => `${env.key}=${env.value || ''}`);

  const Image = image.id;

  const RestartPolicy: { Name: string; MaximumRetryCount?: number } = {
    Name: restartPolicyName,
  };

  // only set MaximumRetryCount if policy is 'on-failure'
  if (restartPolicyName === 'on-failure') {
    RestartPolicy.MaximumRetryCount = restartPolicyMaxRetryCount;
  }

  // need both source and target to be set
  const Binds = volumeMounts
    .filter(volume => volume.source && volume.target)
    .map(volume => `${volume.source}:${volume.target}`);

  const SecurityOpt = securityOpts.filter(opt => opt);

  const CapAdd = capAdds.filter(cap => cap);
  const CapDrop = capDrops.filter(cap => cap);

  const ExtraHosts = extraHosts.filter(host => host.host && host.ip).map(host => `${host.host}:${host.ip}`);

  const Privileged = privileged;

  let NetworkMode;
  switch (networkingMode) {
    case 'bridge':
      NetworkMode = 'bridge';
      break;
    case 'host':
      NetworkMode = 'host';
      break;
    case 'none':
      NetworkMode = 'none';
      break;
    case 'choice-network':
      NetworkMode = networkingModeUserNetwork;
      break;
    case 'choice-container':
      NetworkMode = `container:${networkingModeUserContainer}`;
      break;
    default:
      NetworkMode = 'bridge';
  }

  const ReadonlyRootfs = readOnly;
  const Tty = useTty;
  const HostConfig: HostConfig = {
    Binds,
    AutoRemove: autoRemove,
    RestartPolicy,
    PortBindings,
    SecurityOpt,
    Privileged,
    ReadonlyRootfs,
    CapAdd,
    CapDrop,
    NetworkMode,
  };

  const Dns = dnsServers.filter(dns => dns);
  if (Dns.length > 0) {
    HostConfig.Dns = Dns;
  }

  if (ExtraHosts.length > 0) {
    HostConfig.ExtraHosts = ExtraHosts;
  }

  if (userNamespace) {
    HostConfig.UsernsMode = userNamespace;
  }

  const options: ContainerCreateOptions = {
    Image,
    Env,
    name: containerName,
    HostConfig,
    ExposedPorts,
    Tty,
  };

  if (runUser) {
    options.User = runUser;
  }

  if (hostname) {
    options.Hostname = hostname;
  }

  try {
    await window.createAndStartContainer(imageInspectInfo.engineId, options);
  } catch (e) {
    createError = e;
    console.error('Error while creating container', e);
    return;
  }
  // redirect to containers
  window.location.href = '#/containers';
}

function addEnvVariable() {
  environmentVariables = [...environmentVariables, { key: '', value: '' }];
}

function deleteEnvVariable(index: number) {
  environmentVariables = environmentVariables.filter((_, i) => i !== index);
}

function addHostContainerPorts() {
  hostContainerPortMappings = [...hostContainerPortMappings, { hostPort: '', containerPort: '' }];
}

function deleteHostContainerPorts(index: number) {
  hostContainerPortMappings = hostContainerPortMappings.filter((_, i) => i !== index);
}

async function browseFolders(index: number) {
  // need to show the dialog to open a folder and then we update the source of the given index
  const result = await window.openFolderDialog('Select a directory to mount in the container');

  if (!result.canceled && result.filePaths.length === 1) {
    volumeMounts[index].source = result.filePaths[0];
  }
}

function addVolumeMount() {
  volumeMounts = [...volumeMounts, { source: '', target: '' }];
}

function deleteVolumeMount(index: number) {
  volumeMounts = volumeMounts.filter((_, i) => i !== index);
}

function deleteSecurityOpt(index: number) {
  securityOpts = securityOpts.filter((_, i) => i !== index);
}

function addSecurityOpt() {
  securityOpts = [...securityOpts, ''];
}

function addCapAdd() {
  capAdds = [...capAdds, ''];
}
function addCapDrop() {
  capDrops = [...capDrops, ''];
}

function deleteCapAdd(index: number) {
  capAdds = capAdds.filter((_, i) => i !== index);
}

function deleteCappDrop(index: number) {
  capDrops = capDrops.filter((_, i) => i !== index);
}

function addDnsServer() {
  dnsServers = [...dnsServers, ''];
}

function deleteDnsServer(index: number) {
  dnsServers = dnsServers.filter((_, i) => i !== index);
}

function addExtraHost() {
  extraHosts = [...extraHosts, { host: '', ip: '' }];
}

function deleteExtraHost(index: number) {
  extraHosts = extraHosts.filter((_, i) => i !== index);
}

// called when user change the container's name
function checkContainerName(event: any) {
  const containerValue = event.target.value;

  // ok, now check if we already have a matching container: same name and same engine ID
  const containerAlreadyExists = $containersInfos.find(
    container =>
      container.engineId === imageInspectInfo.engineId &&
      container.Names.some(iteratingContainerName => iteratingContainerName === `/${containerValue}`),
  );
  if (containerAlreadyExists) {
    containerNameError = `The name ${containerValue} already exists. Please choose another name or leave blank to generate a name.`;
    invalidFields = true;
  } else {
    containerNameError = '';
    invalidFields = false;
  }
}
</script>

<Route path="/*" let:meta>
  {#if dataReady}
    <NavPage title="Create a container from image {imageDisplayName}:{image.tag}" searchEnabled="{false}">
      <div slot="empty" class="bg-zinc-700 p-5 h-full">
        <div class="bg-zinc-800 px-6 py-4 space-y-2 lg:px-8 sm:pb-6 xl:pb-8">
          <section class="pf-c-page__main-tabs pf-m-limit-width">
            <div class="pf-c-page__main-body">
              <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                <ul class="pf-c-tabs__list">
                  <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === `/images/run/basic`}">
                    <a
                      href="/images/run/basic"
                      class="pf-c-tabs__link"
                      aria-controls="open-tabs-example-tabs-list-details-panel"
                      id="open-tabs-example-tabs-list-details-link">
                      <span class="pf-c-tabs__item-text">Basic</span>
                    </a>
                  </li>
                  <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === `/images/run/advanced`}">
                    <a
                      href="/images/run/advanced"
                      class="pf-c-tabs__link"
                      aria-controls="open-tabs-example-tabs-list-details-panel"
                      id="open-tabs-example-tabs-list-details-link">
                      <span class="pf-c-tabs__item-text">Advanced</span>
                    </a>
                  </li>
                  <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === `/images/run/networking`}">
                    <a
                      href="/images/run/networking"
                      class="pf-c-tabs__link"
                      aria-controls="open-tabs-example-tabs-list-yaml-panel"
                      id="open-tabs-example-tabs-list-yaml-link">
                      <span class="pf-c-tabs__item-text">Networking</span>
                    </a>
                  </li>
                  <li class="pf-c-tabs__item" class:pf-m-current="{meta.url === `/images/run/security`}">
                    <a
                      href="/images/run/security"
                      class="pf-c-tabs__link"
                      aria-controls="open-tabs-example-tabs-list-yaml-panel"
                      id="open-tabs-example-tabs-list-yaml-link">
                      <span class="pf-c-tabs__item-text">Security</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <div>
            <Route path="/basic">
              <div class="h-96 overflow-y-auto pr-4">
                <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Container name:</label>
                <input
                  type="text"
                  on:input="{event => checkContainerName(event)}"
                  bind:value="{containerName}"
                  name="modalContainerName"
                  id="modalContainerName"
                  placeholder="Leave blank to generate a name"
                  class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400 border {containerNameError
                    ? 'border-red-500'
                    : 'border-zinc-900'}" />
                <ErrorMessage class="h-1 text-sm" error="{containerNameError}" />
                <label for="volumes" class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Volumes:</label>
                <!-- Display the list of volumes -->
                {#each volumeMounts as volumeMount, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <div class="flex w-full flex-row bg-zinc-900 rounded-sm text-sm text-gray-400 placeholder-gray-400">
                      <input
                        type="text"
                        bind:value="{volumeMount.source}"
                        placeholder="Path on the host"
                        class="ml-2 w-full p-2 outline-none bg-zinc-900" />
                      <button
                        title="Open dialog to select a directory"
                        class="p-2 outline-none text-gray-400"
                        on:click="{() => browseFolders(index)}">
                        <Fa class="h-4 w-4 text-xl" icon="{faFolderOpen}" />
                      </button>
                    </div>
                    <input
                      type="text"
                      bind:value="{volumeMount.target}"
                      placeholder="Path inside the container"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === volumeMounts.length - 1}"
                      on:click="{() => deleteVolumeMount(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < volumeMounts.length - 1}"
                      on:click="{addVolumeMount}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- add a label for each port-->
                <label
                  for="modalContainerName"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">Port mapping:</label>
                {#each exposedPorts as port, index}
                  <div class="flex flex-row justify-center items-center w-full">
                    <span class="text-sm flex-1 inline-block align-middle whitespace-nowrap text-gray-400"
                      >Local port for {port}:</span>
                    <input
                      type="text"
                      bind:value="{containerPortMapping[index]}"
                      placeholder="Enter value for port {port}"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                  </div>
                {/each}

                <button
                  class="pt-3 pb-2 outline-none text-sm rounded-sm bg-transparent placeholder-gray-400"
                  on:click="{addHostContainerPorts}">
                  <span class="pf-c-button__icon pf-m-start">
                    <i class="fas fa-plus-circle"></i>
                  </span>
                  Add custom port mapping</button>
                <!-- Display the list of existing hostContainerPortMappings -->
                {#each hostContainerPortMappings as hostContainerPortMapping, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{hostContainerPortMapping.hostPort}"
                      placeholder="Host Port"
                      class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                    <input
                      type="text"
                      bind:value="{hostContainerPortMapping.containerPort}"
                      placeholder="Container Port"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      on:click="{() => deleteHostContainerPorts(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                  </div>
                {/each}
                <label
                  for="modalEnvironmentVariables"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Environment variables:</label>
                <!-- Display the list of existing environment variables -->
                {#each environmentVariables as environmentVariable, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{environmentVariable.key}"
                      placeholder="Name"
                      class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <input
                      type="text"
                      bind:value="{environmentVariable.value}"
                      placeholder="Value (leave blank for empty)"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === environmentVariables.length - 1}"
                      on:click="{() => deleteEnvVariable(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < environmentVariables.length - 1}"
                      on:click="{addEnvVariable}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}
              </div>
            </Route>
            <Route path="/advanced">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- Use tty -->
                <label for="containerTty" class="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Use TTY:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-400 text-sm">
                  <input type="checkbox" bind:checked="{useTty}" class="mx-2 outline-none text-sm" />
                  Attach a pseudo terminal
                </div>

                <!-- Specify user-->
                <label for="containerUser" class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Specify user to run container as:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <input
                    type="text"
                    bind:value="{runUser}"
                    placeholder="If you specify a username, user must exist in /etc/passwd file (use user id instead)"
                    class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                </div>

                <!-- Autoremove-->
                <label
                  for="containerAutoRemove"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Auto removal of container:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-400 text-sm">
                  <input type="checkbox" bind:checked="{autoRemove}" class="mx-2 outline-none text-sm" />
                  Automatically remove the container when the process exits
                </div>

                <!-- RestartPolicy-->
                <label
                  for="containerRestartPolicy"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">Restart policy:</label>
                <div class="p-0 flex flex-row justify-start items-center align-middle w-full text-gray-400">
                  <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-400"
                    >Policy name:</span>

                  <select
                    class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                    name="restartPolicyName"
                    bind:value="{restartPolicyName}">
                    <option value="">No restart</option>
                    <option value="no">Do not restart automatically</option>
                    <option value="always">Always restart</option>
                    <option value="unless-stopped">Restart only if user has not manually stopped</option>
                    <option value="on-failure">Restart only if exit code is non-zero</option>
                  </select>
                </div>

                <div
                  class="flex flex-row justify-center items-center w-full py-1 {restartPolicyName === 'on-failure'
                    ? 'opacity-100'
                    : 'opacity-20'}">
                  <span
                    class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-400"
                    title="Number of times to retry before giving up.">Retries:</span>
                  <input
                    type="number"
                    min="0"
                    bind:value="{restartPolicyMaxRetryCount}"
                    placeholder="Number of times to retry before giving up"
                    class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                    disabled="{restartPolicyName !== 'on-failure'}" />
                </div>
              </div>
            </Route>

            <Route path="/security">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- Privileged-->
                <label for="containerPrivileged" class="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Privileged:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-400 text-sm">
                  <input type="checkbox" bind:checked="{privileged}" class="mx-2 outline-none text-sm" />
                  Turn off security<i class="pl-1 fas fa-exclamation-triangle"></i>
                </div>

                <!-- Read-Only -->
                <label
                  for="containerReadOnly"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">Read only:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-400 text-sm">
                  <input type="checkbox" bind:checked="{readOnly}" class="mx-2 outline-none text-sm" />
                  Make containers root filesystem read-only
                </div>

                <label
                  for="ContainerSecurityOptions"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Security options (security-opt):</label>
                <!-- Display the list of existing security options -->
                {#each securityOpts as securityOpt, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{securityOpt}"
                      placeholder="Enter a security option (Ex. seccomp=/path/to/profile.json)"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === securityOpts.length - 1}"
                      on:click="{() => deleteSecurityOpt(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < securityOpts.length - 1}"
                      on:click="{addSecurityOpt}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <label
                  for="ContainerSecurityCapabilitiesAdd"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">Capabilities:</label>

                <label
                  for="ContainerSecurityCapabilitiesAdd"
                  class="pl-4 pt-2 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Add to the container (CapAdd):</label>
                <!-- Display the list of existing capAdd -->
                {#each capAdds as capAdd, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{capAdd}"
                      placeholder="Enter a kernel capability (Ex. SYS_ADMIN)"
                      class="ml-4 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === capAdds.length - 1}"
                      on:click="{() => deleteCapAdd(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < capAdds.length - 1}"
                      on:click="{addCapAdd}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}
                <label
                  for="ContainerSecurityCapabilitiesDrop"
                  class="pl-4 pt-2 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Drop from the container (CapDrop):</label>
                <!-- Display the list of existing capDrop -->
                {#each capDrops as capDrop, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{capDrop}"
                      placeholder="Enter a kernel capability (Ex. SYS_ADMIN)"
                      class="ml-4 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === capDrops.length - 1}"
                      on:click="{() => deleteCappDrop(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < capDrops.length - 1}"
                      on:click="{addCapDrop}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- Specify user namespace-->
                <label
                  for="containerUserNamespace"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Specify user namespace to use:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <input
                    type="text"
                    bind:value="{userNamespace}"
                    placeholder="Enter a user namespace"
                    class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                </div>
              </div>
            </Route>

            <Route path="/networking">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- hostname-->
                <label for="containerHostname" class="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Defines container hostname:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <input
                    type="text"
                    bind:value="{hostname}"
                    placeholder="Must be a valid RFC 1123 hostname"
                    class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                </div>

                <!-- DNS -->
                <label for="ContainerDns" class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Custom DNS server(s):</label>

                {#each dnsServers as dnsServer, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{dnsServer}"
                      placeholder="IP Address"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === dnsServers.length - 1}"
                      on:click="{() => deleteDnsServer(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < dnsServers.length - 1}"
                      on:click="{addDnsServer}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <label
                  for="containerExtraHosts"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Add extra hosts (appends to /etc/hosts file):</label>
                <!-- Display the list of existing environment variables -->
                {#each extraHosts as extraHost, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <input
                      type="text"
                      bind:value="{extraHost.host}"
                      placeholder="Hostname"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />

                    <input
                      type="text"
                      bind:value="{extraHost.ip}"
                      placeholder="IP Address"
                      class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index === extraHosts.length - 1}"
                      on:click="{() => deleteExtraHost(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      hidden="{index < extraHosts.length - 1}"
                      on:click="{addExtraHost}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- Select network -->
                <label
                  for="containerNetwork"
                  class="pt-4 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Select container networking:</label>
                <div class="p-0 flex flex-row justify-start items-center align-middle w-full text-gray-400">
                  <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-400">Mode:</span>

                  <select
                    class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                    name="providerChoice"
                    bind:value="{networkingMode}">
                    <option value="bridge">Creates a network stack on the default bridge (default)</option>
                    <option value="none">No networking</option>
                    <option value="host">Use the host networking stack</option>
                    <option value="choice-container">Use another container networking stack</option>
                    <!-- display only if there is at least one network-->
                    <option value="choice-network">User-defined network</option>
                  </select>
                </div>

                {#if networkingMode === 'choice-network'}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-400">Network:</span>
                    <select
                      class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      disabled="{networkingMode !== 'choice-network'}"
                      name="networkingModeUserNetwork"
                      bind:value="{networkingModeUserNetwork}">
                      {#each engineNetworks as network}
                        <option value="{network.Id}"
                          >{network.Name} (used by {Object.keys(network.Containers).length} containers)</option>
                      {/each}
                    </select>
                  </div>
                {/if}
                {#if networkingMode === 'choice-container'}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-400"
                      >Container:</span>
                    <select
                      class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                      disabled="{networkingMode !== 'choice-container'}"
                      name="networkingModeUserContainer"
                      bind:value="{networkingModeUserContainer}">
                      {#each engineContainers as container}
                        <option value="{container.id}">{container.name} ({container.shortId})</option>
                      {/each}
                    </select>
                  </div>
                {/if}
              </div>
            </Route>
          </div>

          <div class="pt-2 border-zinc-600 border-t-2"></div>
          <button
            on:click="{() => startContainer()}"
            class="w-full pf-c-button pf-m-primary pt-6"
            disabled="{invalidFields}">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-play" aria-hidden="true"></i>
            </span>
            Start Container</button>
          <ErrorMessage class="py-2 text-sm" error="{createError}" />
        </div>
      </div>
    </NavPage>
  {/if}
</Route>
