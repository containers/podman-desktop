---
title: Share your local podman images with the Kubernetes cluster
description: Build image and use it directly in your kubernetes cluster
slug: sharing-podman-images-with-kubernetes-cluster
authors: [benoitf]
tags: [podman-desktop, podman, images, kubernetes]
hide_table_of_contents: false
image: /blog/img/sharing-podman-images-with-kubernetes-cluster/selkie-family.png
---

As developers we constantly improve and refine our applications. One of the challenges we face is quickly iterating when working with container images and kubernetes deployments/pods.

For example, when we want to try a new image in a kubernetes pod, this image needs to be available on a private/public registry or on the kubernetes cluster.
Sometimes we need to call extra commands such as `kind load docker-image` or `minikube cache add <image>` or publish the image first to a 3rd party registry.

You'll agree that trying out a new image in a Kubernetes pod should be as seamless as building the image itself.

In this blog post, we will explore the best practice for streamlining the image iteration process in Kubernetes with Podman Desktop.

![hero](img/sharing-podman-images-with-kubernetes-cluster/selkie-family.png)

<!--truncate-->

---

## Introduction

When using kind or minikube or other 3rd party tools to setup a local kubernetes cluster, we have several ways to publish images.

Minikube is publishing 8 ways of doing that at https://minikube.sigs.k8s.io/docs/handbook/pushing/

There are pros and cons either way. Starting a registry requires publishing your image each time you want to build. Podman Desktop could automate the synchronization but there is still a duplication of layers.

Loading images requires to pack/unpack the files so it's not adequate for large images.

Minikube offers a podman environment but it's a version 3.4 running inside a container inside the podman machine (it means that there are two podman instances).

This 3.4 version is very old and do not provide new enhancements and support towards compose, compliance with Docker REST API and 3rd party tools.

Could we just build the image and use that image in kubernetes ?

## podman and kubernetes/cri-o

In the kubernetes world, we need a container engine runtime. At the early stage, container runtimes were integrated with ad hoc solutions on top of docker, rkt, or others.

But to separate concerns and to be extensible, a new interface was added: CRI for "Container Runtime Interface". Using the CRI interface we can plug container engines. And there are several runtimes such as containerd, cri-o and others.
https://github.com/kubernetes/community/blob/master/contributors/devel/sig-node/container-runtime-interface.md

What is interesting to us is the cri-o project. This project is implementing the CRI interface but also adopting some projects of the containers https://github.com/containers organization where [podman](https://github.com/containers/podman) and [podman-desktop](https://github.com/containers/podman-desktop) live.

So it means cri-o uses image management from https://github.com/containers/image project and handle storage with https://github.com/containers/storage project.

And this is what is really interesting as a podman user. As it is using common libraries between cri-o and podman, it means that in the same environment, podman and cri-o read and write the images at a common location in `/var/lib/containers` folder.

If we move one step ahead, if we mount the `/var/lib/containers` folder of podman into the cri-o container it means that the kubernetes cluster could find the images that the podman machine is building.

Oh wait, it means that no more registry, additional steps would be required ? just build it and load it.

## Minikube to the rescue

While we have the goal of using both cri-o and podman altogether, we can explore the current projects allowing us to quickly setup kubernetes clusters.

### kind

On the `kind` side, there is a default configuration that is using containerd and there is no plan to support an alternative such as cri-o https://github.com/kubernetes-sigs/kind/issues/1369#issuecomment-867440704

That said, some people try to maintain a way to do that but not officialy https://gist.github.com/aojea/bd1fb766302779b77b8f68fa0a81c0f2

By doing that, we would also need to mount `/var/lib/containers` folder from the host (the podman machine) to the container. And there is no easy flag in kind.

### Minikube

#### Minikube options

Minikube supports more options and provides a way to select the container engine runtime. And it includes support for cri-o.

We can use the `container-runtime` parameter and ask for `cri-o` runtime. Command-line should include `--container-runtime=cri-o`.

Then, we do have a podman/cri-o environment inside the container and can use `eval $(minikube podman-env)` to use on the Windows/macOS podman CLI.

One issue is that we have then two 'podman engine', one which is running inside the podman machine and another one running inside the container. And the podman included in the container is using version 3.4 as it's on Debian/Ubuntu stable while recent version of podman is 4.7.x.

Can we mount the podman machine `/var/lib/containers` into the container ?

yes ! minikube provides some options to do additional mount with `--mount-string` argument. It is not obvious but you also need to add the `--mount` in addition to this parameter. Full argument is `--mount --mount-string "<host-path:container-path>"`

