<script context="module" lang="ts">
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Story, Template } from '@storybook/addon-svelte-csf';

export const meta = {
  title: 'Example/Button',
  component: Button,
  tags: ['autodocs'],
};
</script>

<Template let:args>
  <Button {...args}>{args.content}</Button>
</Template>

<Story
  name="Primary"
  args="{{
    type: 'primary',
    content: 'primary',
  }}" />

<Story
  name="Secondary"
  args="{{
    type: 'secondary',
    content: 'secondary',
  }}" />

<Story
  name="Primary"
  args="{{
    type: 'primary',
    content: 'primary',
  }}" />

<Story
  name="Danger"
  args="{{
    type: 'danger',
    content: 'danger',
  }}" />

<Story
  name="With icon"
  args="{{
    type: 'primary',
    content: 'with icon',
    icon: faBell,
  }}" />

<Story
  name="Disabled"
  args="{{
    type: 'primary',
    content: 'disabled',
    disabled: true,
  }}" />

<Story
  name="Loading"
  args="{{
    type: 'primary',
    content: 'loading',
    inProgress: true,
    icon: faBell,
  }}" />
