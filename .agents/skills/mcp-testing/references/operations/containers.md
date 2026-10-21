# Container Operations

## Navigation

| Target          | Selector                                                     |
| --------------- | ------------------------------------------------------------ |
| Containers page | `nav[aria-label="AppNavigation"] a[aria-label="Containers"]` |

## Page Structure

### ContainersPage (list)

```
[role="region"][aria-label="containers"]
├── [role="region"][aria-label="header"]
│   ├── [role="heading"]                        ← "Containers"
│   └── [role="group"][aria-label="additionalActions"]
│       ├── button:has-text("Create")
│       └── button:has-text("Prune")
├── [role="region"][aria-label="search"]
│   └── [role="group"][aria-label="bottomAdditionalActions"]
└── [role="region"][aria-label="content"]
    └── [role="table"]
        └── [role="row"][aria-label="{containerName}"]
```

### ContainerDetailsPage

```
[role="region"][aria-label="Header"]
├── [role="navigation"][aria-label="Breadcrumb"]
├── [role="heading"]                            ← container name
├── [role="status"]                             ← state (title attr)
└── [role="group"][aria-label="Control Actions"]
[role="region"][aria-label="Tabs"]
└── a:has-text("{tabName}")                     ← Summary, Logs, Inspect, Kube, Terminal
[role="region"][aria-label="Tab Content"]
```

## Locators

### ContainersPage

| Element       | Selector                                                                           |
| ------------- | ---------------------------------------------------------------------------------- |
| Page heading  | `[role="region"][aria-label="containers"] [role="heading"]`                        |
| Create button | `[aria-label="additionalActions"] button:has-text("Create")`                       |
| Prune button  | `[aria-label="additionalActions"] button:has-text("Prune")`                        |
| Prune confirm | `button:has-text("Prune")`                                                         |
| Run all       | `[aria-label="Run selected containers and pods"]`                                  |
| Container row | `[role="row"][aria-label="{containerName}"]`                                       |
| Name cell     | `[role="row"][aria-label="{containerName}"] [role="cell"]:nth-child(4)`            |
| Image cell    | `[role="row"][aria-label="{containerName}"] [role="cell"]:nth-child(6)`            |
| Start (row)   | `[role="row"][aria-label="{containerName}"] button[aria-label="Start Container"]`  |
| Stop (row)    | `[role="row"][aria-label="{containerName}"] button[aria-label="Stop Container"]`   |
| Delete (row)  | `[role="row"][aria-label="{containerName}"] button[aria-label="Delete Container"]` |
| Environment   | `[role="row"][aria-label="{containerName}"] [data-testid="tooltip-trigger"]`       |
| Create Pod    | `button:has-text("Create Pod")`                                                    |

### Create Container Dialog

| Element        | Selector                                                                    |
| -------------- | --------------------------------------------------------------------------- |
| Dialog         | `[role="dialog"][aria-label="Create a new container"]`                      |
| Close dialog   | `[role="dialog"][aria-label="Create a new container"] [aria-label="Close"]` |
| Existing image | `[role="dialog"] button:has-text("Existing image")`                         |
| Containerfile  | `[role="dialog"] button:has-text("Containerfile or Dockerfile")`            |

### SelectImagePage

| Element      | Selector                                          |
| ------------ | ------------------------------------------------- |
| Heading      | `[role="heading"]:has-text("Select an image")`    |
| Image input  | `[placeholder="Select or enter an image to run"]` |
| Run Image    | `button:has-text("Run Image")`                    |
| Pull and Run | `button:has-text("Pull Image and Run")`           |
| Cancel       | `button:has-text("Cancel")`                       |
| Error alert  | `footer [role="alert"]`                           |

### RunImagePage

| Element               | Selector                                                   |
| --------------------- | ---------------------------------------------------------- |
| Heading               | `[role="heading"]:has-text("{imageName}")`                 |
| Container Name        | `[aria-label="Container Name"]`                            |
| Entrypoint            | `[aria-label="Entrypoint"]`                                |
| Command               | `[aria-label="Command"]`                                   |
| Start Container       | `[aria-label="Start Container"]`                           |
| Close link            | `a:has-text("Close")`                                      |
| Error alert           | `[aria-label="createError"] [role="alert"]`                |
| Basic tab             | `a:has-text("Basic")`                                      |
| Advanced tab          | `a:has-text("Advanced")`                                   |
| Networking tab        | `a:has-text("Networking")`                                 |
| Add port mapping      | `[aria-label="Add custom port mapping"]`                   |
| Host port             | `[aria-label="host port"]`                                 |
| Container port        | `[aria-label="container port"]`                            |
| Volume host path      | `[placeholder="Path on the host"]`                         |
| Volume container path | `[placeholder="Path inside the container"]`                |
| Attach terminal       | `[role="checkbox"][aria-label="Attach a pseudo terminal"]` |
| Interactive           | `[role="checkbox"][aria-label="Use interactive"]`          |

### ContainerDetailsPage

