<script context="module" lang="ts">
import Spinner from '@podman-desktop/ui-svelte/Spinner';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Spinner` component.
 * Displays undeterminate progres through a circle/spinner.
 */
const { Story } = defineMeta({
  component: Spinner,
  title: 'Progress/Spinner',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Spinner {...args} />
{/snippet}

<Story name="Basic" />
