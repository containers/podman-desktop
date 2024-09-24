<script context="module" lang="ts">
import { faHandPaper, faLayerGroup, faRocket } from '@fortawesome/free-solid-svg-icons';
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
  argTypes: {
    icon: {
      control: 'object',
      description: 'Icon to show on the screen',
      defaultValue: undefined,
    },
    title: {
      control: 'text',
      description: 'Title of the screen',
      defaultValue: 'No title',
    },
    message: {
      control: 'text',
      description: 'Message to show on the screen',
      defaultValue: 'Message',
    },
    detail: {
      control: 'text',
      description: 'Detail to show on the screen',
      defaultValue: '',
    },
    commandline: {
      control: 'text',
      description: 'Command to show on the screen',
      defaultValue: '',
    },
    hidden: {
      control: 'boolean',
      description: 'Flag the screen as being hidden',
      defaultValue: false,
    },
  },
});
</script>

<script lang="ts">
setTemplate(template);
</script>

{#snippet template({ _children, ...args }: Args<typeof Story>, _context: StoryContext<typeof Story>)}
  <EmptyScreen {...args} />
{/snippet}

<Story
  name="Basic"
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
  name="Custom title & message & details"
  args={{
    title: 'Custom title',
    message: 'Custom message',
    details: 'Custom details',
    icon: faHandPaper,
  }} />

<Story
  name="Custom command"
  args={{
    title: 'No images',
    message: '',
    icon: faLayerGroup,
    commandline: 'echo hello world',
  }} />