| Element          | Selector                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Heading          | `[aria-label="Header"] [role="heading"]:has-text("{containerName}")`     |
| State            | `[aria-label="Header"] [role="status"]` (read `title` attr)              |
| Start            | `[aria-label="Control Actions"] button:has-text("Start Container")`      |
| Stop             | `[aria-label="Control Actions"] button[aria-label="Stop Container"]`     |
| Delete           | `[aria-label="Control Actions"] button[aria-label="Delete Container"]`   |
| Export           | `[aria-label="Control Actions"] button:has-text("Export Container")`     |
| Deploy to K8s    | `[aria-label="Control Actions"] button:has-text("Deploy to Kubernetes")` |
| Image link       | `[aria-label="Header"] a:has-text("Image Details")`                      |
| Summary tab      | `[aria-label="Tabs"] a:has-text("Summary")`                              |
| Logs tab         | `[aria-label="Tabs"] a:has-text("Logs")`                                 |
| Inspect tab      | `[aria-label="Tabs"] a:has-text("Inspect")`                              |
| Kube tab         | `[aria-label="Tabs"] a:has-text("Kube")`                                 |
| Terminal tab     | `[aria-label="Tabs"] a:has-text("Terminal")`                             |
| Terminal input   | `[aria-label="Terminal input"]`                                          |
| Terminal content | `.xterm-rows`                                                            |
| Find in logs     | `[aria-label="Tab Content"] [aria-label="Find"]`                         |
| Clear logs       | `[title="Clear logs"]`                                                   |
| Export path      | `#input-export-container-name`                                           |
| Export browse    | `[aria-label="Select output file"]`                                      |
| Confirm export   | `button:has-text("Export container")`                                    |

## Operations

### Create container from existing image

1. Navigate: `click('nav[aria-label="AppNavigation"] a[aria-label="Containers"]')`
2. Wait for page: `wait('[role="region"][aria-label="containers"] [role="heading"]')`
3. Click Create: `click('[aria-label="additionalActions"] button:has-text("Create")')`
4. Wait for dialog: `wait('[role="dialog"][aria-label="Create a new container"]')`
5. Click Existing image: `click('[role="dialog"] button:has-text("Existing image")')`
6. Wait for select page: `wait('[role="heading"]:has-text("Select an image")')`
7. Fill image: `fill('[placeholder="Select or enter an image to run"]', '{imageName}')`
8. Click Run Image: `click('button:has-text("Run Image")')` (or `click('button:has-text("Pull Image and Run")')` if image is not local)
9. Wait for run page: `wait('[aria-label="Container Name"]')`
10. Optionally set name: `fill('[aria-label="Container Name"]', '{containerName}')`
11. Click Start: `click('[aria-label="Start Container"]')`
12. Wait for details: `wait('[aria-label="Header"] [role="heading"]')`

### Start container (from list)

1. Navigate to Containers page (steps 1-2)
2. Click Start: `click('[role="row"][aria-label="{containerName}"] button[aria-label="Start Container"]')`

### Stop container (from list)

1. Navigate to Containers page
2. Click Stop: `click('[role="row"][aria-label="{containerName}"] button[aria-label="Stop Container"]')`

### Delete container (from list)

1. Navigate to Containers page
2. Click Delete: `click('[role="row"][aria-label="{containerName}"] button[aria-label="Delete Container"]')`

### Open container details

1. Navigate to Containers page
2. Click row: `click('[role="row"][aria-label="{containerName}"]')`
3. Wait for details: `wait('[aria-label="Header"] [role="heading"]:has-text("{containerName}")')`

### Start/Stop/Delete from details

1. Open container details
2. Start: `click('[aria-label="Control Actions"] button:has-text("Start Container")')`
3. Stop: `click('[aria-label="Control Actions"] button[aria-label="Stop Container"]')`
4. Delete: `click('[aria-label="Control Actions"] button[aria-label="Delete Container"]')`

### View container logs

1. Open container details
2. Click Logs tab: `click('[aria-label="Tabs"] a:has-text("Logs")')`
3. Wait for content: `wait('[aria-label="Tab Content"]')`
4. Read logs: `getText('.xterm-rows')`

### Open container terminal

1. Open container details (container must be running)
2. Click Terminal tab: `click('[aria-label="Tabs"] a:has-text("Terminal")')`
3. Wait for terminal: `wait('[aria-label="Terminal input"]')`
4. Type command: `fill('[aria-label="Terminal input"]', '{command}')`
5. Press Enter: `press('Enter')`
6. Read output: `getText('.xterm-rows')`

### Export container

1. Open container details (container must be stopped)
2. Click Export: `click('[aria-label="Control Actions"] button:has-text("Export Container")')`
3. Fill path: `fill('#input-export-container-name', '{exportPath}')`
4. Click Export: `click('button:has-text("Export container")')`

### Prune containers

1. Navigate to Containers page
2. Click Prune: `click('[aria-label="additionalActions"] button:has-text("Prune")')`
3. Confirm: `click('button:has-text("Prune")')`

### Check container state

```
evaluate('document.querySelector(\'[role="row"][aria-label="{containerName}"] [role="status"]\')?.title')
```

Returns: `RUNNING`, `STOPPED`, `EXITED`, etc.

## Test Data

- Lightweight image: `ghcr.io/podmandesktop-ci/hello`
- Timeouts: start 30s, stop 30s, terminal 10s, export 60s

## Gotchas

- Container must be running before Terminal tab works
- Container must be stopped before Export is available
- Create dialog has two paths: "Existing image" and "Containerfile" — most tests use existing
- Row action buttons change based on container state (Start vs Stop)
- The Create Pod button appears in bulk actions when containers are selected
- "Run Image" button becomes "Pull Image and Run" when the image is not available locally — try both selectors
