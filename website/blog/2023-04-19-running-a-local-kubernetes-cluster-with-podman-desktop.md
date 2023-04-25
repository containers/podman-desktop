---
title: Setting up and running a Kubernetes cluster locally with Podman Desktop
description: Setting up and running a Kubernetes cluster locally with Podman Desktop
slug: running-a-local-kubernetes-cluster-with-podman-desktop
authors: [themr0c]
tags: [podman-desktop, story, kubernetes, kind]
hide_table_of_contents: false
---

# Setting up and running a Kubernetes cluster locally with Podman Desktop

In this blog post you will learn to use Podman Desktop to run the [Kubernetes documentation example: Deploying PHP Guestbook application with Redis](https://kubernetes.io/docs/tutorials/stateless-application/guestbook/).

On the agenda:

1. Installing Podman Desktop.
1. Installing and initializing your container engine: Podman.
1. Installing and starting your local Kubernetes provider: Kind.
1. Starting the Redis leader.
1. Starting the Redis followers.
1. Starting the Guestbook frontend.
1. Exposing the Guestbook frontend service.

<!--truncate-->

## Installing Podman Desktop

You need Podman Desktop.

1. Go to [Podman Desktop installation documentation](/docs/Installation).
1. Click on your platform name: [Windows](/docs/installation/windows-install), [macOS](/docs/installation/macos-install), or [Linux](/docs/installation/linux-install).
1. Follow the instructions. Stick to the default installation method.
1. Start **Podman Desktop**

Now you have a graphical user interface to control your container engine.

#### Additional resources

- [Installing Podman Desktop on Windows](/docs/installation/windows-install)
- [Installing Podman Desktop on macOS](/docs/installation/macos-install)
- [Installing Podman Desktop on Linux](/docs/installation/linux-install).

## Installing and initializing your container engine: Podman

You need a container engine.

Podman Desktop can control various container engines, such as:

- Docker
- Lima
- Podman

Consider installing the Podman container engine for:

- Added security
- No daemon
- Open source
- Rootless mode (for macOS and Linux: on Windows, it conflicts with Kind)

On Linux, you can install Podman natively.
See: [Installing Podman on Linux](https://podman.io/getting-started/installation#installing-on-linux).

On macOS and Windows, Podman requires to run in a virtual machine.
Podman Desktop helps you installing Podman and initializing a Podman machine:

1. Open Podman Desktop **Dashboard**
1. The **Dashboard** displays _Podman Desktop was not able to find an installation of Podman_.
1. Click on **Install**.
1. Podman Desktop checks the prerequisites to install Podman Engine. When necessary, follow the instructions to install prerequisites.
1. Podman displays the dialog: _Podman is not installed on this system, would you like to install Podman?_. Click on **Yes** to install Podman.
1. Click on **Initialize Podman**.

Now you can start working with containers.

#### Additional resources

- [Installing Podman on Windows](/docs/Installation/windows-install/installing-podman-with-podman-desktop)
- [Installing Podman on macOS](/docs/installation/macos-install)
- [Installing Podman on Linux](https://podman.io/getting-started/installation#installing-on-linux)

## Installing and starting your local Kubernetes provider: Kind

You want to deploy your application to a local Kubernetes cluster.

Podman Desktop can help you run Kind-powered local Kubernetes clusters on a container engine, such as Podman.

Podman Desktop helps you [installing the `kind` CLI](/docs/kubernetes/kind/installing-kind):

1. In the status bar, click on **Kind**, and follow the prompts.
1. On Windows, [configure Podman in rootless mode](docs/kubernetes/kind/configuring-podman-for-kind-on-windows)

   ```shell-session
   $ podman system connection default podman-machine-default-root
   ```

   When the `kind` CLI is installed, the status bar does not display **Kind**.

1. Go to **Settings > Resources**
1. In the **Kind** tile, click on the **Create new ...** button.
   1. **Name**: type `kind-cluster`.
   1. **Provider Type**: select `podman`.
   1. **HTTP Port**: select `9090`.
   1. **HTTPS Port**: select `9443`.
   1. **Setup an ingress controller**: `Enabled`
   1. Click the **Create** button.
1. After successful creation, click on the **Go back to resources** button
1. In the **Podman Desktop** tray, open the **Kubernetes** menu: you can set the context to your Kind cluster: `kind-kind-cluster`.

Now you can start working with containers, and your local Kubernetes cluster.

#### Additional resources

- [Creating a local Kind-powered Kubernetes cluster](docs/kubernetes/kind/creating-a-kind-cluster)

## Starting the Redis leader

The guestbook application uses Redis to store its data.

With Podman Desktop, you can prepare the Redis leader image and container on your local container engine, and deploy the results to a Kubernetes pod and service.
This is functionally equivalent to the `redis-leader` deployment that the Kubernetes example propose.

#### Procedure

1. Open **<icon icon="fa-solid fa-cloud" size="lg" /> Images > <icon icon="fa-solid fa-arrow-circle-down" size="lg" /> Pull an image**.
   1. **Image to Pull**: type `docker.io/redis:6.0.5`
   1. Click **Pull image** to pull the image to your container engine local image registry.
   1. Click **Done** to get back to the images list.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search images...**: type `redis:6.0.5` to find the image.
1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Kind cluster**.
1. Click **<icon icon="fa-solid fa-play" size="lg" />** to open the **Create a container from image** dialog.
   1. **Container name**: type `leader`,
   1. **Local port for 6379/tcp**: `6379`.
   1. Click **<icon icon="fa-solid fa-play" size="lg" /> Start Container** to start the container in your container engine.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search containers...**: type `leader` to find the running container.
1. Click **<icon icon="fa-solid fa-stop" size="lg" />** to stop the container, and leave the `6379` port available for the Redis follower container.

1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-rocket" size="lg" /> Deploy to Kubernetes** to open the **Deploy generated pod to Kubernetes** screen.
   1. **Pod Name**: type `redis-leader`.
   1. **Use Kubernetes Services**: select **Replace .hostPort exposure on containers by Services. It is the recommended way to expose ports, as a cluster policy might prevent to use hostPort.**
   1. **Kubernetes namespaces**: select `guestbook`.
   1. Click **<icon icon="fa-solid fa-rocket" size="lg" /> Deploy**.
   1. Wait for the pod to reach the state: **Phase: Running**.
   1. Click **Done**.

#### Verification

1. Open **<icon icon="fa-solid fa-cubes" size="lg" /> Pods**
1. The pods list has a running `redis-leader` pod.

## Starting the Redis followers

Although the Redis leader is a single Pod, you can make it highly available and meet traffic demands by adding a few Redis followers, or replicas.

With Podman Desktop, you can prepare the Redis follower image and container on your local container engine, and deploy the results to Kubernetes pods and services.
This is functionally equal to the `redis-follower` deployment that the Kubernetes example propose.

#### Procedure

1. Open **<icon icon="fa-solid fa-cloud" size="lg" /> Images > <icon icon="fa-solid fa-arrow-circle-down" size="lg" /> Pull an image**.
   1. **Image to Pull**: type `gcr.io/google_samples/gb-redis-follower:v2`
   1. Click **Pull image** to pull the image to your container engine local image registry.
   1. Click **Done** to get back to the images list.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search images...**: type `gb-redis-follower:v2` to find the image.

1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Kind cluster**.
1. Click **<icon icon="fa-solid fa-play" size="lg" />** to open the **Create a container from image** dialog.
   1. **Container name**: type `follower`,
   1. **Local port for 6379/tcp**: `6379`.
   1. Click **<icon icon="fa-solid fa-play" size="lg" /> Start Container** to start the container in your container engine.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search containers...**: type `follower` to find the running container.
1. Click **<icon icon="fa-solid fa-stop" size="lg" />** to stop the container: you don't need it to run in the container engine.
1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-rocket" size="lg" /> Deploy to Kubernetes** to open the **Deploy generated pod to Kubernetes** screen.
   1. **Pod Name**: type `redis-follower`.
   1. **Use Kubernetes Services**: select **Replace .hostPort exposure on containers by Services. It is the recommended way to expose ports, as a cluster policy might prevent to use hostPort.**
   1. **Kubernetes namespaces**: select `guestbook`.
   1. Click **<icon icon="fa-solid fa-rocket" size="lg" /> Deploy**.
   1. Wait for the pod to reach the state: **Phase: Running**.
   1. Click **Done**.
1. To add replicas, repeat the last step with another **Pod Name** value.

#### Verification

1. Open **<icon icon="fa-solid fa-cubes" size="lg" /> Pods**
1. The pods list has a running `redis-follower` pod.

#### Known issue

Currently, you need a workaround to increase the replicas with Podman Desktop. The team in working on an impromvement:

- [Create a deployment rather than a pod](https://github.com/containers/podman-desktop/issues/1323)
- [Configure `replicas` count](https://github.com/containers/podman-desktop/issues/2210)

## Starting the Guestbook frontend

Now that you have the Redis storage of your guestbook up and running, start the guestbook web servers.
Like the Redis followers, the frontend is deployed using Kubernetes pods and services.

The guestbook app uses a PHP frontend.
It is configured to communicate with either the Redis follower or leader Services, depending on whether the request is a read or a write.
The frontend exposes a JSON interface, and serves a jQuery-Ajax-based UX.

With Podman Desktop, you can prepare the Guestbook frontend image and container on your local container engine, and deploy the results to Kubernetes pods and services.
This is functionally equal to the `frontend` deployment that the Kubernetes example propose.

#### Procedure

1. Open **<icon icon="fa-solid fa-cloud" size="lg" /> Images > <icon icon="fa-solid fa-arrow-circle-down" size="lg" /> Pull an image**.
   1. **Image to Pull**: type `gcr.io/google_samples/gb-frontend:v5`
   1. Click **Pull image** to pull the image to your container engine local image registry.
   1. Wait for the pull to complete.
   1. Click **Done** to get back to the images list.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search images**: type `gb-frontend:v5` to find the image.

1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-ellipsis-v" size="lg" /> Push image to Kind cluster**.
1. Click **<icon icon="fa-solid fa-play" size="lg" />** to open the **Create a container from image** dialog.
   1. **Container name**: type `frontend`,
   1. **Local port for `80/tcp`**: `9000`.
   1. Click **<icon icon="fa-solid fa-play" size="lg" /> Start Container** to start the container in your container engine.
1. **<icon icon="fa-solid fa-cloud" size="lg" /> Search containers**: type `frontend` to find the running container.
1. Click **<icon icon="fa-solid fa-stop" size="lg" />** to stop the container: you don't need it to run in the container engine.
1. Click **<icon icon="fa-solid fa-ellipsis-v" size="lg" /> > <icon icon="fa-solid fa-rocket" size="lg" /> Deploy to Kubernetes** to open the **Deploy generated pod to Kubernetes** screen.
   1. **Pod Name**: type `frontend`.
   1. **Use Kubernetes Services**: select **Replace .hostPort exposure on containers by Services. It is the recommended way to expose ports, as a cluster policy might prevent to use hostPort.**
   1. **Kubernetes namespaces**: select `default`.
   1. Click **<icon icon="fa-solid fa-rocket" size="lg" /> Deploy**.
   1. Wait for the pod to reach the state: **Phase: Running**.
   1. Click **Done**.

#### Verification

1. Open **<icon icon="fa-solid fa-cubes" size="lg" /> Pods**
1. The pods list has a running `frontend` pod.

## Exposing the Guestbook frontend service

Podman Desktop installs Kind with the Contour Ingress controller.
Use Ingress to expose the Guestbook frontend.

#### Procedure

1. Create a `frontend-ingress.yaml` file:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: frontend-ingress
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     rules:
       - http:
           paths:
             - pathType: Prefix
               path: /
               backend:
                 service:
                   name: frontend-9000
                   port:
                     number: 9000
   ```

1. Deploy the Ingress:

   ```shell-session
   $ kubectl apply -f frontend-ingress.yaml
   ```

#### Verification

1. Go to `http://localhost`
1. The Guestbook application is running
