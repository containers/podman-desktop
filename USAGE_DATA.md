# Data Collection

Podman Desktop uses telemetry to collect anonymous usage data in order to identify issues and improve our user experience. You can read our privacy statement
[here](https://developers.redhat.com/article/tool-data-collection).

Users are prompted during first startup to accept or decline telemetry. This setting can be
changed at any time in Settings > Preferences > Telemetry.

On disk the setting is stored in the `"telemetry.*"` keys within the settings file,
at `$HOME/.local/share/containers/podman-desktop/configuration/settings.json`. A generated anonymous id
is stored at `$HOME/.redhat/anonymousId`.

## What's included in the telemetry data

- General information, including operating system, machine architecture, and country.
- When Podman Desktop starts and stops.
- Which extensions are installed.
- Which providers are used, and counts of objects like containers and images.
- Pages navigated to in the UI.
- Actions taken in the UI and interactions with providers, whether they succeeded, and how long they took.

No personally identifiable information is captured. An anonymous id is used so that we can correlate the actions of a user even if we can't tell who they are.

## Notes for committers

As committers it is our responsibility to protect the user's information and collect it responsibly.

### Personally Identifiable Information (PII) 

When adding telemetry, all reasonable steps must be taken to ensure no PII is captured. Information like user-specified provider instance names and folder names should generally not be captured. If it is required, these must be stripped or hashed to avoid collecting PII.

Likewise, content like error messages often contains user-identifiable data like folder names. These must also be stripped or hashed.

### What to collect

Extensions can access the telemetry logger from the Podman Desktop API:
```
import { TelemetryLogger } from '@podman-desktop/api';
```

Telemetry should never be collected 'because we can', but because we want to see current behaviour in order to improve it. This means that we should only collect the minimal data in order to meet those goals, but conversely that we also collect enough to be able to act. For instance, collecting command pass/fail would tell us how often it failed, but not why it's failing in order to fix a bug or improve usability.

When we capture information about commands and whether they succeed, they should be sent using logUsage() as a single event after an action completes, with optional error attributes. This makes it much easier to track the success rate and correlate failures with differences in environment or usage. logError() is typically used for independent or background errors.

When calling logUsage() after an external commandline process or REST interface has failed, include an error object that contains the standard properties, e.g.:

```ts
error {
  message: string,
  statusCode: number, // for HTTP calls
  exitCode: number, // for processes
  ...
}
```