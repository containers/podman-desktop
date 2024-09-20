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
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'placeholder text to show if input field is empty',
      defaultValue: '',
    },
    value: {
      control: 'text',
      description: 'initial value',
      defaultValue: '',
    },
    disabled: {
      control: 'boolean',
      description: 'Flag the input as being disabled',
      defaultValue: false,
    },
    readonly: {
      control: 'boolean',
      description: 'if true, the input field cannot be edited',
      defaultValue: false,
    },
    required: {
      control: 'boolean',
      description: 'if true, the input field is required',
      defaultValue: false,
    },
    clearable: {
      control: 'boolean',
      description: 'if true, the input field can be cleared with an icon',
      defaultValue: false,
    },
    error: {
      control: 'text',
      description: 'error message to show if input is invalid',
      defaultValue: '',
    },
  },
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
