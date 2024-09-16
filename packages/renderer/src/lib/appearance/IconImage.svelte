<script lang="ts">
import { AppearanceUtil } from './appearance-util';

export let image: string | { light: string; dark: string } | undefined = undefined;
export let alt: string | undefined = undefined;

let imgSrc: string | undefined = undefined;

$: getImgSrc(image);

function getImgSrc(image: string | { light: string; dark: string } | undefined) {
  new AppearanceUtil().getImage(image).then(s => (imgSrc = s));
}
</script>

{#if imgSrc}
  <img src={imgSrc} alt={alt} class={$$props.class} />
{:else}
  <slot />
{/if}
