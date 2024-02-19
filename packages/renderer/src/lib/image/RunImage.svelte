<script lang="ts">
import { runImageInfo } from '../../stores/run-image-store';
import { onMount } from 'svelte';
import type { ContainerCreateOptions, HostConfig } from '../../../../main/src/plugin/api/container-info';
import type { ImageInspectInfo } from '../../../../main/src/plugin/api/image-inspect-info';
import FormPage from '../ui/FormPage.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import { faFolderOpen, faMinusCircle, faPlay, faPlusCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { router } from 'tinro';
import Route from '../../Route.svelte';
import type { NetworkInspectInfo } from '../../../../main/src/plugin/api/network-info';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import { ContainerUtils } from '../container/container-utils';
import { containersInfos } from '../../stores/containers';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import { splitSpacesHandlingDoubleQuotes } from '../string/string';
import { array2String } from '/@/lib/string/string.js';
import Tab from '../ui/Tab.svelte';
import Button from '../ui/Button.svelte';
import Input from '/@/lib/ui/Input.svelte';

interface PortInfo {
  port: string;
  error: string;
}

let image: ImageInfoUI;

let imageInspectInfo: ImageInspectInfo;

let containerName = '';
let containerNameError = '';

let command = '';

let entrypoint = '';

let containerPortMapping: PortInfo[];
let exposedPorts: string[] = [];
let createError: string | undefined = undefined;
let restartPolicyName = '';
let restartPolicyMaxRetryCount = 1;
let onPortInputTimeout: NodeJS.Timeout;

// initialize with empty array
let environmentVariables: { key: string; value: string }[] = [{ key: '', value: '' }];
let environmentFiles: string[] = [''];
let volumeMounts: { source: string; target: string }[] = [{ source: '', target: '' }];
let hostContainerPortMappings: { hostPort: PortInfo; containerPort: string }[] = [];

let invalidName = false;
let invalidPorts = false;
$: invalidFields = invalidName || invalidPorts;

// auto remove the container on exit
let autoRemove = false;

// privileged moade
let privileged = false;

