---
title: Commands
description: Podman Desktop command reference
tags: [podman-desktop, extension]
keywords: [podman desktop, extension]
---

# Commands

## Configuration details

This section describes new commands added to the extension, which enable enhanced interaction and automation within the development environment. These commands can be used programmatically through the API.

### `package.json` Example

This example shows how new commands are added to `package.json`, enabling them for use within the extension. Each command is defined with a unique identifier and a descriptive title that appears in the command palette.

```json
{
  "contributes": {
    "commands": [
      {
        "command": "extension.exampleCommand",
        "title": "Extension: Example Command"
      },
      {
        "command": "extension.anotherCommand",
        "title": "Extension: Another Command"
      }
    ]
  }
}
```

And within the TypeScript code, you can use the commands like so:

```typescript
const exampleCommand = extensionApi.commands.registerCommand('extension.exampleCommand', async () => {
  // Implementation logic here
  console.log('Executing Example Command');
});

const anotherCommand = extensionApi.commands.registerCommand('extension.anotherCommand', () => {
  // Synchronous logic can be used if async processing is not required
  console.log('Another Command Executed');
});
```

### JSON Schema

```json
{
  "contributes": {
    "commands": [
      {
        "command": "string",
        "title": "string",
        "category": "string (optional cateogry for prefix title)",
        "enablement": "myProperty === myValue"
      }
    ]
  }
}
```

### Additional Resources

When you add the command, it will be listed on the command palette. See the [command palette](/docs/extensions/developing/command-palette) for more information.

### Verification

To verify that your commands are working as expected:

1. Install the extension in your development environment.
2. Add a command to `package.json`.
3. Execute the commands and check for the expected outputs / logging.
