<script lang="ts">
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
export let guide: Guide;
</script>

<dif class="pt-4">
  <div class="px-4">
    <img src="{`data:image/png;base64,${guide.icon}`}" alt="{guide.id}" style="{`height:48px;`}" />
  </div>
  <div class="px-4 pt-4">
    {guide.title}
  </div>
  <p class="text-base text-gray-700 px-4 pt-4">{guide.description}</p>
</dif>
