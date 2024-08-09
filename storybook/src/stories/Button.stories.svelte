<script context="module" lang="ts">
import { faBell } from '@fortawesome/free-regular-svg-icons';
import Button from '@podman-desktop/ui-svelte/Button';
import { type Args, defineMeta, setTemplate, type StoryContext } from '@storybook/addon-svelte-csf';
import { fn } from '@storybook/test';

const onclickFn = fn().mockName('onclick');

/**
 * These are the stories for the `Button` component.
 * It's the default button we use throughout our application.
 */
const { Story } = defineMeta({
  component: Button,
  title: 'Example/Button',
  tags: ['autodocs'],
  args: {
    onclick: onclickFn,
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <Button {...args}>{args.content}</Button>
{/snippet}

<Story
  name="Primary"
  args={{
    type: 'primary',
    content: 'primary',
  }} />

<Story
  name="Secondary"
  args={{
    type: 'secondary',
    content: 'secondary',
  }} />

<Story
  name="Danger"
  args={{
    type: 'danger',
    content: 'danger',
  }} />

<Story
  name="With icon"
  args={{
    type: 'primary',
    content: 'with icon',
    icon: faBell,
  }} />

<Story
  name="Disabled"
  args={{
    type: 'primary',
    content: 'disabled',
    disabled: true,
  }} />

<Story
  name="Loading"
  args={{
    type: 'primary',
    content: 'loading',
    inProgress: true,
    icon: faBell,
  }} />
