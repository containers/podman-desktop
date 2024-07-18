<script lang="ts">
import { faExternalLink, faRocket } from '@fortawesome/free-solid-svg-icons';
import type { V1NamespaceList, V1Pod } from '@kubernetes/client-node/dist/api';
import { Button, Checkbox, ErrorMessage, Input, Link } from '@podman-desktop/ui-svelte';
import * as jsYaml from 'js-yaml';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';

import { ensureRestrictedSecurityContext } from '/@/lib/pod/pod-utils';
import type { V1Route } from '/@api/openshift-types';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import EngineFormPage from '../ui/EngineFormPage.svelte';
import WarningMessage from '../ui/WarningMessage.svelte';

export let resourceId: string;
export let engineId: string;
export let type: string;

let kubeDetails: string;

let defaultContextName: string | undefined;
let currentNamespace: string;
let allNamespaces: V1NamespaceList;
let deployStarted = false;
let deployFinished = false;
let deployError = '';
let deployWarning = '';
let updatePodInterval: NodeJS.Timeout;
let openshiftConsoleURL: string | undefined;
let openshiftRouteGroupSupported = false;

let deployUsingServices = true;
let deployUsingRoutes = true;
let deployUsingRestrictedSecurityContext = false;
let createdPod: V1Pod | undefined = undefined;
let bodyPod: any;

let createIngress = false;
let ingressPort: number;
let containerPortArray: string[] = [];

let createdRoutes: V1Route[] = [];

onMount(async () => {
  // If type = compose
  // we will grab the containers by using the label com.docker.compose.project that matches the resourceId
  // we can then pass the array of containers to generatePodmanKube rather than the singular pod id
  if (type === 'compose') {
    const containers = await window.listSimpleContainersByLabel('com.docker.compose.project', resourceId);
    const containerIds = containers.map(container => container.Id);
    kubeDetails = await window.generatePodmanKube(engineId, containerIds);
  } else {
    kubeDetails = await window.generatePodmanKube(engineId, [resourceId]);
  }

  // parse yaml
  bodyPod = jsYaml.load(kubeDetails) as any;

  // grab default context
  defaultContextName = await window.kubernetesGetCurrentContextName();

  // grab current namespace
  const grabCurrentNamespace = await window.kubernetesGetCurrentNamespace();

  // check that the variable is set to a value, otherwise set to default namespace
  if (!grabCurrentNamespace) {
    currentNamespace = 'default';
  } else {
    currentNamespace = grabCurrentNamespace;
  }
  // check that the variable is set to a value, otherwise set to default namespace
  if (!currentNamespace) {
    currentNamespace = 'default';
  }

  // grab all the namespaces (will be useful to provide a drop-down to select the namespace)
  try {
    allNamespaces = await window.kubernetesListNamespaces();
  } catch (error) {
    console.debug('Not able to list all namespaces, probably a permission error', error);
  }

  // check if there is OpenShift and then grab openshift console URL
  try {
    openshiftRouteGroupSupported = await window.kubernetesIsAPIGroupSupported('route.openshift.io');
    const openshiftConfigMap = await window.kubernetesReadNamespacedConfigMap(
      'console-public',
      'openshift-config-managed',
    );
    openshiftConsoleURL = openshiftConfigMap?.data?.consoleURL;
  } catch (error) {
    // probably not OpenShift cluster, ignoring
    console.debug('Probably not an OpenShift cluster, so ignoring the error to grab console link', error);
  }

  // Go through bodyPod.spec.containers and create a string array of port that we'll be exposing
  bodyPod.spec.containers.forEach((container: any) => {
    container.ports?.forEach((port: any) => {
      containerPortArray.push(port.hostPort);
    });
    container.imagePullPolicy = 'IfNotPresent';
  });
});

