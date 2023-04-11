---
sidebar_position: 7
title: Restarting your Kind cluster
description: Restarting your local Kind-powered Kubernetes cluster.
keywords: [podman desktop, podman, containers, migrating, kubernetes, kind]
tags: [migrating-to-kubernetes, kind]
---

# Restarting your local Kind-powered Kubernetes cluster 

Kind has no command to restart a cluster.

#### Workaround

* Consider replacing Kind with a local Kubernetes cluster that you can restart, such as [OpenShift Local](https://developers.redhat.com/products/openshift-local/).
* Consider [deleting your Kind cluster](deleting-your-kind-cluster), and [creating a Kind cluster](creating-a-kind-cluster).
