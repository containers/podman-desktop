<script context="module" lang="ts">
import ErrorMessage from '@podman-desktop/ui-svelte/ErrorMessage';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `ErrorMessage` component.
 */
const { Story } = defineMeta({
  component: ErrorMessage,
  title: 'Alert/ErrorMessage',
  tags: ['autodocs'],
  args: {
    icon: false,
    wrapMessage: false,
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <ErrorMessage {...args} />
{/snippet}

<Story
  name="Basic"
  args={{
    error: 'This is an error message',
  }} />

<Story
  name="Icon only"
  args={{
    error: 'This is an error message with a custom icon',
    icon: true,
  }} />

<Story
  name="Icon only and wrap"
  args={{
    error: 'This is an error message with a custom icon',
    icon: true,
    wrapMessage: true,
  }} />
