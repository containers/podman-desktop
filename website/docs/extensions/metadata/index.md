---
sidebar_position: 1
title: Metadata 
description: Writing my first extension
tags: [podman-desktop, extension, writing]
keywords: [podman desktop, extension, writing]
---

# Initializing a Podman Desktop extension

Write the Podman Desktop extension Node.js package metadata.

#### Prerequisites

* JavaScript or TypeScript 

#### Procedure

1. Create and edit a `package.json` file.

   ```json
   {
   }
   ```

1. Add TypeScript and Podman Desktop API to the development dependencies:

   ```json lines
    "devDependencies": {
      "@podman-desktop/api": "latest",
      "typescript": "latest"
    },
   ```

1. Add the required metadata:

   ```json lines
     "name": "my-extension",
     "displayName": "My Hello World extension",
     "description": "How to write my first extension",
     "version": "0.0.1",
     "icon": "icon.png",
     "publisher": "benoitf",
   ```

1. Add the Podman Desktop version that might run this extension:

   ```json lines
     "engines": {
       "podman-desktop": "latest"
     },
   ```

1. Add the main entry point:

   ```json lines
    "main": "./dist/extension.js"
   ```

1. Add a Hello World command contribution

   ```json lines
     "contributes": {
       "commands": [
        {
          "command": "my.first.command",
          "title": "My First Extension: Hello World"
        }
      ]
     }
   ```

1. Add an `icon.png` file to the project.

#### Verification

* Full `package.json` example:

   ```json
   {
     "devDependencies": {
       "@podman-desktop/api": "latest",
       "typescript": "latest"
     },
     "name": "my-extension",
     "displayName": "My Hello World extension",
     "description": "How to write my first extension",
     "version": "0.0.1",
     "icon": "icon.png",
     "publisher": "benoitf",
     "engines": {
       "podman-desktop": "latest"
     },
     "main": "./dist/extension.js",
     "contributes": {
       "commands": [
         {
           "command": "my.first.command",
           "title": "My First Extension: Hello World"
         }
       ]
     }
   }
   ```

#### Next steps

* [Writing a Podman Desktop extension](write)
