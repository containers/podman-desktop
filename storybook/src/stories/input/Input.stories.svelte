<script context="module" lang="ts">
import { Input } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Input` component.
 * It's the component used to get text/input from the user.
 */
const { Story } = defineMeta({
  component: Input,
  title: 'Input/Input',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Input {...args}>{args.content}</Input>
{/snippet}

<Story
  name="Basic"
  args={{
    placeholder: 'Basic input with a default value',
    value: 'Value predefined',
  }} />

<Story
  name="Readonly"
  args={{
    readonly: true,
    placeholder: 'readonly cannot edit the input field',
  }} />

<Story
  name="Required"
  args={{
    required: true,
    placeholder: 'example of required field',
  }} />

<Story
  name="Clearable"
  args={{
    clearable: true,
    placeholder: 'the input field can be cleared with an icon',
  }} />

<Story
  name="Disabled"
  args={{
    disabled: true,
    placeholder: 'the input field is disabled',
  }} />

<Story
  name="Error"
  args={{
    placeholder: 'Input has an error',
    error: 'this input is being invalid',
  }} />
