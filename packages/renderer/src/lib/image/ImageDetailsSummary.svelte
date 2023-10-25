<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <table>
    <tr>
      <td class="pt-2 pr-2">Id:</td>
      <td class="pt-2 pr-2">{image.id}</td>
    </tr>
    <tr>
      <td class="pt-2 pr-2">Size:</td>
      <td class="pt-2 pr-2">{image.humanSize}</td>
    </tr>
    <tr>
      <td class="pt-2 pr-2">Age</td>
      <td class="pt-2 pr-2">{image.age}</td>
    </tr>
  </table>
</div>
