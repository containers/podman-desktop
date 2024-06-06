---
title: Configuration
description: Podman Desktop configuration reference
tags: [podman-desktop, extension]
keywords: [podman desktop, extension]
---

# Commands

## Configuration details

This section details the configurable settings introduced by the extension to enhance or modify its behavior. The settings allow users to customize aspects of the extension's functionality. For example a modified path to a binary, or a performance setting.

### `package.json` Example

This example illustrates how configuration settings are structured within `package.json` for the extension. It includes various settings related to the environment and hardware resources that the extension will manage or monitor.

```json
{
  "contributes": {
    "configuration": {
      "title": "Podman",
      "properties": {
        "podman.binary.path": {
          "type": "string",
          "format": "file",
          "default": "",
          "description": "Custom path to Podman binary (Default is blank)"
        },
        "podman.machine.cpus": {
          "type": "number",
          "format": "cpu",
          "minimum": 1,
          "default": "HOST_HALF_CPU_CORES",
          "maximum": "HOST_TOTAL_CPU",
          "scope": "ContainerConnection",
          "description": "CPU(s)"
        }
      }
    }
  }
}
```

And within the TypeScript code, you can retrieve as well as use the configurations as so:

```typescript
// Get configuration for this connection
const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);

// Set a value
await containerConfiguration.update('machine.cpus', machineInfo.cpus);

// Get a value
await containerConfiguration.get('machine.cpus');

// Has a value
await containerConfiguration.has('machine.cpus');
```

### JSON Schema

Within the schema, you may add any type of value such as `"foo":"bar"` which can be retrieved similar to the above TypeScript example.

```json
{
  "contributes": {
    "configuration": {
      "title": "string",
      "properties": {
        "string": {
          "type": "string",
          "default": "integer if type is integer, string if type is string, etc.",
          "format": "string",
          "minimum": "string or int",
          "maximum": "string or int",
          "description": "string",
          "scope": "string or array, ex. ['DEFAULT', 'ONBOARDING']",
          "hidden": "boolean",
          "placeholder": "string",
          "markdownDescription": "string",
          "readonly": "boolean",
          "enum": "array",
          "step": "number",
          "when": "string"
        }
      }
    }
  }
}
```

### Verification

To verify that your commands are working as expected:

1. Adjust the configuration settings within package.json
2. Restart the extension or Podman Desktop
3. Verify the change within the Settings page.
