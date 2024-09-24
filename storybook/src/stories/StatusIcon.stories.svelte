<script context="module" lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';
import ContainerIcon from '@podman-desktop/ui-svelte/icons/ContainerIcon';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';

/**
 * These are the stories for the `StatusIcon` component.
 * Allow to display a given status like STARTING, RUNNING, etc.
 */
const { Story } = defineMeta({
  component: StatusIcon,
  title: 'StatusIcon',
  tags: ['autodocs'],
  args: {},
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  {args.status ? `Status for ${args.status}` : ''}<StatusIcon {...args} />
{/snippet}

<Story
  name="Starting"
  args={{
    status: 'STARTING',
    icon: ContainerIcon,
    size: 100,
  }} />

<Story
  name="Running"
  args={{
    status: 'RUNNING',
    icon: ContainerIcon,
    size: 100,
  }} />

<Story
  name="Used"
  args={{
    status: 'USED',
    icon: ContainerIcon,
    size: 100,
  }} />

<Story
  name="Degraded"
  args={{
    status: 'DEGRADED',
    icon: ContainerIcon,
    size: 100,
  }} />

<Story
  name="Deleting"
  args={{
    status: 'DELETING',
    icon: ContainerIcon,
    size: 100,
  }} />

<Story
  name="Created"
  args={{
    status: 'CREATED',
    icon: ContainerIcon,
    size: 100,
  }} />
