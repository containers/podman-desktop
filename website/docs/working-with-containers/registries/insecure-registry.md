---
sidebar_position: 10
title: Adding an insecure registry
description: Modifying Podman for an insecure registry
keywords: [podman desktop, podman, containers, registry, podman machine]
tags: [pods]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import WindowsMacosProcedure from './\_insecure-registry-windows-macos.md'
import LinuxProcedure from './\_insecure-registry-linux.md'
import Verification from './\_verification-private-registry.md'

# Adding an Insecure Registry to Podman Desktop

In this guide, you will learn how to add an insecure registry to Podman Desktop. An insecure registry allows you to pull and push container images either over an unencrypted HTTP connection, or a HTTPS connection with a self-signed unverified certificate. Please note that using an insecure registry can expose your data to security risks, so it's recommended to use secure connections with a verifiable certificate whenever possible.

<Tabs groupId="operating-systems">
<TabItem value="win" label="Windows">

<WindowsMacosProcedure />

</TabItem>
<TabItem value="mac" label="macOS">

<WindowsMacosProcedure />

</TabItem>
<TabItem value="linux" label="Linux">

<LinuxProcedure />

</TabItem>
</Tabs>

<Verification />
