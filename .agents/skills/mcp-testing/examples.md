# MCP Test Command Examples

Ready-to-use MCP command examples for testing Podman Desktop. Works in both development mode (`pnpm watch`, port 9223) and production mode (installed app, port 9222).

## Connection

### Connect to Podman Desktop

```
Connect to Podman Desktop using CDP at port 9223   # dev mode
Connect to Podman Desktop using CDP at port 9222   # production mode
```

**Prerequisites:** Dev mode requires `pnpm watch` running. Production mode requires the app launched with `--remote-debugging-port=9222`.

## Navigation Workflows

### Navigate to Settings Page

```
Navigate to the Settings page in Podman Desktop
```

**Expected:** Settings page loads, showing Preferences, Resources, etc.

### Navigate to Containers View

```
Click on the Containers link in the navigation sidebar
```

**Expected:** Containers view loads, showing list of containers (if any).

### Open Dashboard

```
Navigate to the Dashboard page
```

**Expected:** Dashboard loads, showing provider status and quick actions.

### Access Extensions Panel

```
Navigate to the Extensions page
```

**Expected:** Extensions page loads, showing installed and available extensions.

### Navigate to Kubernetes Resources

```
Go to the Pods page
```

**Expected:** Pods view loads (if Kubernetes is enabled).

## Form Interaction

### Fill Configuration Form

```
Navigate to Settings > Preferences, toggle the "Enable experimental features" checkbox, and verify it's enabled
```

**Expected:** Checkbox state changes, setting is saved.

### Submit Search Query

```
Navigate to Containers, fill in the search box with "nginx", and press Enter
```

**Expected:** Container list filters to show only containers matching "nginx".

### Create Container Form

```
Navigate to Images, find the nginx image, click "Run Image", fill in container name as "test-nginx", and start the container
```

**Expected:** Container creation form appears, fields are filled, container starts.

## Element Inspection

### Get Text Content from Elements

```
What is the text of the main heading on the Dashboard page?
```

**Expected:** Returns heading text (e.g., "Dashboard").

### Check Visibility of UI Components

```
Navigate to Settings and check if the "Kubernetes" tab is visible
```

**Expected:** Returns true/false based on visibility.

### Count Elements (Container List)

```
Navigate to Containers and count how many container cards are displayed
```

**Expected:** Returns count of container elements in the list.

### Get Element Attributes

```
Get the aria-label attribute of the navigation sidebar links
```

**Expected:** Returns accessible names like "Dashboard", "Containers", "Images", etc.

### Check Button State

```
Navigate to Dashboard, find the Podman provider, and check if the "Start" button is enabled
```

**Expected:** Returns button enabled state.

## Screenshot & Debugging

### Capture Full-Page Screenshot

```
Take a screenshot of the current page and save it
```

**Expected:** Screenshot captured and saved to file.

### Get Accessibility Snapshot

```
Get an accessibility snapshot of the Settings page to see the element tree
```

**Expected:** Returns accessibility tree structure showing headings, buttons, inputs, etc.

## Advanced Scenarios

### Complete Container Creation Workflow

```
1. Navigate to Images page
2. Search for "redis" image
3. Click "Pull Image" if not already available
4. Wait for pull to complete
5. Find the redis image and click "Run Image"
6. Fill in container name as "test-redis"
7. Set port mapping from 6379 to 6379
8. Click "Start Container"
9. Navigate to Containers and verify "test-redis" is running
10. Take a screenshot of the running container
```

**Expected:** Complete workflow from image pull to running container with verification.

### Test Extension Installation Flow

```
1. Navigate to Extensions page
2. Get a snapshot to see available extensions
3. Find the "Docker" extension
4. Click "Install" if not already installed
5. Wait for installation to complete
6. Verify the extension appears in the installed list
7. Take a screenshot
```

**Expected:** Extension installs successfully and appears in installed list.

### Verify Provider Status Changes

```
1. Navigate to Dashboard
2. Find the Podman provider card
3. Check current status (should be "Running" or "Stopped")
4. If running, click "Stop"; if stopped, click "Start"
5. Wait 5 seconds for status change
6. Verify the status changed
7. Take a screenshot of the new status
```

**Expected:** Provider status changes as expected.

### Container Lifecycle Test

```
1. Navigate to Containers
2. Create a new container from nginx image named "lifecycle-test"
3. Verify it starts successfully
4. Stop the container
5. Restart the container
6. Delete the container
7. Verify it's removed from the list
```

**Expected:** Full container lifecycle from creation to deletion.

### Image Pull and Inspect

```
1. Navigate to Images
2. Click "Pull Image" button
3. Enter image name "alpine:latest"
4. Click "Pull"
5. Wait for pull to complete
6. Find the alpine image in the list
7. Click on it to view details
8. Verify image size and tags are displayed
```

**Expected:** Image pulls successfully, details are visible.

## Debugging Scenarios

### Investigate Slow Page Load