But `/var` is already a mounted folder. So here the idea is to change the path of where cri-o is storing its data.

So we can provide a custom mounted path and cri-o use that custom location. Let's pickup `/host-containers`.

When starting minikube we need then to add `--mount --mount-string "/var/lib/containers:/host-containers"`.

How to configure cri-o. For now it's not possible using minikube options. But minikube allows you to change the base image.

#### Minikube kicbase image

Let's do our own base image named kicbase image.

Minikube includes a default configuration file for cri-o.
https://github.com/kubernetes/minikube/blob/0b29983f4bdc1ad55180ee43e3f34cae6c24dee4/deploy/kicbase/02-crio.conf

We need to change this default configuration to say that for storing the images, cri-o needs to use another directory. This new directory `/host-containers` will be mounted from the `/var/lib/containers` folder inside the podman machine. This is how cri-o is able to see podman images.

Let's include the configuration part in this file.

```toml
[crio]
root = "/host-containers/storage"
runroot = "/host-containers/storage"
```

Let's upgrade as well podman that is inside the container adding the instruction in the Dockerfile.

The Dockerfile is coming from https://github.com/kubernetes/minikube/blob/v1.32.0/deploy/kicbase/Dockerfile#L178-L186

instead of

```Dockerfile
RUN clean-install podman && \
```

we do:

```Dockerfile
RUN sh -c "echo 'deb https://downloadcontent.opensuse.org/repositories/devel:/kubic:/libcontainers:/unstable/xUbuntu_22.04/ /' > /etc/apt/sources.list.d/devel:kubic:libcontainers:unstable.list" && \
    curl -LO https://downloadcontent.opensuse.org/repositories/devel:kubic:libcontainers:unstable/xUbuntu_22.04/Release.key && \
    apt-key add - < Release.key && \
    # need to add dbus-user-session else we have
    # cannot open sd-bus: No such file or directory: OCI runtime attempted to invoke a command that was not found
    clean-install dbus-user-session podman && \
```

Let's rebuild the image and publish them. It has been published on `quay.io/fbenoit/kicbase:multiarch-2023-11-06` .

#### Trying out cri-o using the podman machine storage folder

At the time of the blog post, the version `v1.32.0-beta.0` has been used. For different versions you might need to build your own kicbase image.

One last thing: as cri-o is running in root mode, this is why we mount to /var/lib/containers (and then in rootful mode).

For simplicity, let's use a rootful podman machine to map the same folder at the two locations.

Ok now let's try in two steps:

1. Create a podman machine:

```shell
podman machine init --cpus 4 --memory 6000 --rootful
```

2. Start the cluster using our kicbase image

We specify podman as the driver (default is docker), says that we want to use cri-o as container runtime instead of containerd, use our custom image that do the change of podman's version and the update of cri-o configuration to use another storage folder and then specify an additional mount.

```shell
minikube start --driver=podman --container-runtime=cri-o --base-image=quay.io/fbenoit/kicbase:multiarch-2023-11-06 --mount --mount-string "/var/lib/containers:/host-containers"
```

#### Verification

Assuming the cluster was able to start, there is a new kubernetes cluster configured in the `$HOME/.kube/config` file.

Using `kubectl` we can start a deployment

```shell
kubectl apply -f https://k8s.io/examples/application/deployment.yaml
```

you can check pods are running using

```shell
kubectl get pods -l app=nginx
```

and if you check your podman images

```
podman images
```

you'll see nginx being listed so images are shared.

Now, you can build image using a Containerfile or pull an image, connect to the control plane instance in Podman Desktop (open a shell in minikube container) and run

```shell
crictl images
```

It will list the images of podman

Note: by default, kubernetes will use the image pull policy `Always` using the `latest` tag on your image. So it might try to fetch/pull/refresh the image you built locally. Use a specific tag or change the `imagePullPolicy` to `IfNotPresent` in your deployments.

### Conclusion

We have explored how developers can significantly reduce turnaround times by integrating Podman and Kubernetes seamlessly.

Now, let experiment it and provide a feedback through the podman desktop issue tracker at https://github.com/containers/podman-desktop/issues/ .

Here are the next steps Podman Desktop plans to take to enhance ease of use for users:

- To make things easier, automate the process by adding this setup to a creation wizard.
- Collaborate with upstream Minikube project to simplify choices and remove the requirement for customized kicbase images.
- Enhancing the overall user-friendliness of the solution for an improved developer experience.
