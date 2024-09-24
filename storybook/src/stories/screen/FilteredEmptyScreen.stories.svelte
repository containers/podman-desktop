<script context="module" lang="ts">
import { faBookOpenReader } from '@fortawesome/free-solid-svg-icons';
import { FilteredEmptyScreen } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `FilteredEmptyScreen` component.
 */
const { Story } = defineMeta({
  component: FilteredEmptyScreen,
  title: 'Screen/FilteredEmptyScreen',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <FilteredEmptyScreen {...args} />
{/snippet}

<Story
  name="Example"
  ,
  args={{
    kind: 'book',
    icon: faBookOpenReader,
    searchTerm: 'hello',
  }} />