```
1. Navigate to Containers page
2. Take a screenshot immediately
3. Wait 2 seconds
4. Take another screenshot
5. Compare to identify lazy-loading elements
```

**Expected:** Identifies elements that load asynchronously.

### Test Keyboard Navigation

```
1. Navigate to Settings
2. Press Tab key 5 times
3. Take screenshot showing focus state
4. Verify focus is visible and logical
```

**Expected:** Focus indicators are visible and follow logical tab order.

## Continuous Testing Workflows

### Daily Smoke Test

```
Run this daily to verify core functionality:

1. Connect to running Podman Desktop (port 9223 for dev, 9222 for production)
2. Navigate to Dashboard - verify it loads
3. Navigate to Containers - count containers
4. Navigate to Images - count images
5. Navigate to Extensions - verify Podman extension is loaded
6. Navigate to Settings - verify Preferences tab is accessible
7. Take screenshot of Dashboard
8. Disconnect
```

**Expected:** All pages load without errors.

### Regression Testing After Changes

```
After making code changes:

1. Verify pnpm watch is running (hot-reloaded with new code) or production app is running with CDP
2. Connect via MCP to the appropriate port (9223 for dev, 9222 for production)
3. Navigate to affected page/feature
4. Test the specific functionality changed
5. Test related functionality for regressions
6. Verify no new errors appear
7. Take before/after screenshots if UI changed
```

**Expected:** Changes work as intended, no regressions introduced.

## Tips for Effective Testing

### Start Every Session With:

```
Connect to Podman Desktop and get an accessibility snapshot of the current page
```

This gives you context about what's visible and available.

### Use Accessible Names Over CSS:

```
Click the button labeled "Start Container"
```

ARIA roles and accessible names are the most stable selectors in Podman Desktop.

### Wait for Dynamic Content:

```
Navigate to Containers, wait 3 seconds for the list to load, then count the containers
```

Prevents race conditions with async operations.

### Verify After Actions:

```
Create a container named "test", then navigate to Containers and verify "test" appears in the list
```

Always confirm actions succeeded.

## Selectors Reference

Podman Desktop has very few `data-testid` attributes. Always use `snapshot()` to discover the actual element tree before interacting.

Selectors below are derived from the project's Playwright Page Object Models (`tests/playwright/src/model/`). Use them as reliable starting points — always verify with `snapshot()` since the UI may evolve.

### Page Regions

The UI is structured around named regions. Start navigation from the top-level region, then drill into header/content:

```javascript
// Main navigation sidebar
document.querySelector('[role="navigation"][aria-label="AppNavigation"]');

// Page-level regions (Dashboard, Images, Containers, Pods, Volumes, Networks)
document.querySelector('[role="region"][aria-label="Images"]');

// Within a page region — header and content areas
// region[aria-label="header"] — contains title, search, action buttons
// region[aria-label="content"] — contains the data table or detail view
```

### Navigation Links

```javascript
// Sidebar links — use role="link" with exact name
document.querySelector('[role="link"][aria-label="Dashboard"]'); // or: Images, Containers, Pods, Volumes, Networks, Settings, Extensions, Kubernetes
```

### Buttons — Common Actions

```javascript
// Resource actions (appear in headers and table rows)
document.querySelector('button[aria-label="Create"]');
document.querySelector('button[aria-label="Delete"]');
document.querySelector('button[aria-label="Prune"]');

// Container lifecycle
document.querySelector('button[aria-label="Start Container"]');
document.querySelector('button[aria-label="Stop Container"]');
document.querySelector('button[aria-label="Delete Container"]');

// Image actions
document.querySelector('button[aria-label="Pull"]'); // exact: true in POM
document.querySelector('button[aria-label="Build"]'); // exact: true in POM
document.querySelector('button[aria-label="Run Image"]');
document.querySelector('button[aria-label="Push Image"]');
document.querySelector('button[aria-label="Save Image"]');
document.querySelector('button[aria-label="Delete Image"]');

// Volume / Network actions
document.querySelector('button[aria-label="Delete Volume"]');
document.querySelector('button[aria-label="Delete Network"]');
document.querySelector('button[aria-label="Create Pod"]');

// Provider actions
document.querySelector('button[aria-label="Initialize and start"]'); // partial — provider name follows

// Navigation buttons
document.querySelector('button[aria-label="Back (hold for history)"]');
document.querySelector('button[aria-label="Forward (hold for history)"]');

// Kebab / overflow menu
document.querySelector('button[aria-label="kebab menu"]');
```

### Button Groups

Action buttons are organized in named groups:

```javascript
// Detail page control actions (Start, Stop, Delete, etc.)
document.querySelector('[role="group"][aria-label="Control Actions"]');

// Additional actions in headers
document.querySelector('[role="group"][aria-label="additionalActions"]');
document.querySelector('[role="group"][aria-label="bottomAdditionalActions"]');

// Left/right action groups
document.querySelector('[role="group"][aria-label="left actions"]');
document.querySelector('[role="group"][aria-label="right actions"]');
```

