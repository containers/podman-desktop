<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import VolumeIcon from '../images/VolumeIcon.svelte';
</script>

<EmptyScreen
  icon="{VolumeIcon}"
  title="No volumes"
  message="Create a volume using the following command line:"
  commandline="podman volume create myFirstVolume" />
