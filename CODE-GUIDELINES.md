# Guidelines for Podman Desktop Code

## Production code

### Imports

Prefer using path aliases for all cross-directory imports to improve readability and maintainability.

**Good:**

```typescript
import type { WSL2Check } from '/@/checks/windows/wsl2-check';
import { WinPlatform } from './win-platform';
```

**Bad:**

```typescript
import type { WSL2Check } from '../checks/windows/wsl2-check';
```

### Array sorting (`toSorted` vs `sort`)

Prefer `toSorted()` over `sort()` when deriving a sorted view from an existing array.
This includes cases where the sorted value is assigned later in the function.

🚫 **Avoid this pattern:**

```ts
let providers = getProviders();

providers.sort((a, b) => a.name.localeCompare(b.name));

// ... some logic

const sortedProviders = providers;
```

✅ **Use this instead:**

```ts
let providers = getProviders();
const sortedProviders = providers.toSorted((a, b) => a.name.localeCompare(b.name));
```

Use `sort()` only when you explicitly need in-place mutation semantics.

### Svelte

On templates of Svelte components, avoid using inline code and arrow functions. Instead, call a function defined in the script part of the component.

✅ **Use this pattern:**

```ts
<script lang="ts">
async function onButtonClicked(): Promise<void> {
  // the code here
}
</script>

<button on:click={onButtonClicked}>
```

🚫 **Instead of:**

```ts
<button on:click={(): Promise<void> => { /* the code here */ }}>
```

If values have to be passed from the template to the function, use the `bind` method on the function to pass the parameter.

✅ **Use this pattern:**

```ts
<script lang="ts">
async function onButtonClicked(object: Object): Promise<void> {
  // the code here
}
</script>

{#each objects as object (object.id)}
  <button on:click={onButtonClicked.bind(undefined, object)}>
{/each}
```

🚫 **Instead of:**

```ts
{#each objects as object (object.id)}
  <button on:click={(): Promise<void> => onButtonClicked(object)}>
{/each}
```

### Usage of Icon component

The Icon component is a unified icon wrapper that supports multiple icon formats:

- FontAwesome `IconDefinition` object uses `<Fa>` from `svelte-fa`
- Font class icons strings starting with fas fa-, far fa-, fab fa- or ending with -icon Renders as `<span>` with CSS classes
- Data URI images strings starting with data:image/ Renders as `<img>`
- Svelte Components

✅ **Use this pattern:**

```ts
<script lang="ts">
import { CustomSVGIcon } from '/@/icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
</script>

<Icon icon={CustomSVGIcon} size="2x" />
<Icon icon={faGear} size="xs" />
```

🚫 **Instead of:**

```ts
<script lang="ts">
import { CustomSVGIcon } from '/@/icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
</script>

<CustomSVGIcon size='2x' />
<Fa size="xs" icon={faGear} />
<i class="fas fa-angle-down"></i>
```

Use typescript imports rather than string definitions

✅ **Use this pattern:**

```ts
<script lang="ts">
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';
</script>

<Icon icon={faGear} />
```

🚫 **Instead of:**

```ts
<script lang="ts">
</script>

<i class="fas fa-gear"></i>
```

Another example:

✅ **Use this pattern:**

```ts
<script lang="ts">
import { Icon } from '@podman-desktop/ui-svelte/icons';

interface Props {
  icon: unknown;
}

let { icon }: Props = $props();
</script>

<Icon icon={icon} />
```

🚫 **Instead of:**

```ts
<script lang="ts">
import Fa from 'svelte-fa';

interface Props {
  icon: unknown;
}

let { icon }: Props = $props();
</script>

{#if isFontAwesomeIcon(icon)}
  <Fa icon={icon} size="4x" />
{:else}
  {@const IconComponent = icon}
  <IconComponent size='42' />
{/if}
```

### Using async/await in expressions

As of Svelte 5.36+, you can use the `await` keyword directly inside component expressions in three places: at the top level of the component's `<script>`, inside `$derived(...)` declarations, and inside your markup. This enables cleaner code without needing explicit promise handling.

✅ **Use this pattern:**

```ts
<script lang="ts">
async function fetchData(): Promise<Data> {
  // async logic here
  return data;
}

let data = $derived(await fetchData());
</script>

<p>Data: {data}</p>
```

