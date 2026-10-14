# Settings Operations

## Navigation

| Target        | Selector                                                   |
| ------------- | ---------------------------------------------------------- |
| Settings page | `nav[aria-label="AppNavigation"] a[aria-label="Settings"]` |

## Page Structure

### Settings (with sidebar)

```
nav[aria-label="PreferencesNavigation"]         ← settings sidebar
├── a:has-text("Resources")
├── a:has-text("Proxy")
├── a:has-text("Registries")
├── a:has-text("Authentication")
├── a:has-text("preferences")
├── a:has-text("CLI Tools")
└── a:has-text("Kubernetes")
```

## Locators

### SettingsBar (sidebar)

| Element        | Selector                                                               |
| -------------- | ---------------------------------------------------------------------- |
| Settings nav   | `nav[aria-label="PreferencesNavigation"]`                              |
| Resources      | `nav[aria-label="PreferencesNavigation"] a:has-text("Resources")`      |
| Proxy          | `nav[aria-label="PreferencesNavigation"] a:has-text("Proxy")`          |
| Registries     | `nav[aria-label="PreferencesNavigation"] a:has-text("Registries")`     |
| Authentication | `nav[aria-label="PreferencesNavigation"] a:has-text("Authentication")` |
| Preferences    | `nav[aria-label="PreferencesNavigation"] a:has-text("preferences")`    |
| CLI Tools      | `nav[aria-label="PreferencesNavigation"] a:has-text("CLI Tools")`      |
| Kubernetes     | `nav[aria-label="PreferencesNavigation"] a:has-text("Kubernetes")`     |

### PreferencesPage

| Element          | Selector                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Title            | `[aria-label="Title"]`                                                                                   |
| Search input     | `[aria-label="search preferences"]`                                                                      |
| Kubeconfig path  | `[aria-label="Path to the Kubeconfig file for accessing clusters. (Default is usually ~/.kube/config)"]` |
| Reset to default | `button:has-text("Reset to default value")`                                                              |

### ProxyPage

| Element       | Selector                                                       |
| ------------- | -------------------------------------------------------------- |
| Heading       | `[role="heading"]:has-text("Proxy Settings")`                  |
| Proxy mode    | `#toggle-proxy` (3-state dropdown: Disabled / Manual / System) |
| HTTP proxy    | `#httpProxy`                                                   |
| HTTPS proxy   | `#httpsProxy`                                                  |
| No proxy      | `#noProxy`                                                     |
| Update button | `button:has-text("Update")`                                    |
| Error alert   | `[role="alert"]`                                               |

## Operations

### Navigate to settings section

1. Navigate: `click('nav[aria-label="AppNavigation"] a[aria-label="Settings"]')`
2. Wait for settings: `wait('nav[aria-label="PreferencesNavigation"]')`
3. Click section: `click('nav[aria-label="PreferencesNavigation"] a:has-text("{sectionName}")')`

### Open Proxy settings

1. Navigate to settings (steps 1-2)
2. Click Proxy: `click('nav[aria-label="PreferencesNavigation"] a:has-text("Proxy")')`
3. Wait for page: `wait('[role="heading"]:has-text("Proxy Settings")')`

### Configure proxy

1. Open Proxy settings (steps 1-3)
2. Check current state: `getText('#toggle-proxy')` — returns "Disabled", "Manual", or "System"
3. Switch to Manual (if not already): `click('#toggle-proxy')`, then `click('button:has-text("Manual")')`
4. Fill HTTP proxy: `fill('#httpProxy', '{httpProxy}')`
5. Fill HTTPS proxy: `fill('#httpsProxy', '{httpsProxy}')`
6. Fill No proxy: `fill('#noProxy', '{noProxy}')`
7. Click Update: `click('button:has-text("Update")')`

### Open Preferences

1. Navigate to settings
2. Click Preferences: `click('nav[aria-label="PreferencesNavigation"] a:has-text("preferences")')`
3. Wait for page: `wait('[aria-label="Title"]')`

### Search preferences

1. Open Preferences
2. Fill search: `fill('[aria-label="search preferences"]', '{searchTerm}')`

### Reset preference to default

1. Open Preferences
2. Find the preference row
3. Click Reset: `click('button:has-text("Reset to default value")')`

### Open Resources

1. Navigate to settings
2. Click Resources: `click('nav[aria-label="PreferencesNavigation"] a:has-text("Resources")')`

### Open CLI Tools

1. Navigate to settings
2. Click CLI Tools: `click('nav[aria-label="PreferencesNavigation"] a:has-text("CLI Tools")')`
3. Wait for page: `wait('[role="heading"]:has-text("CLI Tools")')`

### Open Kubernetes settings

1. Navigate to settings
2. Click Kubernetes: `click('nav[aria-label="PreferencesNavigation"] a:has-text("Kubernetes")')`

## Gotchas

- Settings page has its own sub-navigation (`PreferencesNavigation`), separate from the main nav
- Proxy selector (`#toggle-proxy`) is a 3-state dropdown (Disabled / Manual / System), not a binary toggle — read its text to check state before changing
- Proxy input fields (httpProxy, httpsProxy, noProxy) are only enabled when state is "Manual"
- Preferences search is case-insensitive and filters in real-time
- CLI Tools page is also accessible via Settings sidebar (see compose.md for CLI tool details)
- The "preferences" link text is lowercase in the UI