function openOpenshiftConsole() {
  // build link to openOpenshiftConsole
  if (createdPod?.metadata?.name) {
    const linkToOpen = `${openshiftConsoleURL}/k8s/ns/${currentNamespace}/pods/${createdPod.metadata.name}`;
    window.openExternal(linkToOpen);
  }
}

async function updatePod() {
  if (!createdPod?.metadata?.name || !createdPod?.metadata?.namespace) {
    return;
  }
  const updatedPod = await window.kubernetesReadNamespacedPod(createdPod.metadata.name, createdPod.metadata.namespace);
  createdPod = updatedPod;
  // stop to monitor once it is running
  if (createdPod?.status?.phase === 'Running') {
    clearInterval(updatePodInterval);
    deployFinished = true;
    window.telemetryTrack('deployToKube.running', {
      useServices: deployUsingServices,
      useRoutes: deployUsingRoutes,
    });
  }
}

onDestroy(() => {
  // reset any timeout
  clearInterval(updatePodInterval);
});

function goBackToHistory(): void {
  window.history.go(-1);
}

function openPodDetails(): void {
  if (!createdPod?.metadata?.name || !defaultContextName) {
    return;
  }
  router.goto(
    `/pods/kubernetes/${encodeURIComponent(createdPod.metadata.name)}/${encodeURIComponent(defaultContextName)}/logs`,
  );
}

function openRoute(route: V1Route) {
  window.openExternal(`https://${route.spec.host}`);
}

