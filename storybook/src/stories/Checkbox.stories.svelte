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
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    disabledTooltip: '',
    required: false,
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
