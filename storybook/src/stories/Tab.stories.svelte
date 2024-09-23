<script context="module" lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Tab` component.
 * Interact with tabs.
 */
const { Story } = defineMeta({
  component: Tab,
  title: 'Tab',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the tab',
      defaultValue: 'Tab',
    },
    url: {
      control: 'text',
      description: 'Link to navigate to when tab is clicked',
      defaultValue: '',
    },
    selected: {
      control: 'boolean',
      description: 'Flag the tab as being selected',
      defaultValue: false,
    },
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Tab title={args.title ?? ''} selected={args.selected ?? false} url={args.url ?? ''} />
{/snippet}

<Story
  name="Basic"
  args={{
    title: 'title 1',
  }} />

<Story
  name="Selected"
  args={{
    title: 'title 1',
    selected: true,
  }} />