async function deployToKube() {
  deployStarted = true;
  deployFinished = false;
  deployError = '';
  deployWarning = '';
  createdPod = undefined;
  // reset any timeout
  clearInterval(updatePodInterval);

  createdRoutes = [];
  let servicesToCreate: any[] = [];
  let routesToCreate: any[] = [];
  let ingressesToCreate: any[] = [];

  // if we deploy using services, we need to get rid of .hostPort and generate kubernetes services object
  if (deployUsingServices) {
    // collect all ports
    bodyPod.spec?.containers?.forEach((container: any) => {
      container?.ports?.forEach((port: any) => {
        let portName = `${bodyPod.metadata.name}-${port.hostPort}`;
        if (port.hostPort) {
          // create service
          const service = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
              name: portName,
              namespace: currentNamespace,
            },
            spec: {
              ports: [
                {
                  name: portName,
                  port: port.hostPort,
                  protocol: port.protocol || 'TCP',
                  targetPort: port.containerPort,
                },
              ],
              selector: {
                app: bodyPod.metadata.name,
              },
            },
          };
          servicesToCreate.push(service);

          if (openshiftRouteGroupSupported && deployUsingRoutes) {
            // Create OpenShift route object
            const route = {
              apiVersion: 'route.openshift.io/v1',
              kind: 'Route',
              metadata: {
                name: `${bodyPod.metadata.name}-${port.hostPort}`,
                namespace: currentNamespace,
              },
              spec: {
                port: {
                  targetPort: port.containerPort,
                },
                to: {
                  kind: 'Service',
                  name: `${bodyPod.metadata.name}-${port.hostPort}`,
                },
                tls: {
                  termination: 'edge',
                },
              },
            };
            routesToCreate.push(route);
          }
        }
      });
    });
  }

  // Check if we are deploying an ingress, if so, we need to create an ingress object using ingressPath and ingressDomain.
  if (createIngress) {
    let serviceName = '';
    let servicePort = 0;

    // Check that there are services (servicesToCreate), if there aren't. Warn that we can't create an ingress.
    // All services are always created with one port (the first one), so we can use that port to create the ingress.
    // Must be a number
    if (servicesToCreate.length === 0) {
      deployWarning = `In order to create an Ingress a Pod must have a Service associated to a port mapping. Check that your container(s) has a port exposed correctly in order to generate a Service.`;
      deployStarted = false;
      return;
    } else if (servicesToCreate.length === 1) {
      serviceName = servicesToCreate[0].metadata.name;
      servicePort = servicesToCreate[0].spec.ports[0].port;
    } else if (servicesToCreate.length > 1) {
      // If there was more than one service being created, the user would of had a dialog to pick which port to use
      // warn out if the user did not pick anything (we do not do form validation for this as we're using svelte for the form)
      if (!ingressPort) {
        deployWarning = 'You need to specify a port to create an ingress.';
        deployStarted = false;
        return;
      }
      const matchingService = servicesToCreate.find(service => service.spec.ports[0].port === ingressPort);
      if (matchingService) {
        serviceName = matchingService.metadata.name;
        servicePort = matchingService.spec.ports[0].port;
      } else {
        deployError = 'Unable to find the service that matches the port you want to expose.';
        return;
      }
    }

    const ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: bodyPod.metadata.name,
        namespace: currentNamespace,
      },
      spec: {
        defaultBackend: {
          service: {
            name: serviceName,
            port: {
              number: servicePort,
            },
          },
        },
      },
    };

    // Support for multiple ingress creation in the future
    ingressesToCreate.push(ingress);
  }

  // https://github.com/kubernetes-client/javascript/issues/487
  if (bodyPod?.metadata?.creationTimestamp) {
    bodyPod.metadata.creationTimestamp = new Date(bodyPod.metadata.creationTimestamp);
  }

  const eventProperties: any = {
    useServices: deployUsingServices,
    useRoutes: deployUsingRoutes,
    createIngress: createIngress,
  };
  if (openshiftRouteGroupSupported) {
    eventProperties['isOpenshift'] = true;
  }

  let previousPod = bodyPod;

  try {
    // In order to deploy to Kubernetes, we must remove volumes for the pod as we do not support them
    // if we are deploying using services, remove the hostPort as well as volumeMounts from the container
    if (bodyPod?.spec?.volumes) {
      delete bodyPod.spec.volumes;
    }

    if (deployUsingServices) {
      bodyPod.spec?.containers?.forEach((container: any) => {
        // UNUSED
        // Delete all volume mounts
        if (container.volumeMounts) {
          delete container.volumeMounts;
        }

        // UNUSED
        // Delete all hostPorts
        if (container.ports) {
          container.ports.forEach((port: any) => {
            delete port.hostPort;
          });
        }
      });
    }

    if (deployUsingRestrictedSecurityContext) {
      ensureRestrictedSecurityContext(bodyPod);
    }

    // create pod
    createdPod = await window.kubernetesCreatePod(currentNamespace, bodyPod);

    // create services
    for (const service of servicesToCreate) {
      await window.kubernetesCreateService(currentNamespace, service);
    }

    // Create routes
    for (const route of routesToCreate) {
      const createdRoute = await window.openshiftCreateRoute(currentNamespace, route);
      createdRoutes = [...createdRoutes, createdRoute];
    }

    // Create ingresses
    for (const ingress of ingressesToCreate) {
      await window.kubernetesCreateIngress(currentNamespace, ingress);
    }

    // Telemetry
    window.telemetryTrack('deployToKube', eventProperties);

    // update status
    updatePodInterval = setInterval(() => {
      updatePod();
    }, 2000);
  } catch (error: any) {
    // Revert back to the previous bodyPod so the user can hit deploy again
    // we only update the bodyPod if we successfully create the pod.
    bodyPod = previousPod;
    window.telemetryTrack('deployToKube', { ...eventProperties, errorMessage: error.message });
    deployError = error;
    deployStarted = false;
    deployFinished = false;
    return;
  }
}

$: bodyPod && updateKubeResult();

// Update bodyPod.metadata.labels.app to be the same as bodyPod.metadata.name
// If statement required as bodyPod.metadata is undefined when bodyPod is undefined
$: {
  if (bodyPod?.metadata?.labels) {
    bodyPod.metadata.labels.app = bodyPod.metadata.name;
  }
}

function updateKubeResult() {
  kubeDetails = jsYaml.dump(bodyPod, { noArrayIndent: true, quotingType: '"', lineWidth: -1 });
}
</script>

