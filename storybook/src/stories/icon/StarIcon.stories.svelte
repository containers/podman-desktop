<script context="module" lang="ts">
import StarIcon from '@podman-desktop/ui-svelte/icons/StarIcon';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * Describe `StarIcon` component.
 */
const { Story } = defineMeta({
  component: StarIcon,
  title: 'Icon/StarIcon',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <StarIcon {...args} />
{/snippet}

<Story name="Basic" />
