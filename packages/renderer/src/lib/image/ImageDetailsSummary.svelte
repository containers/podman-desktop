<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;
</script>

<div class="flex px-5 py-4 flex-col h-full overflow-auto">
  <table>
    <tbody>
      <tr>
        <td class="pr-2">Id:</td>
        <td>{image.id}</td>
      </tr>
      <tr>
        <td class="pr-2">Size:</td>
        <td>{image.humanSize}</td>
      </tr>
      <tr>
        <td class="pr-2">Age</td>
        <td>{image.age}</td>
      </tr>
    </tbody>
  </table>
</div>
