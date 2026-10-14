# Pod Operations

## Navigation

| Target    | Selector                                               |
| --------- | ------------------------------------------------------ |
| Pods page | `nav[aria-label="AppNavigation"] a[aria-label="Pods"]` |

## Page Structure

### PodsPage (list)

```
[role="region"][aria-label="pods"]
├── [role="region"][aria-label="header"]
│   ├── [role="heading"]                        ← "Pods"
│   └── [role="group"][aria-label="additionalActions"]
│       ├── button:has-text("Podman Kube Play")
│       └── button:has-text("Prune")
├── [role="region"][aria-label="search"]
└── [role="region"][aria-label="content"]
    └── [role="table"]
        └── [role="row"][aria-label="{podName}"]
```

### PodDetailsPage

```
[role="region"][aria-label="Header"]
├── [role="navigation"][aria-label="Breadcrumb"]
├── [role="heading"]                            ← pod name
├── [role="status"]                             ← state (title attr)
└── [role="group"][aria-label="Control Actions"]
[role="region"][aria-label="Tabs"]
└── a:has-text("{tabName}")                     ← Summary, Logs, Inspect, Kube
[role="region"][aria-label="Tab Content"]
```

## Locators

### PodsPage

| Element          | Selector                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| Page heading     | `[role="region"][aria-label="pods"] [role="heading"]`                  |
| Kube Play button | `[aria-label="additionalActions"] button:has-text("Podman Kube Play")` |
| Prune button     | `[aria-label="additionalActions"] button:has-text("Prune")`            |
| Prune confirm    | `button:has-text("Prune")`                                             |
| Pod row          | `[role="row"][aria-label="{podName}"]`                                 |
| Pod name button  | `[role="row"][aria-label="{podName}"] button:has-text("{podName}")`    |
| Select pod       | `[role="row"][aria-label="{podName}"] [role="cell"]:nth-child(2)`      |
| Kebab menu       | `[role="row"][aria-label="{podName}"] button[aria-label="kebab menu"]` |
| Environment      | `[role="row"][aria-label="{podName}"] [data-testid="tooltip-trigger"]` |

### PodDetailsPage

| Element      | Selector                                                          |
| ------------ | ----------------------------------------------------------------- |
| Heading      | `[aria-label="Header"] [role="heading"]:has-text("{podName}")`    |
| State        | `[aria-label="Header"] [role="status"]` (read `title` attr)       |
| Start        | `[aria-label="Control Actions"] button[aria-label="Start Pod"]`   |
| Stop         | `[aria-label="Control Actions"] button[aria-label="Stop Pod"]`    |
| Restart      | `[aria-label="Control Actions"] button[aria-label="Restart Pod"]` |
| Delete       | `[aria-label="Control Actions"] button[aria-label="Delete Pod"]`  |
| Summary tab  | `[aria-label="Tabs"] a:has-text("Summary")`                       |
| Logs tab     | `[aria-label="Tabs"] a:has-text("Logs")`                          |
| Inspect tab  | `[aria-label="Tabs"] a:has-text("Inspect")`                       |
| Kube tab     | `[aria-label="Tabs"] a:has-text("Kube")`                          |
| Find in logs | `[aria-label="Tab Content"] [aria-label="Find"]`                  |

### CreatePodPage

| Element           | Selector                                                |
| ----------------- | ------------------------------------------------------- |
| Heading           | `[role="heading"]:has-text("Copy containers to a pod")` |
| Pod name input    | `[role="textbox"][aria-label="Pod name"]`               |
| Create Pod button | `button:has-text("Create Pod")`                         |
| Close button      | `button:has-text("Close")`                              |

### PodmanKubePlayPage

