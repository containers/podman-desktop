---
sidebar_position: 1
title: When clause contexts
description: Podman Desktop when clause contexts reference
tags: [podman-desktop, extension, writing, when clause]
keywords: [podman desktop, extension, writing, when clause]
---

# When clause contexts

Podman Desktop uses when clauses to enable or disable extensions command and UI customizations, such as views.

For example, the Kind extension adds a custom icon to a container that has a label equals to `io.x-k8s.kind.cluster` by using the following instruction.

```json
"views": {
   "icons/containersList": [
     {
       "when": "io.x-k8s.kind.cluster in containerLabelKeys",
       "icon": "${kind-icon}"
     }
   ]
 }
```

A when clause can consist of a context key (such as `isLinux`) or complex expressions to define a specific state.

### Available context keys

Podman Desktop has a set of context keys that are evaluated to Boolean true/false.

| Context key                   | True when                    |
| ----------------------------- | ---------------------------- |
| **Operating system contexts** |                              |
| isLinux                       | True when the OS is Linux.   |
| isWindows                     | True when the OS is Windows. |
| isMac                         | True when the OS is macOS.   |

Podman Desktop also provides context keys that return values that can be used to create meaningful expressions

| Context key        | Value in it                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| containerLabelKeys | A list of all labels belonging to the current container. Example: `"value in containerLabelKeys"`                       |
| selectedImageId    | The image id which the dashboard/image menu opened belong to. Example `"selectedImageId in imagesPushInProgressToKind"` |

### Add a custom when clause context

If you are creating your own extension and none of the existing keys suit your needs, you can set your own context key by calling the function `setValue(key: string, value: any, scope?: 'onboarding')` provided by the `context` namespace in the Podman Desktop API.

The scope, if specified, triggers a custom behavior to avoid any type of collisions between different extensions for that specific scope. Podman Desktop is responsible for handling its state and cleans it accordingly when necessary.

If omitted, the key/value is set globally. For this reason it is recommended to use the extension id as part of the key to avoid unexpected collisions with other extensions.

The first example below sets the key `"podmanIsInstalled"` to true globally while the second example sets the key `"toolInstalled"` to `oc.exe` using the onboarding scope.

```js
extensionsAPI.context.setValue('podmanIsInstalled', true);

extensionsAPI.context.setValue('toolInstalled', 'oc.exe', 'onboarding');
```

After setting the `toolInstalled` to `oc.exe`, you could use this information in the `when` clause to enable something

```json
{
  "when": "onboardingContext:toolInstalled == oc.exe"
}
```

### Conditional operators

To create `when` clauses a bit more complex Podman Desktop offers a set of operators that can be combined with each other.

#### Logical operators

Logical operators allow combining simple context keys or when-clause expressions that include other operators

| Operator | Symbol | Example                                                     |
| -------- | ------ | ----------------------------------------------------------- |
| Not      | `!`    | `!podmanIsInstalled` or `!(podmanIsInstalled && isWindows)` |
| And      | `&&`   | `podmanIsInstalled && isWindows`                            |
| Or       | `\|\|` | `isLinux \|\| isWindows`                                    |

#### Equality operators

Equality operators allow checking for equality of a context key's value against a specified value.

**Note:** the right side is a value and not considered as a context key, so no value is searched in the context. If it contains whitespaces, it must be wrapped in single-quotes (for example `'my tool.exe'`)

| Operator   | Symbol | Example                                     |
| ---------- | ------ | ------------------------------------------- |
| Equality   | `==`   | `onboardingContext:toolInstalled == oc.exe` |
| Inequality | `!=`   | `onboardingContext:toolInstalled != oc.exe` |

#### Comparison operators

Comparison operator allow comparing a context key's value against a number.

**Note:** the left and right side of the operator must be separated by whitespace - `bar < 2`, but not `bar<2`

| Operator     | Symbol    | Example                                |
| ------------ | --------- | -------------------------------------- |
| Greater than | `>`, `>=` | `onboardingContext:toolInstalled > 2`  |
| Less than    | `<`, `<=` | `onboardingContext:toolInstalled <= 3` |

#### In and not in

The `in`/`not in` operators allow checking if a value exists/not exists within the other. The right should be a context key, which value is retrieved in the context. The left can be a value or a context key.

| Operator | Symbol   | Example                           |
| -------- | -------- | --------------------------------- |
| In       | `in`     | `label in containerLabelKeys`     |
| Not      | `not in` | `label not in containerLabelKeys` |

#### Match operator

The match operator allow treating the right side item as a regular expression literal to match against the left side.

| Operator | Symbol | Example              |
| -------- | ------ | -------------------- |
| Matches  | `=~`   | `label =~ /podman$/` |
