<script context="module" lang="ts">
import { faBell, faRocket, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `DropdownMenu` component.
 * Interact with a drop down from a kebab menu.
 */
const { Story } = defineMeta({
  component: DropdownMenu,
  title: 'DropdownMenu',
  tags: ['autodocs'],
  args: {},
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <div class="flex min-h-52 justify-center p-10">
    <DropdownMenu>
      {#each args.items as item}
        <DropdownMenu.Item {...item} />
      {/each}
    </DropdownMenu>
  </div>
{/snippet}

<Story
  name="Basic"
  args={{
    items: [
      { title: 'Item 1', icon: faBell },
      { title: 'Item 2', icon: faRocket },
      { title: 'Item 3', icon: faTrash },
    ],
  }} />