| Element               | Selector                                                               |
| --------------------- | ---------------------------------------------------------------------- |
| Heading               | `[role="heading"]:has-text("Create pods from a Kubernetes YAML file")` |
| YAML path input       | `[placeholder="Select a .yaml file to play"]`                          |
| Browse button         | `button[aria-label="browse"]`                                          |
| Create from scratch   | `button:has-text("Create a file from scratch")`                        |
| YAML editor           | `#custom-yaml-editor`                                                  |
| Play button           | `button:has-text("Play")`                                              |
| Done button           | `button:has-text("Done")`                                              |
| Error alert           | `[role="alert"]`                                                       |
| Enable build checkbox | `[role="checkbox"][aria-label="Enable build"]`                         |
| Replace checkbox      | `[role="checkbox"][aria-label="Replace"]`                              |

## Operations

### Open Kube Play

1. Navigate: `click('nav[aria-label="AppNavigation"] a[aria-label="Pods"]')`
2. Wait for page: `wait('[role="region"][aria-label="pods"] [role="heading"]')`
3. Click Kube Play: `click('[aria-label="additionalActions"] button:has-text("Podman Kube Play")')`
4. Wait for page: `wait('[role="heading"]:has-text("Create pods from a Kubernetes YAML file")')`

### Kube Play from YAML file

1. Open Kube Play (steps 1-4)
2. Fill YAML path: `fill('[placeholder="Select a .yaml file to play"]', '{yamlFilePath}')`
3. Click Play: `click('button:has-text("Play")')`
4. Wait for Done: `wait('button:has-text("Done")', { timeout: 60000 })`
5. Click Done: `click('button:has-text("Done")')`

### Kube Play from scratch

1. Open Kube Play (steps 1-4)
2. Click Create from scratch: `click('button:has-text("Create a file from scratch")')`
3. Wait for editor: `wait('#custom-yaml-editor')`
4. Fill YAML: `fill('#custom-yaml-editor', '{yamlContent}')`
5. Click Play: `click('button:has-text("Play")')`
6. Wait for Done: `wait('button:has-text("Done")', { timeout: 60000 })`
7. Click Done: `click('button:has-text("Done")')`

### Create pod from containers (podify)

1. Navigate to Containers page
2. Select containers: `click('[role="row"][aria-label="{containerName}"] input[aria-label="Toggle container"]')`
3. Click Create Pod: `click('button:has-text("Create Pod")')`
4. Wait for create page: `wait('[role="heading"]:has-text("Copy containers to a pod")')`
5. Set pod name: `fill('[role="textbox"][aria-label="Pod name"]', '{podName}')`
6. Click Create: `click('button:has-text("Create Pod")')`
7. Wait for completion: `wait('button:has-text("Close")', { timeout: 60000 })`

### Open pod details

1. Navigate to Pods page
2. Click pod name: `click('[role="row"][aria-label="{podName}"] button:has-text("{podName}")')`
3. Wait for details: `wait('[aria-label="Header"] [role="heading"]:has-text("{podName}")')`

### Start/Stop/Restart/Delete pod

1. Open pod details
2. Start: `click('[aria-label="Control Actions"] button[aria-label="Start Pod"]')`
3. Stop: `click('[aria-label="Control Actions"] button[aria-label="Stop Pod"]')`
4. Restart: `click('[aria-label="Control Actions"] button[aria-label="Restart Pod"]')`
5. Delete: `click('[aria-label="Control Actions"] button[aria-label="Delete Pod"]')`

### View pod logs

1. Open pod details
2. Click Logs tab: `click('[aria-label="Tabs"] a:has-text("Logs")')`
3. Wait for content: `wait('[aria-label="Tab Content"]')`

### Prune pods

1. Navigate to Pods page
2. Click Prune: `click('[aria-label="additionalActions"] button:has-text("Prune")')`
3. Confirm: `click('button:has-text("Prune")')`

### Check pod state

```
evaluate('document.querySelector(\'[role="row"][aria-label="{podName}"] [role="status"]\')?.title')
```

## Gotchas

- Pods contain multiple containers — the pod row expands to show them
- Kube Play requires a running container engine
- The YAML editor (`#custom-yaml-editor`) may need `evaluate` to set content reliably
- Pod lifecycle actions affect all containers inside the pod
- Create Pod from containers requires selecting containers first via their checkboxes
