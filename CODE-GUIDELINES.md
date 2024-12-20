# Guidelines for Podman Desktop Code

## Production code

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

### Do not use `try {} catch` in tests

Let's have an async function such as

```ts
export function foo(): Promise<void> {
  throw new Error('bar');
}
```

Let's say we want to check that under certain condition the function throw an error (here always), we _could_ write the following code

```ts
// bad
test('expect error to be properly catched and verified', async () => {
  try {
    await foo();
  } catch(err: unknown) {
    expect(err.message).toBe('bar')
  }
});
```

But it has a problem, if the code in the try block do not raise an error, we do not check the error message.
Here is a version where we are sure the block rejected an error.

```ts
  await expect(async () => {
    await foo();
  }).rejects.toThrowError('Dummy Error');
```
