<script lang="ts">
import { faMinusCircle, faPlay, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import type { OpenDialogOptions } from '@podman-desktop/api';
import { Button, Checkbox, ErrorMessage, Input, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import { array2String } from '/@/lib/string/string.js';
import type { ContainerCreateOptions, HostConfig } from '/@api/container-info';
import type { ImageInspectInfo } from '/@api/image-inspect-info';
import type { NetworkInspectInfo } from '/@api/network-info';

import Route from '../../Route.svelte';
import { containersInfos } from '../../stores/containers';
import { runImageInfo } from '../../stores/run-image-store';
import { ContainerUtils } from '../container/container-utils';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import { splitSpacesHandlingDoubleQuotes } from '../string/string';
import EngineFormPage from '../ui/EngineFormPage.svelte';
import FileInput from '../ui/FileInput.svelte';
import NumberInput from '../ui/NumberInput.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import type { ImageInfoUI } from './ImageInfoUI';

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
  exposedPorts = Array.from(Object.keys(imageInspectInfo?.Config?.ExposedPorts ?? {}));

  command = array2String(imageInspectInfo.Config?.Cmd ?? []);

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
    .map(env => `${env.key}=${env.value ?? ''}`);

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
  assertAllPortAreValid();
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
  onPortInputTimeout = setTimeout(() => {
    window
      .isFreePort(_value)
      .then(_ => {
        portInfo.error = '';
        updateUI();
      })
      .catch((error: unknown) => {
        if (error && typeof error === 'object' && 'message' in error) {
          portInfo.error = (error as { message: string }).message;
        }
        updateUI();
      });
  }, 500);
}

async function assertAllPortAreValid(): Promise<void> {
  const invalidHostPorts = hostContainerPortMappings.filter(pair => pair.hostPort.error);
  const invalidContainerPortMapping = containerPortMapping?.filter(port => port.error) ?? [];
  invalidPorts = invalidHostPorts.length > 0 || invalidContainerPortMapping.length > 0;
}

const volumeDialogOptions: OpenDialogOptions = {
  title: 'Select a directory to mount in the container',
  selectors: ['openDirectory'],
};

const envDialogOptions: OpenDialogOptions = {
  title: 'Select environment file',
  selectors: ['openFile'],
};
</script>

<Route path="/*">
  {#if dataReady}
    <EngineFormPage title="Create a container from image {imageDisplayName}:{image.tag}">
      <svelte:fragment slot="icon">
        <i class="fas fa-play fa-2x" aria-hidden="true"></i>
      </svelte:fragment>
      <div slot="content" class="space-y-2">
        <div class="flex flex-row px-2 border-b border-charcoal-400">
          <Tab title="Basic" selected={isTabSelected($router.path, 'basic')} url={getTabUrl($router.path, 'basic')} />
          <Tab
            title="Advanced"
            selected={isTabSelected($router.path, 'advanced')}
            url={getTabUrl($router.path, 'advanced')} />
          <Tab
            title="Networking"
            selected={isTabSelected($router.path, 'networking')}
            url={getTabUrl($router.path, 'networking')} />
          <Tab
            title="Security"
            selected={isTabSelected($router.path, 'security')}
            url={getTabUrl($router.path, 'security')} />
        </div>
        <div>
          <Route path="/basic" breadcrumb="Basic" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4">
              <label
                for="modalContainerName"
                class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]">Container name:</label>
              <Input
                on:input={event => checkContainerName(event)}
                bind:value={containerName}
                name="modalContainerName"
                id="modalContainerName"
                placeholder="Leave blank to generate a name"
                aria-label="Container Name"
                error={containerNameError} />
              <label
                for="modalEntrypoint"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Entrypoint:</label>
              <Input bind:value={entrypoint} name="modalEntrypoint" id="modalEntrypoint" aria-label="Entrypoint" />
              <label
                for="modalCommand"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]">Command:</label>
              <Input bind:value={command} name="modalCommand" id="modalCommand" aria-label="Command" />
              <label for="volumes" class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Volumes:</label>
              <!-- Display the list of volumes -->
              {#each volumeMounts as volumeMount, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <FileInput
                    id="volumeMount.{index}"
                    placeholder="Path on the host"
                    bind:value={volumeMount.source}
                    options={volumeDialogOptions}
                    aria-label="volumeMount.{index}" />
                  <Input bind:value={volumeMount.target} placeholder="Path inside the container" class="ml-2" />
                  <Button
                    type="link"
                    hidden={index === volumeMounts.length - 1}
                    on:click={() => deleteVolumeMount(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < volumeMounts.length - 1}
                    on:click={addVolumeMount}
                    icon={faPlusCircle} />
                </div>
              {/each}

              <!-- add a label for each port-->
              <label
                for="modalContainerName"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Port mapping:</label>
              {#each exposedPorts as port, index}
                <div class="flex flex-row justify-center items-center w-full">
                  <span
                    class="text-sm flex-1 inline-block align-middle whitespace-nowrap text-[var(--pd-content-card-text)]"
                    >Local port for {port}:</span>
                  <Input
                    bind:value={containerPortMapping[index].port}
                    on:input={event => onContainerPortMappingInput(event, index)}
                    placeholder="Enter value for port {port}"
                    error={containerPortMapping[index].error}
                    class="ml-2 w-full"
                    title={containerPortMapping[index].error} />
                </div>
              {/each}

              <Button
                on:click={addHostContainerPorts}
                icon={faPlusCircle}
                type="link"
                aria-label="Add custom port mapping">
                Add custom port mapping
              </Button>
              <!-- Display the list of existing hostContainerPortMappings -->
              {#each hostContainerPortMappings as hostContainerPortMapping, index}
                <div class="flex flex-row justify-center w-full py-1">
                  <Input
                    bind:value={hostContainerPortMapping.hostPort.port}
                    on:input={event => onHostContainerPortMappingInput(event, index)}
                    aria-label="host port"
                    placeholder="Host Port"
                    error={hostContainerPortMapping.hostPort.error}
                    title={hostContainerPortMapping.hostPort.error} />
                  <Input
                    bind:value={hostContainerPortMapping.containerPort}
                    aria-label="container port"
                    placeholder="Container Port"
                    class="ml-2" />
                  <Button type="link" on:click={() => deleteHostContainerPorts(index)} icon={faMinusCircle} />
                </div>
              {/each}
              <label
                for="modalEnvironmentVariables"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Environment variables:</label>
              <!-- Display the list of existing environment variables -->
              {#each environmentVariables as environmentVariable, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input bind:value={environmentVariable.key} placeholder="Name" class="w-full" />

                  <Input
                    bind:value={environmentVariable.value}
                    placeholder="Value (leave blank for empty)"
                    class="ml-2" />
                  <Button
                    type="link"
                    hidden={index === environmentVariables.length - 1}
                    on:click={() => deleteEnvVariable(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < environmentVariables.length - 1}
                    on:click={addEnvVariable}
                    icon={faPlusCircle} />
                </div>
              {/each}

              <label
                for="modalEnvironmentFiles"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Environment files:</label>
              <!-- Display the list of existing environment files -->
              {#each environmentFiles as environmentFile, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <FileInput
                    id="filePath.{index}"
                    placeholder="Environment file containing KEY=VALUE items"
                    bind:value={environmentFile}
                    options={envDialogOptions}
                    aria-label="environmentFile.{index}" />
                  <Button
                    type="link"
                    hidden={index === environmentFiles.length - 1}
                    aria-label="Delete env file at index {index}"
                    on:click={() => deleteEnvFile(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < environmentFiles.length - 1}
                    aria-label="Add env file after index {index}"
                    on:click={addEnvFile}
                    icon={faPlusCircle} />
                </div>
              {/each}
            </div>
          </Route>
          <Route path="/advanced" breadcrumb="Advanced" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4">
              <!-- Use tty -->
              <label for="containerTty" class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Use TTY:</label>
              <div class="flex flex-col text-[var(--pd-content-card-text)] text-sm ml-2">
                <Checkbox bind:checked={useTty} title="Attach a pseudo terminal">Attach a pseudo terminal</Checkbox>
                <Checkbox bind:checked={useInteractive} title="Use interactive">
                  Interactive: Keep STDIN open even if not attached
                </Checkbox>
              </div>

              <!-- Specify user-->
              <label
                for="containerUser"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Specify user to run container as:</label>
              <div class="flex flex-row justify-center items-center w-full">
                <Input
                  bind:value={runUser}
                  placeholder="If you specify a username, user must exist in /etc/passwd file (use user id instead)"
                  class="ml-2" />
              </div>

              <!-- Autoremove-->
              <label
                for="containerAutoRemove"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Auto removal of container:</label>
              <Checkbox class="text-[var(--pd-content-card-text)] text-sm ml-2" bind:checked={autoRemove}>
                Automatically remove the container when the process exits
              </Checkbox>

              <!-- RestartPolicy-->
              <label
                for="containerRestartPolicy"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Restart policy:</label>
              <div
                class="p-0 flex flex-row justify-start items-center align-middle w-full text-[var(--pd-content-card-text)]">
                <span class="text-sm w-28 inline-block align-middle whitespace-nowrap">Policy name:</span>

                <select
                  class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm"
                  name="restartPolicyName"
                  bind:value={restartPolicyName}>
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
                  class="text-sm w-28 inline-block align-middle whitespace-nowrap text-[var(--pd-content-card-text)]"
                  title="Number of times to retry before giving up.">Retries:</span>
                <NumberInput
                  minimum={0}
                  bind:value={restartPolicyMaxRetryCount}
                  class="w-24 p-2"
                  disabled={restartPolicyName !== 'on-failure'} />
              </div>
            </div>
          </Route>

          <Route path="/security" breadcrumb="Security" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4">
              <!-- Privileged-->
              <label
                for="containerPrivileged"
                class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]">Privileged:</label>
              <Checkbox bind:checked={privileged} class="text-[var(--pd-content-card-text)] text-sm mx-2">
                Turn off security<i class="pl-1 fas fa-exclamation-triangle"></i>
              </Checkbox>

              <!-- Read-Only -->
              <label
                for="containerReadOnly"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]">Read only:</label>
              <Checkbox bind:checked={readOnly} class="text-[var(--pd-content-card-text)] text-sm mx-2">
                Make containers root filesystem read-only
              </Checkbox>

              <label
                for="ContainerSecurityOptions"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Security options (security-opt):</label>
              <!-- Display the list of existing security options -->
              {#each securityOpts as securityOpt, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input
                    bind:value={securityOpt}
                    placeholder="Enter a security option (Ex. seccomp=/path/to/profile.json)"
                    class="ml-2" />

                  <Button
                    type="link"
                    hidden={index === securityOpts.length - 1}
                    on:click={() => deleteSecurityOpt(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < securityOpts.length - 1}
                    on:click={addSecurityOpt}
                    icon={faPlusCircle} />
                </div>
              {/each}

              <label
                for="ContainerSecurityCapabilitiesAdd"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Capabilities:</label>

              <label
                for="ContainerSecurityCapabilitiesAdd"
                class="pl-4 pt-2 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Add to the container (CapAdd):</label>
              <!-- Display the list of existing capAdd -->
              {#each capAdds as capAdd, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input bind:value={capAdd} placeholder="Enter a kernel capability (Ex. SYS_ADMIN)" class="ml-4" />

                  <Button
                    type="link"
                    hidden={index === capAdds.length - 1}
                    on:click={() => deleteCapAdd(index)}
                    icon={faMinusCircle} />
                  <Button type="link" hidden={index < capAdds.length - 1} on:click={addCapAdd} icon={faPlusCircle} />
                </div>
              {/each}
              <label
                for="ContainerSecurityCapabilitiesDrop"
                class="pl-4 pt-2 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Drop from the container (CapDrop):</label>
              <!-- Display the list of existing capDrop -->
              {#each capDrops as capDrop, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input bind:value={capDrop} placeholder="Enter a kernel capability (Ex. SYS_ADMIN)" class="ml-4" />

                  <Button
                    type="link"
                    hidden={index === capDrops.length - 1}
                    on:click={() => deleteCappDrop(index)}
                    icon={faMinusCircle} />
                  <Button type="link" hidden={index < capDrops.length - 1} on:click={addCapDrop} icon={faPlusCircle} />
                </div>
              {/each}

              <!-- Specify user namespace-->
              <label
                for="containerUserNamespace"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Specify user namespace to use:</label>
              <div class="flex flex-row justify-center items-center w-full">
                <Input bind:value={userNamespace} placeholder="Enter a user namespace" class="ml-2 w-full" />
              </div>
            </div>
          </Route>

          <Route path="/networking" breadcrumb="Networking" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4">
              <!-- hostname-->
              <label
                for="containerHostname"
                class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Defines container hostname:</label>
              <div class="flex flex-row justify-center items-center w-full">
                <Input bind:value={hostname} placeholder="Must be a valid RFC 1123 hostname" class="ml-2" />
              </div>

              <!-- DNS -->
              <label
                for="ContainerDns"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Custom DNS server(s):</label>

              {#each dnsServers as dnsServer, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input bind:value={dnsServer} placeholder="IP Address" class="ml-2" />

                  <Button
                    type="link"
                    hidden={index === dnsServers.length - 1}
                    on:click={() => deleteDnsServer(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < dnsServers.length - 1}
                    on:click={addDnsServer}
                    icon={faPlusCircle} />
                </div>
              {/each}

              <label
                for="containerExtraHosts"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Add extra hosts (appends to /etc/hosts file):</label>
              <!-- Display the list of extra hosts -->
              {#each extraHosts as extraHost, index}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <Input bind:value={extraHost.host} placeholder="Hostname" class="ml-2" />

                  <Input bind:value={extraHost.ip} placeholder="IP Address" class="ml-2" />
                  <Button
                    type="link"
                    hidden={index === extraHosts.length - 1}
                    on:click={() => deleteExtraHost(index)}
                    icon={faMinusCircle} />
                  <Button
                    type="link"
                    hidden={index < extraHosts.length - 1}
                    on:click={addExtraHost}
                    icon={faPlusCircle} />
                </div>
              {/each}

              <!-- Select network -->
              <label
                for="containerNetwork"
                class="pt-4 block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
                >Select container networking:</label>
              <div
                class="p-0 flex flex-row justify-start items-center align-middle w-full text-[var(--pd-content-card-text)]">
                <span class="text-sm w-28 inline-block align-middle whitespace-nowrap">Mode:</span>

                <select
                  class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm"
                  name="providerChoice"
                  bind:value={networkingMode}>
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
                  <span
                    class="text-sm w-28 inline-block align-middle whitespace-nowrap text-[var(--pd-content-card-text)]"
                    >Network:</span>
                  <select
                    class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
                    disabled={networkingMode !== 'choice-network'}
                    name="networkingModeUserNetwork"
                    bind:value={networkingModeUserNetwork}>
                    {#each engineNetworks as network}
                      <option value={network.Id}
                        >{network.Name} (used by {Object.keys(network.Containers ?? {}).length} containers)</option>
                    {/each}
                  </select>
                </div>
              {/if}
              {#if networkingMode === 'choice-container'}
                <div class="flex flex-row justify-center items-center w-full py-1">
                  <span
                    class="text-sm w-28 inline-block align-middle whitespace-nowrap text-[var(--pd-content-card-text)]"
                    >Container:</span>
                  <select
                    class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
                    disabled={networkingMode !== 'choice-container'}
                    name="networkingModeUserContainer"
                    bind:value={networkingModeUserContainer}>
                    {#each engineContainers as container}
                      <option value={container.id}>{container.name} ({container.shortId})</option>
                    {/each}
                  </select>
                </div>
              {/if}
            </div>
          </Route>
        </div>

        <div class="pt-2 border-zinc-600 border-t-2"></div>
        <Button
          on:click={() => startContainer()}
          class="w-full"
          icon={faPlay}
          aria-label="Start Container"
          bind:disabled={invalidFields}>
          Start Container
        </Button>
        <div aria-label="createError">
          {#if createError}
            <ErrorMessage class="py-2 text-sm" error={createError} />
          {/if}
        </div>
      </div>
    </EngineFormPage>
  {/if}
</Route>
