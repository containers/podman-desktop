---
sidebar_position: 2
title: In a restricted environment
description: Using Podman Desktop in a restricted environment.
keywords:
  [podman desktop, containers, podman, installing, installation, windows, macos, linux, restricted environment, airgap]
pagination_prev: null
pagination_next: onboarding-for-containers/index
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ProxyWindowsMacosContent from './\_using-a-proxy.md';
import ProxyLinuxContent from './\_using-a-proxy-on-linux.md';
import VPNContent from './\_using-a-vpn.md';

# Using Podman Desktop in a restricted environment

In a restricted environment, such as behind a proxy or a VPN, configure Podman Desktop and Podman to access external resources.

<Tabs groupId="operating-systems" queryString="current-os">

<TabItem value="win" label="Windows">
<Tabs groupId="situation" queryString="current-situation">

<TabItem value="proxy" label="Proxy">
<ProxyWindowsMacosContent />
</TabItem>

<TabItem value="vpn" label="VPN">
<VPNContent />
</TabItem>

</Tabs>
</TabItem>

<TabItem value="mac" label="macOS">
<Tabs groupId="situation" queryString="current-situation">

<TabItem value="proxy" label="Proxy">
<ProxyWindowsMacosContent />
</TabItem>

</Tabs>
</TabItem>

<TabItem value="linux" label="Linux">
<Tabs groupId="situation" queryString="current-situation">

<TabItem value="proxy" label="Proxy">
<ProxyLinuxContent />
</TabItem>

</Tabs>
</TabItem>
</Tabs>
