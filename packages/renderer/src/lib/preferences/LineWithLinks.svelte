<script lang="ts">
export let lineText: string;

interface Segment {
  text: string;
  href?: string;
}

function createLink(text: string): Segment {
  const match = text.match(/\[(?<text>.*)\]\[(?<url>.*)\]/);
  return {
    text: match.groups.text,
    href: match.groups.url,
  };
}

let text = lineText;
let segments: Segment[] = [];
while (text.length > 0) {
  const match = text.search(/\[.*\]\[.*\]/);
  if (match > 0) {
    // it is a link
    segments.push({ text: text.substring(0, match) });
    const linkMatch = text.match(/\[(?<text>.*)\]\[(?<url>.*)\]/);
    segments.push({
      text: linkMatch.groups.text,
      href: linkMatch.groups.url,
    });
    const linkOffcet = 4 + linkMatch.groups.text.length + linkMatch.groups.url.length;
    text = text.substring(match + linkOffcet, text.length);
  } else {
    segments.push({ text });
    text = '';
  }
  console.log(segments);
}
</script>

<p>
  {#if segments.length === 0}
    <br />
  {:else}
    {#each segments as segment}
      {#if segment.href && segment.text}
        <a aria-label="Open URL in external browser" on:click="{() => window.openExternal(segment.href)}"
          >{segment.text}</a>
      {:else}
        {segment.text}
      {/if}
    {/each}
  {/if}
</p>
