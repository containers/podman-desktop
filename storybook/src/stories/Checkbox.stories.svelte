<script context="module" lang="ts">
import { Checkbox } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Checkbox` component.
 * Interact with a boolean value.
 */
const { Story } = defineMeta({
  component: Checkbox,
  title: 'Checkbox',
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Text to show next to the checkbox',
      defaultValue: '',
    },
    title: {
      control: 'text',
      description: 'tooltip displayed when hovering the checkbox',
      defaultValue: '',
    },
    checked: {
      control: 'boolean',
      description: 'Flag the checkbox as being checked',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Flag the checkbox as being disabled',
      defaultValue: false,
    },
    indeterminate: {
      control: 'boolean',
      description: 'Flag the checkbox as being indeterminate',
      defaultValue: false,
    },
    disabledTooltip: {
      control: 'text',
      description: 'Tooltip to show when the checkbox is disabled',
      defaultValue: '',
    },
    required: {
      control: 'boolean',
      description: 'Flag the checkbox as being required',
      defaultValue: false,
    },
    id: {
      control: 'text',
      description: 'Id of the checkbox',
      defaultValue: undefined,
    },
    name: {
      control: 'text',
      description: 'Name of the checkbox',
      defaultValue: undefined,
    },
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Checkbox {...args}>{args.content}</Checkbox>
{/snippet}

<Story
  name="Basic"
  args={{
    title: 'Basic checkbox',
    content: 'Basic checkbox example',
  }} />

<Story
  name="Checked"
  args={{
    title: 'Basic checkbox',
    checked: true,
    content: 'Basic checkbox example',
  }} />

<Story
  name="Indeterminate"
  args={{
    title: 'Indeterminate checkbox',
    indeterminate: true,
    content: 'Indeterminate checkbox example',
  }} />

<Story
  name="Disabled"
  args={{
    title: 'Disabled checkbox',
    disabled: true,
    content: 'Disabled checkbox example',
  }} />

<Story
  name="Disabled with custom tooltip"
  args={{
    title: 'Disabled checkbox',
    disabled: true,
    disabledTooltip: 'disabled tooltip',
    content: 'Disabled checkbox with custom tooltip example',
  }} />

<Story
  name="Required"
  args={{
    title: 'Required checkbox',
    required: true,
    content: 'Required checkbox example',
  }} />
