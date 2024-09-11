<script context="module" lang="ts">
import { faLayerGroup, faRocket } from '@fortawesome/free-solid-svg-icons';
import EmptyScreen from '@podman-desktop/ui-svelte/EmptyScreen';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `EmptyScreen` component.
 * Displays action/state if data is not there.
 */
const { Story } = defineMeta({
  component: EmptyScreen,
  title: 'Screen/EmptyScreen',
  tags: ['autodocs'],
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <EmptyScreen {...args} />
{/snippet}

<Story
  name="Example"
  args={{
    icon: faRocket,
  }} />

<Story
  name="Custom title & message"
  args={{
    title: 'Custom title',
    message: 'Custom message',
    icon: faRocket,
  }} />

<Story
  name="Custom command"
  args={{
    title: 'No images',
    message: '',
    icon: faLayerGroup,
    commandline: 'echo hello world',
  }} />
