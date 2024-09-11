<script context="module" lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import StarIcon from '@podman-desktop/ui-svelte/icons/StarIcon';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Tooltip` component.
 * Allow to display a tooltip at a given position (top, bottom, etc.).
 */
const { Story } = defineMeta({
  component: Tooltip,
  title: 'Tooltip',
  tags: ['autodocs'],
  args: {},
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  Hover the icon: <Tooltip {...args}>
    <StarIcon />
  </Tooltip>
{/snippet}

<Story
  name="Basic"
  args={{
    tip: 'this is a custom tooltip',
  }} />

<Story
  name="Top"
  args={{
    tip: 'this is a custom top tooltip',
    top: true,
  }} />

<Story
  name="Top Left"
  args={{
    tip: 'this is a custom top left tooltip',
    topLeft: true,
  }} />

<Story
  name="Top Right"
  args={{
    tip: 'this is a custom top right tooltip',
    topRight: true,
  }} />

<Story
  name="Right"
  args={{
    tip: 'this is a custom right tooltip',
    right: true,
  }} />

<Story
  name="Bottom"
  args={{
    tip: 'this is a custom bottom tooltip',
    bottom: true,
  }} />

<Story
  name="Bottom Left"
  args={{
    tip: 'this is a custom bottom left tooltip',
    bottomLeft: true,
  }} />

<Story
  name="Bottom Right"
  args={{
    tip: 'this is a custom bottom right tooltip',
    bottomRight: true,
  }} />

<Story
  name="Left"
  args={{
    tip: 'this is a custom left tooltip',
    left: true,
  }} />