<EngineFormPage title="Deploy generated pod to Kubernetes" inProgress={deployStarted && !deployFinished}>
  <i class="fas fa-rocket fa-2x" slot="icon" aria-hidden="true"></i>

  <div slot="content" class="space-y-2">
    {#if kubeDetails}
      <p>Generated Kubernetes YAML:</p>
      <div class="h-48 pt-2">
        <MonacoEditor content={kubeDetails} language="yaml" />
      </div>
    {/if}

    {#if bodyPod}
      <div class="pt-2 pb-4">
        <label for="contextToUse" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Pod Name:</label>
        <Input bind:value={bodyPod.metadata.name} name="podName" id="podName" class="w-full" required />
      </div>
    {/if}

    <div class="pt-2 pb-4">
      <label for="services" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
        >Kubernetes Services:</label>
      <Checkbox
        bind:checked={deployUsingServices}
        class="text-[var(--pd-content-card-text)] text-sm ml-1"
        name="useServices"
        id="useServices"
        required>
        Replace .hostPort exposure on containers by Services. It is the recommended way to expose ports, as a cluster
        policy may prevent to use hostPort.</Checkbox>
    </div>

    <div class="pt-2 pb-4">
      <label for="useRestricted" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
        >Restricted Security Context:</label>
      <Checkbox
        bind:checked={deployUsingRestrictedSecurityContext}
        class="text-[var(--pd-content-card-text)] text-sm ml-1"
        name="useRestricted"
        id="useRestricted"
        title="Use restricted security context"
        required>
        Update Kubernetes manifest to respect the Pod security <Link
          on:click={() =>
            window.openExternal('https://kubernetes.io/docs/concepts/security/pod-security-standards#restricted')}
          >restricted profile</Link
        >.</Checkbox>
    </div>

    <!-- Only show for non-OpenShift deployments (we use routes for OpenShift) -->
    {#if !openshiftRouteGroupSupported && deployUsingServices}
      <div class="pt-2 pb-4">
        <label for="createIngress" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Expose Service Locally Using Kubernetes Ingress:</label>
        <Checkbox
          bind:checked={createIngress}
          class="text-[var(--pd-content-card-text)] text-sm ml-1"
          name="createIngress"
          id="createIngress"
          title="Create Ingress"
          required>
          Create an Ingress to get access to the local ports exposed, at the default Ingress Controller location.
          Example: On default kind cluster created with Podman Desktop, it will be accessible at 'localhost:9090'.
          Requirements: Your cluster must have an Ingress Controller.</Checkbox>
      </div>
    {/if}

    {#if createIngress && containerPortArray.length > 1}
      <div class="pt-2 pb-4">
        <label for="ingress" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Ingress Host Port:</label>
        <select
          bind:value={ingressPort}
          name="serviceName"
          id="serviceName"
          class=" cursor-default w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
          required>
          <option value="" disabled selected>Select a port</option>
          {#each containerPortArray as port}
            <option value={port}>{port}</option>
          {/each}
        </select>
        <span class="text-[var(--pd-content-card-text)] text-sm ml-1"
          >There are multiple exposed ports available. Select the one you want to expose to '/' with the Ingress.
        </span>
      </div>
    {/if}

    <!-- Allow to create routes for OpenShift clusters -->
    {#if openshiftRouteGroupSupported}
      <div class="pt-2">
        <label for="routes" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Create OpenShift routes:</label>
        <Checkbox
          bind:checked={deployUsingRoutes}
          class="text-[var(--pd-content-card-text)] text-sm ml-1"
          name="useRoutes"
          id="useRoutes"
          required>
          Create OpenShift routes to get access to the exposed ports of this pod.</Checkbox>
      </div>
    {/if}

    {#if defaultContextName}
      <div class="pt-2">
        <label for="contextToUse" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Kubernetes Context:</label>
        <Input
          bind:value={defaultContextName}
          name="defaultContextName"
          id="defaultContextName"
          readonly
          class="w-full"
          required />
      </div>
    {/if}

    {#if allNamespaces}
      <div class="pt-2">
        <label for="namespaceToUse" class="block mb-1 text-sm font-medium text-[var(--pd-content-card-header-text)]"
          >Kubernetes Namespace:</label>
        <select
          class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
          name="namespaceChoice"
          bind:value={currentNamespace}>
          {#each allNamespaces.items as namespace}
            <option value={namespace.metadata?.name}>
              {namespace.metadata?.name}
            </option>
          {/each}
        </select>
      </div>
    {/if}

    {#if deployWarning}
      <WarningMessage class="text-sm" error={deployWarning} />
    {/if}
    {#if deployError}
      <ErrorMessage class="text-sm" error={deployError} />
    {/if}

    {#if !deployStarted}
      <div class="pt-4">
        <Button
          on:click={() => deployToKube()}
          class="w-full"
          icon={faRocket}
          disabled={bodyPod?.metadata?.name === ''}>
          Deploy
        </Button>
      </div>
    {/if}

    {#if createdPod}
      <div class="bg-charcoal-800 p-5 my-4">
        <div class="flex flex-row items-center">
          <div>Created pod:</div>
          {#if openshiftConsoleURL && createdPod?.metadata?.name}
            <div class="justify-end flex flex-1">
              <Link class="text-sm" icon={faExternalLink} on:click={() => openOpenshiftConsole()}
                >Open in OpenShift console</Link>
            </div>
          {/if}
        </div>
        <div class="text-[var(--pd-content-card-text)]">
          {#if createdPod.metadata?.name}
            <p class="pt-2">Name: {createdPod.metadata.name}</p>
          {/if}
          {#if createdPod.status?.phase}
            <p class="pt-2">Phase: {createdPod.status.phase}</p>
          {/if}

          {#if createdPod.status?.containerStatuses}
            <p class="pt-2">Container statuses:</p>
            <ul class="list-disc list-inside">
              {#each createdPod.status.containerStatuses as containerStatus}
                <li class="pt-2">
                  {containerStatus.name}
                  {#if containerStatus.ready}
                    <span class="text-[var(--pd-status-ready)]">Ready</span>
                  {/if}
                  {#if containerStatus.state?.running}
                    <span class="text-[var(--pd-status-running)]">(Running)</span>
                  {/if}
                  {#if containerStatus.state?.terminated}
                    <span class="text-[var(--pd-status-terminated)]">(Terminated)</span>
                  {/if}
                  {#if containerStatus.state?.waiting}
                    <span class="text-[var(--pd-status-waiting)]">(Waiting)</span>
                    {#if containerStatus.state.waiting.reason}
                      <span class="text-[var(--pd-status-waiting)]">[{containerStatus.state.waiting.reason}]</span>
                    {/if}
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
          {#if createdRoutes && createdRoutes.length > 0}
            <p class="pt-2">Endpoints:</p>
            <ul class="list-disc list-inside">
              {#each createdRoutes as createdRoute}
                <li class="pt-2">
                  Port {createdRoute.spec.port?.targetPort} is reachable with route
                  <Link on:click={() => openRoute(createdRoute)}>{createdRoute.metadata.name}</Link>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <!-- add editor for the result-->
        <div class="h-[100px] pt-2">
          <MonacoEditor content={jsYaml.dump(createdPod)} language="yaml" />
        </div>
      </div>
    {/if}

    {#if deployFinished}
      <div class="pt-4 flex flex-row space-x-2 justify-end">
        <Button on:click={() => goBackToHistory()}>Done</Button>
        <Button on:click={() => openPodDetails()} disabled={!createdPod?.metadata?.name || !defaultContextName}
          >Open Pod</Button>
      </div>
    {/if}
  </div>
</EngineFormPage>