🚫 **Instead of:**

```ts
<script lang="ts">
async function fetchData(): Promise<Data> {
  // async logic here
  return data;
}

// Without await, this produces a Promise
let dataPromise = $derived(fetchData());
</script>

{#await dataPromise}
  <p>Loading...</p>
{:then data}
  <p>Data: {data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

This is much simpler than managing promises manually and avoids the need for `{#await}` blocks when you just need the final value.

For more details on async patterns in Svelte, see the [Svelte documentation on await expressions](https://svelte.dev/docs/svelte/await-expressions).

### Svelte Attachments (Svelte 5.29+)

You can use attachments to add DOM behavior that runs on mount and cleans up on detach.

Example:

```ts
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  const clickOnce: Attachment = (el) => {
    const onClick = () => {
      // handle click
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  };
</script>

<button {@attach clickOnce}>...</button>
```

References: [@attach](https://svelte.dev/docs/svelte/@attach), [svelte/attachments](https://svelte.dev/docs/svelte/svelte-attachments)

## Unit tests code

### Use `vi.mocked`, not a generic `myFunctionMock`

If you define a mock with `const myFunctionMock = vi.fn();` its type is `Mock<Procedure>`, which is a generic type.

For example, do not write this, or Typescript won't be able to detect that you passed an object instead of a string to `mockResolvedValue`:

```ts
const windowMethodMock = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    windowMethod: windowMethodMock,
  },
});

test('...', () => {
  windowMethodMock.mockResolvedValue({ msg: 'a string' }); // here, Typescript is not able to detect that the type is wrong
});
```

Instead, you can write `vi.mocked(window.windowMethod).mock...`, and Typescript will check that you correctly pass a string to `mockResolvedValue`:

```ts
Object.defineProperty(global, 'window', {
  value: {
    windowMethod: vi.fn(),
  },
});

test('...', () => {
  vi.mocked(window.windowMethod).mockResolvedValue('a string');
});
```

### Mock complete modules, spy on parts of module for specific tests

When testing a module, you have to decide for each imported module if you mock the entire module or if you spy on specific functions of the module
for specific tests and keep the real implementation for the other functions.

System modules (`node:fs`, etc) are most generally mocked, so you are sure that unit tests are executed in isolation of the system. For internal modules,
it's up to you to decide if you want to mock them or not, depending on the coverage you want for the unit tests.

#### Mock a complete module

Mock completely an imported module with `vi.mock('/path/to/module)`, and define mock implementation for each test with `vi.mocked(function).mock...()`.

Use `vi.resetAllMocks()` in the top-level `beforeEach` to reset all mocks to a no-op function returning `undefined` before to start each test.

```ts
import { existsSync } from 'node:fs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// completely mock the fs module, to be sure to
// run the tests in complete isolation from the filesystem
vi.mock('node:fs');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('the file exists', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(true);
  });

  test('file exists', () => {
    // existsSync is mocked to return true
    expect(codeCheckingIfFileExists('/file/not/found')).toBeTruthy();
  });
});

describe('the file does not exist', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(false);
  });

  test('root does not exists', () => {
    // existsSync is mocked to return false
    expect(codeCheckingIfFileExists('/')).toBeFalsy();
  });
});

test('file existence is not defined', () => {
  // a no-op mock returning undefined is called
  expect(codeCheckingIfFileExists('/file/not/found')).toBeUndefined();
});
```

#### Spy on a function for a specific test

When you want to mock only one or a small number of functions of a module (for example a function of the module you are testing, or a function of an helper module from which you want to use real implementation for some functions) for a particular test, you can use `vi.spyOn(module, 'function')` to mock only `function` and keep the original implementation for the rest of the module.

To be sure that the spied function is restored to its original implementation for the other tests, use `vi.restoreAllMocks()` in the top-level `beforeEach`.

```ts
// helpers.ts
export function f1(): boolean {
  return true;
}

// mymodule.ts
import { f1 } from './helpers.js';

export class MyModuleToTest {
  f2(): boolean {
    return f1();
  }
}

// mymodule.spec.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MyModuleToTest } from './mymodule.js';
import * as helpers from './helpers.js';

let myModuleToTest: MyModuleToTest;

beforeEach(() => {
  myModuleToTest = new MyModuleToTest();

  // restore f1 to its original implementation
  vi.restoreAllMocks();
});

describe('f1 returns false', () => {
  beforeEach(() => {
    vi.spyOn(helpers, 'f1').mockReturnValue(false);
  });

  test('f2 returns false', () => {
    expect(myModuleToTest.f2()).toBeFalsy();
    expect(helpers.f1).toHaveBeenCalledOnce();
  });
});

test('f2 returns true', () => {
  // use the original implementation of f1
  expect(myModuleToTest.f2()).toBeTruthy();
  // this won't work, as f1 is not spied for this test
  // expect(helpers.f1).toHaveBeenCalledOnce();
});
```

### screen.getBy vs screen.queryBy

Calling `element = screen.getBy...` throws an error if no element is found.
For this reason, it is not necessary to call `expect(element).toBeInTheDocument()`, as the assertion
has already been done as part of `screen.getBy...`.

It is necessary to use `element = screen.queryBy...` followed by `expect(element).not.toBeInTheDocument()`
when checking if a component does NOT exist, as this call does not throw any error,
but returns a `null` value if the element is not found.

### Testing style attribute

When we need to ensure a given style is applied to an HTMLElement, we should be using [tohavestyle](https://github.com/testing-library/jest-dom?tab=readme-ov-file#tohavestyle)

#### Examples

```ts
const { getByText } = render(<MyComponent>);

const text = getByText('text in the page');
// [Good]
expect(text).toHaveStyle({ color: '#FFFFF'});
```

### `waitFor` vs `waitUntil`

Use `waitFor` (https://vitest.dev/api/vi.html#vi-waitfor) to retry an assertion until it passes, and `waitUntil` (https://vitest.dev/api/vi.html#vi-waituntil) to wait for a function to return a truthy value.

→ `waitFor` → needs an exception

→ `waitUntil` → needs a boolean

**Example:**

```typescript
// Use waitFor with an assertion
await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));

// Use waitUntil with a boolean value
await vi.waitUntil(() => get(imagesInfos).length > 0);
```

### Mocking a sub-component

To test a component in isolation without testing its sub-components, you have the possibility to mock
the sub-components. For example:

Compo1.svelte

```typescript
<script lang="ts">
import Compo2 from './Compo2.svelte';
</script>

<Compo2 />
```

Compo2.svelte

```typescript
Some content
```

Compo1.spec.ts

```typescript
import { render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import Compo1 from './Compo1.svelte';
import Compo2 from './Compo2.svelte';

vi.mock(import('./Compo2.svelte'));

test('Compo1 calls Compo2', async () => {
  render(Compo1);
  expect(Compo2).toHaveBeenCalled();
});
```

#### When the sub-components have bindable properties

When a sub-component has a bindable property, you may want to test that
some operations are performed on this property.
But as the property value is returned by the sub-component, which is now mocked, you have to return such an object when you mock the component.

For this, you can mock the implementation of the sub-component constructor, and update
the bound property passed as parameter with an object for which you can spy the methods. For example:

Compo1.svelte

```typescript
<script lang="ts">
import { onMount } from 'svelte';
import type { Obj } from './compo2';
import Compo2 from './Compo2.svelte';

let myobj = $state<Obj>();

onMount(() => {
  myobj?.fct1('a name');
});
</script>

<Compo2 bind:obj={myobj} />
```

Compo2.svelte

```typescript
<script lang="ts">
import type { Obj } from './compo2';

interface Props {
  obj?: Obj;
}

let { obj = $bindable() }: Props = $props();
</script>
```

compo2.ts

```typescript
export interface Obj {
  fct1: (name: string) => void;
}
```

Compo1.spec.ts

```typescript
import { render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import Compo1 from './Compo1.svelte';
import type { Obj } from './compo2';
import Compo2 from './Compo2.svelte';

vi.mock(import('./Compo2.svelte'));

test('compo1 calls fct1 of obj on mount', async () => {
  // create a mock Obj, with methods you can spy
  const obj: Obj = {
    fct1: vi.fn(),
  };
  vi.mocked(Compo2).mockImplementation((_, props) => {
    props.obj = obj; // update the value of the prop with your mock Obj
    return {};
  });
  render(Compo1);
  expect(Compo2).toHaveBeenCalled();
  expect(obj.fct1).toHaveBeenCalledWith('a name'); // check the method has been called
});
```

### Using Fake Timers with Svelte Components

When testing Svelte components in the `packages/renderer` package, **always enable automatic time advancement** by using:

```ts
vi.useFakeTimers({ shouldAdvanceTime: true });
```

Avoid calling `vi.useFakeTimers()` without options.

If `shouldAdvanceTime` is not enabled, fake timers will **completely freeze time**, which can lead to deadlocks when:

- Svelte’s internal async updates wait for the next event loop tick
- Testing Library’s async queries (`findBy*`, `waitFor`) continuously poll for elements

By setting `shouldAdvanceTime: true`, timers will automatically advance during pending async operations. This prevents hangs while still allowing manual time control with `vi.advanceTimersByTime()`.

✅ **Use this pattern:**

```ts
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
```

🚫 **Instead of:**

```ts
afterEach(() => {
  vi.useRealTimers();
});
```

### Snapshots

Vitest snapshots are a powerful tool to ensure UI components and complex data structures do not change unexpectedly. They are particularly effective for catching regressions in rendered HTML or large objects without writing manual assertions for every property. When a snapshot detects a diff, you can update it using the `-u` param:

#### Updating Snapshots

When a test fails due to an intentional change, you can update the stored snapshots by appending the `-u` (or `--update`) flag to your test command.

#### 1. Standard Snapshots (External Files)

Use standard snapshots for large outputs like rendered HTML. These are stored in a separate **snapshots** directory.

##### Example: Testing Rendered HTML

```ts
test('multiple container connection should display a dropdown', async () => {
  providerInfos.set([MULTI_CONNECTIONS]);

  const { getByRole } = render(CreateContainerFromExistingImage);
  const dropdown = getByRole('button', { name: 'Container Engine' });
  expect(dropdown).toBeEnabled();

  expect(dropdown).toMatchSnapshot();
});
```

**How to update:**

```bash
cd packages/renderer/
pnpm test src/lib/container/CreateContainerFromExistingImage.s -u
```

**Result:** A snapshot file is created or updated at:

`src/lib/container/__snapshots__/CreateContainerFromExistingImage.spec.ts.snap`

#### 2. Inline Snapshots

Inline snapshots are preferred for small data structures. They are written directly back into your test file, making the expected output easier to review during code sessions.

#### Example: Testing an Object

```ts
test('should parse targets with some special characters', async () => {
  const info = await containerFileParser.parseContent(`
    FROM busybox as base
    ARG TARGETPLATFORM
    RUN echo $TARGETPLATFORM > /plt
    FROM --platform=\${TARGETPLATFORM} base AS base-target
    FROM --platform=$BUILDPLATFORM base AS base-build
  `);
  expect(info).toMatchInlineSnapshot(`
    {
      "targets": [],
    }
  `);
});
```

**How to update:**

```bash
cd packages/main/
pnpm test:unit src/plugin/containerfile-parser.spec.ts --u
```

**Result:** Vitest replaces the code in your .spec.ts file with the updated values:

```ts
expect(info).toMatchInlineSnapshot(`
  {
    "targets": [
      "base",
      "base-build",
    ],
  }
`);
```

**Best Practices**

- **Review Before Committing:** Always inspect the diff of a snapshot update. It is easy to accidentally "fix" a test by updating a snapshot that actually contains a bug.
- **Keep Snapshots Focused:** Avoid snapshotting entire massive objects if you only care about one or two fields; use specific assertions instead to keep tests readable.
- **Use Inline for Small Data:** If the snapshot is less than 10 lines, prefer `toMatchInlineSnapshot()` for better visibility.

For more details, see the [Vitest snapshot guide](https://vitest.dev/guide/snapshot.html).

## Dialog language guide

All dialogs (`showMessageBox` calls) must follow consistent language patterns for titles, body text, and buttons.

For button layout and ordering in dialogs, modals, and forms, see [Button layout in dialogs, modals, and forms](#button-layout-in-dialogs-modals-and-forms).

### Titles

Use `[Verb] [Object]` format. Add `?` for confirmations. No articles ("a", "the").

| Dialog type  | Format                   | Examples                                      |
| ------------ | ------------------------ | --------------------------------------------- |
| Confirmation | `[Verb] [Object]?`       | `Delete Container?`, `Update Podman Desktop?` |
| Action       | `[Verb] [Object]`        | `Push Image`, `Apply Kubernetes YAML`         |
| Error result | `[Verb] [Object] Failed` | `Run Container Failed`, `Pull Image Failed`   |
| Info         | `[Verb] [Object]`        | `View Version`, `Feedback Submitted`          |

### Confirmation questions

Format: `Are you sure you want to [verb] [object]?`

Include the specific resource name: `Are you sure you want to delete container angry_vaughan?`

### Button text

These rules apply to native `showMessageBox` dialog buttons, which follow OS dialog conventions.

- Use action verbs that match the title: `Delete`, `Install`, `Update`, `Prune`
- Never use generic labels: no `Yes`, `No`, `OK`, `Confirm`
- Use `Dismiss` for single-button info/error dialogs
- Use `Cancel` for the cancel/escape action
- Use title case for multi-word buttons: `View Release Notes`, `Copy Link`
- Destructive actions use `variant: 'delete'` for danger styling

### Button labels

In-app `<Button>` components (anywhere outside native `showMessageBox` dialogs, e.g. page actions, modals built with the `Dialog` component) use sentence case instead of title case, matching the rest of the UI.

- Capitalize only the first word and proper nouns: `Manage registries`, `Clear all`, `Use existing image`
- Proper nouns and product/technical terms keep their standard capitalization: `Use Containerfile`, `Update Podman Desktop`
- Do not title-case every word: avoid `Use Existing Image`, `Manage Registries`

### Using `withConfirmation`

Pass an explicit `title` and `variant` via options. For non-delete actions, use `buttonLabel` to set the confirmation button text:

```typescript
withConfirmation(deleteContainer, `delete container ${name}`, {
  title: 'Delete Container?',
  variant: 'delete',
});

withConfirmation(cancelTask, `cancel task ${name}`, {
  title: 'Cancel Task?',
  buttonLabel: 'Cancel',
});
```

### Two-choice dialogs

When a dialog presents two equally valid options (not a cancel/action pair), style both buttons as `type="secondary"` – neither option is subordinate to the other.

- Use parallel action verbs: `Use existing image` / `Use Containerfile`
- Use sentence case, not title case: capitalize only the first word and proper nouns (e.g. `Containerfile`, `Podman`) – see [Button labels](#button-labels)
- Order: `Close`/`Dismiss` leftmost, then the less common option, then the more common option
- Use `Close`/`Dismiss` (`type="link"`), not `Cancel`, to back out without choosing – nothing has been committed yet, so there is nothing to cancel
- Use action verbs, not descriptive labels

```svelte
<Button type="link" on:click={onClose}>Close</Button>
<Button type="secondary" on:click={fromExistingImage}>Use existing image</Button>
<Button type="secondary" on:click={fromDockerfile}>Use Containerfile</Button>
```

Contrast with the cancel/action pattern, where `Cancel` stays `type="link"` and only one button is `type="primary"`:

```svelte
<Button type="link" on:click={cancel}>Cancel</Button>
<Button type="primary" on:click={save}>Save</Button>
```

### Tone

- Professional but conversational
- Direct and clear
- Active voice
- Specific, not generic

## Button layout in dialogs, modals, and forms

All dialogs, modals, and forms must adhere to the following guidelines to ensure accessibility, keyboard navigation, and visual coherence.

### ButtonRow component usage

Action rows must use the shared `ButtonRow` component from `@podman-desktop/ui-svelte`, even for a single button.
Custom button layouts are prohibited.

Note: the `Dialog` component is already using `ButtonRow`, so no need to declare it again in the `buttons` snippet.

✅ **Use this pattern:**

```svelte
<script lang="ts">
import { ButtonRow } from '@podman-desktop/ui-svelte';
</script>

<ButtonRow>
  <Button type="link" onclick={onCancel}>Cancel</Button>
  <Button type="primary" onclick={onSave}>Save</Button>
</ButtonRow>
```

🚫 **Instead of:**

```svelte
<div class="flex justify-end gap-2">
  <Button type="link" onclick={onCancel}>Cancel</Button>
  <Button type="primary" onclick={onSave}>Save</Button>
</div>
```

### Form alignment

The `ButtonRow` component is already right-aligned within itself, so any usage must ensure this styling is preserved, including in single-button forms. No centered or full-width standalone buttons.

✅ **Use this pattern:**

```svelte
<form onsubmit={onSubmit}>
  <ButtonRow>
    <Button type="link" onclick={onCancel}>Cancel</Button>
    <Button type="primary">Submit</Button>
  </ButtonRow>
</form>
```

🚫 **Instead of:**

```svelte
<form onsubmit={onSubmit}>
  <ButtonRow>
    <Button type="link" onclick={onCancel}>Cancel</Button>
    <Button type="primary" class="w-full">Submit</Button>
  </ButtonRow>
</form>
```

### Explicit cancel buttons

Every dialog, modal, or form must have a labeled Close/Cancel/Dismiss button that will either cancel the action or close the component, even when an icon-only close button exists. Screen readers and keyboard users rely on focusable, labeled controls.

✅ **Use this pattern:**

```svelte
<Dialog title="Duplicate Container?" onclose={onCancel}>
  {#snippet content()}
    <p>Do you want to duplicate this container?</p>
  {/snippet}
  {#snippet buttons()}
    <Button type="link" onclick={onCancel}>Cancel</Button>
    <Button type="primary" onclick={onConfirm}>Continue</Button>
  {/snippet}
</Dialog>
```

🚫 **Instead of:**

```svelte
<Dialog title="Duplicate Container?" onclose={onCancel}>
  {#snippet content()}
    <p>Do you want to duplicate this container?</p>
  {/snippet}
  {#snippet buttons()}
    <Button type="primary" onclick={onConfirm}>Continue</Button>
  {/snippet}
</Dialog>
```

### Button sequencing

Cancel/secondary buttons appear first, while primary actions should be positioned last (right in LTR layouts, mirrored for RTL). With three or more buttons, cancel/dismiss must come first (leftmost in LTR), followed by secondary, and ending with the primary (rightmost in LTR).

✅ **Use this pattern:**

```svelte
<ButtonRow>
  <Button type="link" onclick={onCancel}>Cancel</Button>
  <Button type="primary" onclick={onDelete}>Delete</Button>
</ButtonRow>
```

🚫 **Instead of:**

```svelte
<ButtonRow>
  <Button type="primary" onclick={onDelete}>Delete</Button>
  <Button type="link" onclick={onCancel}>Cancel</Button>
</ButtonRow>
```

### DOM/tab order

Visual order must match DOM sequence. Never use CSS `order` property to manipulate visual order. Tab navigation must proceed left-to-right (LTR) through the button row.

✅ **Use this pattern:**

```svelte
<ButtonRow>
  <Button type="link" onclick={onCancel}>Cancel</Button>
  <Button type="primary" onclick={onSave}>Save</Button>
</ButtonRow>
```

🚫 **Instead of:**

```svelte
<ButtonRow>
  <Button type="primary" onclick={onSave} class="order-2">Save</Button>
  <Button type="link" onclick={onCancel} class="order-1">Cancel</Button>
</ButtonRow>
```

### Focus management

Non-destructive dialogs, forms, or modals may focus primary actions on open. Destructive components must default focus to Cancel buttons to prevent accidental data loss or destructive action execution. If there is no Cancel, use `initialFocus="none"` (`ButtonRow`'s default focus) so focus never falls through to the destructive action.

✅ **Use this pattern (destructive action):**

```svelte
<ButtonRow initialFocus="first">
  <Button type="link" onclick={onCancel}>Cancel</Button>
  <Button type="danger" onclick={onDelete}>Delete</Button>
</ButtonRow>
```

For Dialog components, follow the previous instructions by using the `initialButtonFocus` prop.

✅ **Use this pattern (non-destructive action):**

```svelte
<Dialog title="Duplicate Container?" onclose={onCancel} initialButtonFocus="last">
  {#snippet content()}
    <p>Do you want to duplicate this container?</p>
  {/snippet}
  {#snippet buttons()}
    <Button type="link" onclick={onCancel}>Cancel</Button>
    <Button type="primary" onclick={onConfirm}>Continue</Button>
  {/snippet}
</Dialog>
```

MessageBox components (using Dialog) handle focus management internally as follows:

- `initialButtonFocus="first"` for type `danger` if there is a cancel/dismiss button, otherwise `initialButtonFocus="none"`
- `initialButtonFocus="last"` for all other cases