// read-only moade
let readOnly = false;

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
let useTty = true;
let useInteractive = true;

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

  containerPortMapping = [];

  imageInspectInfo = await window.getImageInspect(image.engineId, image.id);
  exposedPorts = Array.from(Object.keys(imageInspectInfo?.Config?.ExposedPorts || {}));

  command = array2String(imageInspectInfo.Config?.Cmd || []);

  if (imageInspectInfo.Config?.Entrypoint) {
    if (typeof imageInspectInfo.Config.Entrypoint === 'string') {
      entrypoint = imageInspectInfo.Config.Entrypoint;
    } else {
      entrypoint = array2String(imageInspectInfo.Config.Entrypoint);
    }
  } else {
    entrypoint = '';
  }

  // auto-assign ports from available free port
  containerPortMapping = new Array<PortInfo>(exposedPorts.length);
  await Promise.all(
    exposedPorts.map(async (port, index) => {
      const localPorts = await getPortsInfo(port);
      if (localPorts) {
        containerPortMapping[index] = { port: localPorts, error: '' };
      }
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

async function getPortsInfo(portDescriptor: string): Promise<string | undefined> {
  // check if portDescriptor is a range of ports
  if (portDescriptor.includes('-')) {
    return await getPortRange(portDescriptor);
  } else {
    const localPort = await getPort(portDescriptor);
    if (!localPort) {
      return undefined;
    }
    return `${localPort}`;
  }
}

/**
 * Select an environment file
 */
async function selectEnvironmentFile(index: number) {
  const filePaths = await window.openDialog({ title: 'Select environment file' });
  if (filePaths?.length === 1) {
    environmentFiles[index] = filePaths[0];
  }
}

/**
 * return a range of the same length as portDescriptor containing free ports
 * undefined if the portDescriptor range is not valid
 * e.g 5000:5001 -> 9000:9001
 */
async function getPortRange(portDescriptor: string): Promise<string | undefined> {
  const rangeValues = getStartEndRange(portDescriptor);
  if (!rangeValues) {
    return Promise.resolve(undefined);
  }

  const rangeSize = rangeValues.endRange + 1 - rangeValues.startRange;
  try {
    // if free port range fails, return undefined
    return await window.getFreePortRange(rangeSize);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function getPort(portDescriptor: string): Promise<number | undefined> {
  let port: number;
  if (portDescriptor.endsWith('/tcp') || portDescriptor.endsWith('/udp')) {
    port = parseInt(portDescriptor.substring(0, portDescriptor.length - 4));
  } else {
    port = parseInt(portDescriptor);
  }
  // invalid port
  if (isNaN(port)) {
    return Promise.resolve(undefined);
  }
  try {
    // if getFreePort fails, it returns undefined
    return await window.getFreePort(port);
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function startContainer() {
  createError = undefined;
  // create ExposedPorts objects
  const ExposedPorts: any = {};

  const PortBindings: any = {};
  try {
    exposedPorts.forEach((port, index) => {
      if (port.includes('-') || containerPortMapping[index]?.port.includes('-')) {
        addPortsFromRange(ExposedPorts, PortBindings, port, containerPortMapping[index].port);
      } else {
        if (containerPortMapping[index]?.port) {
          PortBindings[port] = [{ HostPort: containerPortMapping[index].port }];
        }
        ExposedPorts[port] = {};
      }
    });

    hostContainerPortMappings
      .filter(pair => pair.hostPort.port && pair.containerPort)
      .forEach(pair => {
        if (pair.containerPort.includes('-') || pair.hostPort.port.includes('-')) {
          addPortsFromRange(ExposedPorts, PortBindings, pair.containerPort, pair.hostPort.port);
        } else {
          PortBindings[pair.containerPort] = [{ HostPort: pair.hostPort.port }];
          ExposedPorts[pair.containerPort] = {};
        }
      });
  } catch (e) {
    createError = String(e);
    console.error('Error while creating container', e);
    return;
  }

  const Env = environmentVariables
    // filter variables withouts keys
    .filter(env => env.key)
    // no value, use empty string
    .map(env => `${env.key}=${env.value || ''}`);

  // filter empty files
  const EnvFiles = environmentFiles.filter(env => env);

  const Image = image.tag ? `${image.name}:${image.tag}` : image.id;

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
  const OpenStdin = useInteractive;
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
    EnvFiles,
    name: containerName,
    HostConfig,
    ExposedPorts,
    Tty,
    OpenStdin,
  };
  if (command.trim().length > 0) {
    options.Cmd = splitSpacesHandlingDoubleQuotes(command);
  }
  if (entrypoint.trim().length > 0) {
    options.Entrypoint = splitSpacesHandlingDoubleQuotes(entrypoint);
  }

  if (runUser) {
    options.User = runUser;
  }

  if (hostname) {
    options.Hostname = hostname;
  }

  try {
    const data = await window.createAndStartContainer(imageInspectInfo.engineId, options);

    // redirect to containers if no tty, else redirect to the container details
    if (Tty && OpenStdin) {
      router.goto(`/containers/${data.id}/tty`);
    } else {
      router.goto('/containers');
    }
  } catch (e) {
    createError = String(e);
    console.error('Error while creating container', e);
    return;
  }
}

function addPortsFromRange(
  exposedPorts: { [key: string]: unknown },
  portBindings: { [key: string]: unknown },
  containerRange: string,
  hostRange: string,
) {
  const containerRangeValues = getStartEndRange(containerRange);
  if (!containerRangeValues) {
    throw new Error(`range ${containerRange} is not valid. Must be in format <port>-<port> (e.g 8080-8085)`);
  }
  const startContainerRange = containerRangeValues.startRange;
  const endContainerRange = containerRangeValues.endRange;

  const hostRangeValues = getStartEndRange(hostRange);
  if (!hostRangeValues) {
    throw new Error(`range ${hostRange} is not valid. Must be in format <port>-<port> (e.g 8080-8085)`);
  }
  const startHostRange = hostRangeValues.startRange;
  const endHostRange = hostRangeValues.endRange;

  // if the two ranges have different size, do not proceed
  const containerRangeSize = endContainerRange + 1 - startContainerRange;
  const hostRangeSize = endHostRange + 1 - startHostRange;
  if (containerRangeSize !== hostRangeSize) {
    throw new Error(
      `host and container port ranges (${hostRange}:${containerRange}) have different lengths: ${hostRangeSize} vs ${containerRangeSize}`,
    );
  }

  // we add all ports separately - if we have two ranges like 8080-8082 and 9000-9002 we'll end up with a mapping like
  // 8080 => HostPort: 9000
  // 8081 => HostPort: 9001
  // 8082 => HostPort: 9002
  for (let i = 0; i < containerRangeSize; i++) {
    portBindings[`${startContainerRange + i}`] = [{ HostPort: `${startHostRange + i}` }];
    exposedPorts[`${startContainerRange + i}`] = {};
  }
}

function getStartEndRange(range: string) {
  if (range.endsWith('/tcp') || range.endsWith('/udp')) {
    range = range.substring(0, range.length - 4);
  }

  const rangeValues = range.split('-');
  if (rangeValues.length !== 2) {
    return undefined;
  }
  const startRange = parseInt(rangeValues[0]);
  const endRange = parseInt(rangeValues[1]);

  if (isNaN(startRange) || isNaN(endRange)) {
    return undefined;
  }
  return {
    startRange,
    endRange,
  };
}

function addEnvVariable() {
  environmentVariables = [...environmentVariables, { key: '', value: '' }];
}

function deleteEnvVariable(index: number) {
  environmentVariables = environmentVariables.filter((_, i) => i !== index);
}

function addEnvFile() {
  environmentFiles = [...environmentFiles, ''];
}

function deleteEnvFile(index: number) {
  environmentFiles = environmentFiles.filter((_, i) => i !== index);
}

function handleCleanValueEnvFile(
  event: MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  },
  index: number,
) {
  environmentFiles[index] = '';
  event.preventDefault();
}

function addHostContainerPorts() {
  hostContainerPortMappings = [
    ...hostContainerPortMappings,
    {
      hostPort: {
        port: '',
        error: '',
      },
      containerPort: '',
    },
  ];
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
    invalidName = true;
  } else {
    containerNameError = '';
    invalidName = false;
  }
}

function onContainerPortMappingInput(event: Event, index: number) {
  onPortInput(event, containerPortMapping[index], () => {
    containerPortMapping = containerPortMapping;
    assertAllPortAreValid();
  });
}

function onHostContainerPortMappingInput(event: Event, index: number) {
  onPortInput(event, hostContainerPortMappings[index].hostPort, () => {
    hostContainerPortMappings = hostContainerPortMappings;
    assertAllPortAreValid();
  });
}

function onPortInput(event: Event, portInfo: PortInfo, updateUI: () => void) {
  // clear the timeout so if there was an old call to areAllPortsFree pending is deleted. We will create a new one soon
  clearTimeout(onPortInputTimeout);
  const target = event.currentTarget as HTMLInputElement;
  // convert string to number
  const _value: number = Number(target.value);
  // if number is not valid (NaN or outside the value range), set the error
  if (isNaN(_value) || _value < 0 || _value > 65535) {
    portInfo.error = 'port should be >= 0 and < 65536';
    updateUI();
    return;
  }
  onPortInputTimeout = setTimeout(() => {
    isPortFree(_value).then(isFree => {
      portInfo.error = isFree;
      updateUI();
    });
  }, 500);
}

function isPortFree(port: number): Promise<string> {
  return window
    .isFreePort(port)
    .then(isFree => {
      if (!isFree) {
        return `Port ${port} is already in use`;
      } else {
        return '';
      }
    })
    .catch((_: unknown) => `Port ${port} is already in use`);
}

async function assertAllPortAreValid(): Promise<void> {
  const invalidHostPorts = hostContainerPortMappings.filter(pair => pair.hostPort.error);
  const invalidContainerPortMapping = containerPortMapping?.filter(port => port.error) || [];
  invalidPorts = invalidHostPorts.length > 0 || invalidContainerPortMapping.length > 0;
}
</script>

<Route path="/*">
  {#if dataReady}
    <FormPage title="Create a container from image {imageDisplayName}:{image.tag}">
      <svelte:fragment slot="icon">
        <i class="fas fa-play fa-2x" aria-hidden="true"></i>
      </svelte:fragment>
      <div slot="content" class="p-5 min-w-full h-fit">
        <div class="bg-charcoal-600 px-6 py-4 space-y-2 lg:px-8 sm:pb-6 xl:pb-8">
          <div class="flex flex-row px-2 border-b border-charcoal-400">
            <Tab title="Basic" url="basic" />
            <Tab title="Advanced" url="advanced" />
            <Tab title="Networking" url="networking" />
            <Tab title="Security" url="security" />
          </div>
          <div>
            <Route path="/basic" breadcrumb="Basic" navigationHint="tab">
              <div class="h-96 overflow-y-auto pr-4">
                <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-400"
                  >Container name:</label>
                <Input
                  on:input="{event => checkContainerName(event)}"
                  bind:value="{containerName}"
                  name="modalContainerName"
                  id="modalContainerName"
                  placeholder="Leave blank to generate a name"
                  error="{containerNameError}" />
                <label for="modalEntrypoint" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Entrypoint:</label>
                <Input bind:value="{entrypoint}" name="modalEntrypoint" id="modalEntrypoint" />
                <label for="modalCommand" class="pt-4 block mb-2 text-sm font-medium text-gray-400">Command:</label>
                <Input bind:value="{command}" name="modalCommand" id="modalCommand" />
                <label for="volumes" class="pt-4 block mb-2 text-sm font-medium text-gray-400">Volumes:</label>
                <!-- Display the list of volumes -->
                {#each volumeMounts as volumeMount, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input bind:value="{volumeMount.source}" placeholder="Path on the host" class="ml-2" />
                    <button
                      title="Open dialog to select a directory"
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      on:click="{() => browseFolders(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faFolderOpen}" />
                    </button>
                    <Input
                      bind:value="{volumeMount.target}"
                      placeholder="Path inside the container"
                      class="ml-2 w-full" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === volumeMounts.length - 1}"
                      on:click="{() => deleteVolumeMount(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < volumeMounts.length - 1}"
                      on:click="{addVolumeMount}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- add a label for each port-->
                <label for="modalContainerName" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Port mapping:</label>
                {#each exposedPorts as port, index}
                  <div class="flex flex-row justify-center items-center w-full">
                    <span class="text-sm flex-1 inline-block align-middle whitespace-nowrap text-gray-700"
                      >Local port for {port}:</span>
                    <Input
                      bind:value="{containerPortMapping[index].port}"
                      on:input="{event => onContainerPortMappingInput(event, index)}"
                      placeholder="Enter value for port {port}"
                      error="{containerPortMapping[index].error}"
                      class="ml-2 w-full"
                      title="{containerPortMapping[index].error}" />
                  </div>
                {/each}

                <Button class="pt-3 pb-2" on:click="{addHostContainerPorts}" icon="{faPlusCircle}" type="link">
                  Add custom port mapping
                </Button>
                <!-- Display the list of existing hostContainerPortMappings -->
                {#each hostContainerPortMappings as hostContainerPortMapping, index}
                  <div class="flex flex-row justify-center w-full py-1">
                    <Input
                      bind:value="{hostContainerPortMapping.hostPort.port}"
                      on:input="{event => onHostContainerPortMappingInput(event, index)}"
                      aria-label="host port"
                      placeholder="Host Port"
                      error="{hostContainerPortMapping.hostPort.error}"
                      class="w-full"
                      title="{hostContainerPortMapping.hostPort.error}" />
                    <Input
                      bind:value="{hostContainerPortMapping.containerPort}"
                      aria-label="container port"
                      placeholder="Container Port"
                      class="ml-2 w-full" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      on:click="{() => deleteHostContainerPorts(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                  </div>
                {/each}
                <label for="modalEnvironmentVariables" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Environment variables:</label>
                <!-- Display the list of existing environment variables -->
                {#each environmentVariables as environmentVariable, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input bind:value="{environmentVariable.key}" placeholder="Name" class="w-full" />

                    <Input
                      bind:value="{environmentVariable.value}"
                      placeholder="Value (leave blank for empty)"
                      class="ml-2 w-full" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === environmentVariables.length - 1}"
                      on:click="{() => deleteEnvVariable(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < environmentVariables.length - 1}"
                      on:click="{addEnvVariable}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}
              </div>

              <label for="modalEnvironmentFiles" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                >Environment files:</label>
              <!-- Display the list of existing environment files -->
              {#each environmentFiles as environmentFile, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <div class="w-full flex">
                    <Input
                      class="grow"
                      readonly
                      placeholder="Environment file containing KEY=VALUE items"
                      bind:value="{environmentFile}"
                      aria-label="environmentFile.{index}" />
                    <button
                      class="relative cursor-pointer right-5"
                      class:hidden="{!environmentFile}"
                      aria-label="clear"
                      on:click="{event => handleCleanValueEnvFile(event, index)}">
                      <Fa icon="{faXmark}" />
                    </button>
                    <Button
                      on:click="{() => selectEnvironmentFile(index)}"
                      id="filePath.{index}"
                      aria-label="button-select-env-file-{index}">Browse ...</Button>
                  </div>
                  <button
                    class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                    hidden="{index === environmentFiles.length - 1}"
                    aria-label="Delete env file at index {index}"
                    on:click="{() => deleteEnvFile(index)}">
                    <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                  </button>
                  <button
                    class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                    hidden="{index < environmentFiles.length - 1}"
                    aria-label="Add env file after index {index}"
                    on:click="{addEnvFile}">
                    <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                  </button>
                </div>
              {/each}
            </Route>
            <Route path="/advanced" breadcrumb="Advanced" navigationHint="tab">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- Use tty -->
                <label for="containerTty" class="block mb-2 text-sm font-medium text-gray-400">Use TTY:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    bind:checked="{useTty}"
                    class="mx-2 outline-none text-sm"
                    aria-label="Attach a pseudo terminal" />
                  Attach a pseudo terminal
                </div>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    bind:checked="{useInteractive}"
                    class="mx-2 outline-none text-sm"
                    aria-label="Use interactive" />
                  Interactive: Keep STDIN open even if not attached
                </div>

                <!-- Specify user-->
                <label for="containerUser" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Specify user to run container as:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <Input
                    bind:value="{runUser}"
                    placeholder="If you specify a username, user must exist in /etc/passwd file (use user id instead)"
                    class="ml-2" />
                </div>

                <!-- Autoremove-->
                <label for="containerAutoRemove" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Auto removal of container:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-700 text-sm">
                  <input type="checkbox" bind:checked="{autoRemove}" class="mx-2 outline-none text-sm" />
                  Automatically remove the container when the process exits
                </div>

                <!-- RestartPolicy-->
                <label for="containerRestartPolicy" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Restart policy:</label>
                <div class="p-0 flex flex-row justify-start items-center align-middle w-full text-gray-700">
                  <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-700"
                    >Policy name:</span>

                  <select
                    class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
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
                    class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-700"
                    title="Number of times to retry before giving up.">Retries:</span>
                  <input
                    type="number"
                    min="0"
                    bind:value="{restartPolicyMaxRetryCount}"
                    placeholder="Number of times to retry before giving up"
                    class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                    disabled="{restartPolicyName !== 'on-failure'}" />
                </div>
              </div>
            </Route>

            <Route path="/security" breadcrumb="Security" navigationHint="tab">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- Privileged-->
                <label for="containerPrivileged" class="block mb-2 text-sm font-medium text-gray-400"
                  >Privileged:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-700 text-sm">
                  <input type="checkbox" bind:checked="{privileged}" class="mx-2 outline-none text-sm" />
                  Turn off security<i class="pl-1 fas fa-exclamation-triangle"></i>
                </div>

                <!-- Read-Only -->
                <label for="containerReadOnly" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Read only:</label>
                <div class="flex flex-row justify-start items-center align-middle w-full text-gray-700 text-sm">
                  <input type="checkbox" bind:checked="{readOnly}" class="mx-2 outline-none text-sm" />
                  Make containers root filesystem read-only
                </div>

                <label for="ContainerSecurityOptions" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Security options (security-opt):</label>
                <!-- Display the list of existing security options -->
                {#each securityOpts as securityOpt, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input
                      bind:value="{securityOpt}"
                      placeholder="Enter a security option (Ex. seccomp=/path/to/profile.json)"
                      class="ml-2" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === securityOpts.length - 1}"
                      on:click="{() => deleteSecurityOpt(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < securityOpts.length - 1}"
                      on:click="{addSecurityOpt}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <label for="ContainerSecurityCapabilitiesAdd" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Capabilities:</label>

                <label
                  for="ContainerSecurityCapabilitiesAdd"
                  class="pl-4 pt-2 block mb-2 text-sm font-medium text-gray-400">Add to the container (CapAdd):</label>
                <!-- Display the list of existing capAdd -->
                {#each capAdds as capAdd, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input bind:value="{capAdd}" placeholder="Enter a kernel capability (Ex. SYS_ADMIN)" class="ml-4" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === capAdds.length - 1}"
                      on:click="{() => deleteCapAdd(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < capAdds.length - 1}"
                      on:click="{addCapAdd}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}
                <label
                  for="ContainerSecurityCapabilitiesDrop"
                  class="pl-4 pt-2 block mb-2 text-sm font-medium text-gray-400"
                  >Drop from the container (CapDrop):</label>
                <!-- Display the list of existing capDrop -->
                {#each capDrops as capDrop, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input
                      bind:value="{capDrop}"
                      placeholder="Enter a kernel capability (Ex. SYS_ADMIN)"
                      class="ml-4" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === capDrops.length - 1}"
                      on:click="{() => deleteCappDrop(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < capDrops.length - 1}"
                      on:click="{addCapDrop}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- Specify user namespace-->
                <label for="containerUserNamespace" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Specify user namespace to use:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <Input bind:value="{userNamespace}" placeholder="Enter a user namespace" class="ml-2 w-full" />
                </div>
              </div>
            </Route>

            <Route path="/networking" breadcrumb="Networking" navigationHint="tab">
              <div class="h-96 overflow-y-auto pr-4">
                <!-- hostname-->
                <label for="containerHostname" class="block mb-2 text-sm font-medium text-gray-400"
                  >Defines container hostname:</label>
                <div class="flex flex-row justify-center items-center w-full">
                  <Input bind:value="{hostname}" placeholder="Must be a valid RFC 1123 hostname" class="ml-2" />
                </div>

                <!-- DNS -->
                <label for="ContainerDns" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Custom DNS server(s):</label>

                {#each dnsServers as dnsServer, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input bind:value="{dnsServer}" placeholder="IP Address" class="ml-2" />

                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === dnsServers.length - 1}"
                      on:click="{() => deleteDnsServer(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < dnsServers.length - 1}"
                      on:click="{addDnsServer}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <label for="containerExtraHosts" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Add extra hosts (appends to /etc/hosts file):</label>
                <!-- Display the list of existing environment variables -->
                {#each extraHosts as extraHost, index}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <Input bind:value="{extraHost.host}" placeholder="Hostname" class="ml-2 w-full" />

                    <Input bind:value="{extraHost.ip}" placeholder="IP Address" class="ml-2 w-full" />
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index === extraHosts.length - 1}"
                      on:click="{() => deleteExtraHost(index)}">
                      <Fa class="h-4 w-4 text-xl" icon="{faMinusCircle}" />
                    </button>
                    <button
                      class="ml-2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      hidden="{index < extraHosts.length - 1}"
                      on:click="{addExtraHost}">
                      <Fa class="h-4 w-4 text-xl" icon="{faPlusCircle}" />
                    </button>
                  </div>
                {/each}

                <!-- Select network -->
                <label for="containerNetwork" class="pt-4 block mb-2 text-sm font-medium text-gray-400"
                  >Select container networking:</label>
                <div class="p-0 flex flex-row justify-start items-center align-middle w-full text-gray-700">
                  <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-700">Mode:</span>

                  <select
                    class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
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
                    <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-700">Network:</span>
                    <select
                      class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
                      disabled="{networkingMode !== 'choice-network'}"
                      name="networkingModeUserNetwork"
                      bind:value="{networkingModeUserNetwork}">
                      {#each engineNetworks as network}
                        <option value="{network.Id}"
                          >{network.Name} (used by {Object.keys(network.Containers || {}).length} containers)</option>
                      {/each}
                    </select>
                  </div>
                {/if}
                {#if networkingMode === 'choice-container'}
                  <div class="flex flex-row justify-center items-center w-full py-1">
                    <span class="text-sm w-28 inline-block align-middle whitespace-nowrap text-gray-700"
                      >Container:</span>
                    <select
                      class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
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
          <Button on:click="{() => startContainer()}" class="w-full" icon="{faPlay}" bind:disabled="{invalidFields}">
            Start Container
          </Button>
          <div aria-label="createError">
            {#if createError}
              <ErrorMessage class="py-2 text-sm" error="{createError}" />
            {/if}
          </div>
        </div>
      </div>
    </FormPage>
  {/if}
</Route>