### Headings

```javascript
// Page titles
document.querySelector('[role="heading"][aria-label="Dashboard"]');
document.querySelector('[role="heading"][aria-label="Images"]');
document.querySelector('[role="heading"][aria-label="Containers"]');

// Form/dialog headings
document.querySelector('[role="heading"][aria-label="Pull Image From a Registry"]');
document.querySelector('[role="heading"][aria-label="Build Image from Containerfile"]');
document.querySelector('[role="heading"][aria-label="Copy containers to a pod"]');
document.querySelector('[role="heading"][aria-label="Create a volume"]');

// Empty state
document.querySelector('[role="heading"][aria-label="No Container Engine"]');
```

### Tables and Rows

```javascript
// The resource table
document.querySelector('[role="table"]');

// All rows
document.querySelectorAll('[role="row"]');

// Cells within a row (0-indexed: checkbox, status, name, environment, image, ...)
document.querySelectorAll('[role="cell"]'); // use nth-child for specific columns

// Column headers — e.g. the "toggle all" checkbox
document.querySelector('[role="columnheader"]');

// Toggle all checkbox
document.querySelector('[role="checkbox"][aria-label="Toggle all"]');
```

### Form Inputs

```javascript
// Pull image input
document.querySelector('[aria-label="Image to Pull"]');

// Container creation form
document.querySelector('[aria-label="Container Name"]');
document.querySelector('[aria-label="Entrypoint"]');
document.querySelector('[aria-label="Command"]');
document.querySelector('[aria-label="host port"]');
document.querySelector('[aria-label="container port"]');
document.querySelector('button[aria-label="Add custom port mapping"]');

// Pod creation
document.querySelector('[role="textbox"][aria-label="Pod name"]');

// Volume creation
document.querySelector('[role="textbox"][aria-label="Volume name"]');

// Build image (use placeholder text)
document.querySelector('[placeholder="Containerfile to build"]');
document.querySelector('[placeholder="Directory to build in"]');
document.querySelector('[placeholder="my-custom-image"]');

// Search in preferences
document.querySelector('[aria-label="search preferences"]');

// Command palette
document.querySelector('[aria-label="Command palette command input"]');
```

### Dialogs

```javascript
document.querySelector('[role="dialog"][aria-label="Create a new container"]');
document.querySelector('[role="dialog"][aria-label="Install Custom Extension"]');
document.querySelector('[role="dialog"][aria-label="Find / Replace"]');
```

### Provider Regions

```javascript
document.querySelector('[role="region"][aria-label="Podman Provider"]');
document.querySelector('[role="region"][aria-label="Developer Sandbox Provider"]');
document.querySelector('[role="region"][aria-label="OpenShift Local Provider"]');
```

### Status and Notifications

```javascript
// Status indicator (check title attribute for "Running", "Stopped", etc.)
document.querySelector('[role="status"]');

// Notifications panel
document.querySelector('[role="region"][aria-label="Notifications Box"]');

// Error messages
document.querySelector('[role="alert"]');

// Extension status
document.querySelector('[aria-label="Extension Status Label"]');
document.querySelector('[aria-label="Connection Status Label"]');
```

### Tabs

```javascript
// Tab container
document.querySelector('[role="region"][aria-label="Tabs"]');

// Tab content area
document.querySelector('[role="region"][aria-label="Tab Content"]');

// Individual tabs — use role="link" with the tab name:
// Summary, History, Inspect, Logs, Terminal, Kube
```

### Terminal (Container Logs / Terminal Tab)

```javascript
// Terminal content (xterm.js)
document.querySelector('.xterm-rows');

// Terminal input
document.querySelector('[aria-label="Terminal input"]');

// Clear logs button
document.querySelector('[aria-label="Clear logs"]');

// Find in terminal
document.querySelector('[aria-label="Find"]');
```

### Extensions Page

```javascript
// Extension page tabs
document.querySelector('button[aria-label="Installed"]');
document.querySelector('button[aria-label="Catalog"]');
document.querySelector('button[aria-label="Local extensions"]');

// Featured extensions region
document.querySelector('[role="region"][aria-label="FeaturedExtensions"]');

// Install custom extension
document.querySelector('[aria-label="Install custom"]');

// Extension actions group
document.querySelector('[role="group"][aria-label="Extension Actions"]');
```

### Platform Selection (Build Image)

```javascript
document.querySelector('[role="region"][aria-label="Build Platform Options"]');
document.querySelector('[aria-label="linux/arm64"]');
document.querySelector('[aria-label="linux/amd64"]');
document.querySelector('[aria-label="ARM® aarch64 systems"]');
document.querySelector('[aria-label="Intel and AMD x86_64 systems"]');
```

### Preferences Navigation

```javascript
document.querySelector('[role="navigation"][aria-label="PreferencesNavigation"]');
document.querySelector('[role="navigation"][aria-label="Breadcrumb"]');
```
