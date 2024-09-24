<script context="module" lang="ts">
import LinearProgress from '@podman-desktop/ui-svelte/LinearProgress';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `LinearProgress` component.
 * Displays undeterminate progres through a line.
 */
const { Story } = defineMeta({
  component: LinearProgress,
  title: 'Progress/LinearProgress',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <LinearProgress {...args} />
{/snippet}

<Story name="Basic" />
