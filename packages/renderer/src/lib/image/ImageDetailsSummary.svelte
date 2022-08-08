<script lang="ts">
import { getPanelDetailColor } from '../color/color';

import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;
</script>

<div class="h-full" style="background-color: {getPanelDetailColor()}">
  <div class="flex py-4">
    <table class="divide-y divide-gray-800 h-2 font-thin text-xs">
      <tr>
        <td class="px-2">Id</td>
        <td class="px-2 font-thin text-xs">{image.id}</td>
      </tr>
      <tr>
        <td class="px-2">Size</td>
        <td class="px-2 font-thin text-xs">{image.humanSize}</td>
      </tr>
      <tr>
        <td class="px-2">Created</td>
        <td class="px-2 font-thin text-xs">{image.humanCreationDate}</td>
      </tr>
    </table>
  </div>
</div>
