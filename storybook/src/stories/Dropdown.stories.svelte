<script context="module" lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';
import { fn } from '@storybook/test';

const onChangeFn = fn().mockName('onchange');

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
    onchange: onChangeFn,
    disabled: {
      control: 'boolean',
      description: 'Set the dropdown as being disabled',
      defaultValue: false,
    },
    options: {
      description: 'Dropdown items',
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
    value: 'Initial value',
  }} />

<Story
  name="Disabled"
  args={{
    value: 'Disabled dropdown',
    disabled: true,
  }} />
