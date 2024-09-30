<script context="module" lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Dropdown` component.
 */
const { Story } = defineMeta({
  component: Dropdown,
  title: 'Dropdown',
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Initial value shown in the dropdown',
      defaultValue: '',
    },
    disabled: {
      control: 'boolean',
      description: 'Set the dropdown as being disabled',
      defaultValue: false,
    },
    id: {
      control: 'text',
      description: 'Id of the dropdown',
      defaultValue: undefined,
    },
    name: {
      control: 'text',
      description: 'Name of the dropdown',
      defaultValue: undefined,
    },
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <div class="pb-24 flex flex-row">
    <Dropdown {...args}>
      <option value="a">Item A</option>
      <option value="b">Item B</option>
      <option value="c">Item C</option>
    </Dropdown>
  </div>
{/snippet}

<Story
  name="Basic"
  args={{
    value: 'Basic dropdown',
  }} />

<Story
  name="Disabled"
  args={{
    value: 'Disabled dropdown',
    disabled: true,
  }} />
