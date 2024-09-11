<script context="module" lang="ts">
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `Link` component.
 * Allow to display a link using click event.
 */
const { Story } = defineMeta({
  component: Link,
  title: 'Link',
  tags: ['autodocs'],
  args: {},
});

function doClick(): void {
  window.alert('clicked on the link');
}
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Link {...args} on:click={doClick}>{args.content}</Link>
{/snippet}

<Story
  name="Basic"
  args={{
    content: 'Basic link example',
  }} />

<Story
  name="Custom icon"
  args={{
    icon: faRocket,
    content: 'Link with a custom rocket icon',
  }} />
