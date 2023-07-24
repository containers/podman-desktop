<script lang="ts">
export let size = 'md';
</script>

<i class="pf-c-button__progress {$$props.class || ''}" style="{$$props.style || ''}">
  <span class="pf-c-spinner pf-m-{size}" role="progressbar">
    <span class="pf-c-spinner__clipper"></span>
    <span class="pf-c-spinner__lead-ball"></span>
    <span class="pf-c-spinner__tail-ball"></span>
  </span>
</i>
