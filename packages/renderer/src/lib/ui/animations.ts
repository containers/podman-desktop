import { cubicOut } from 'svelte/easing';

export function fadeSlide(
  node: any,
  { delay = 0, duration = 400, easing = cubicOut },
): { delay: number; duration: number; easing: (t: number) => number; css: (t: number) => string } {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const height = parseFloat(style.height);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);

  return {
    delay,
    duration,
    easing,
    css: (t: number) =>
      `overflow: hidden;` +
      `opacity: ${Math.min(t, 1) * opacity};` +
      `height: ${t * height}px;` +
      `padding-top: ${t * paddingTop}px;` +
      `padding-bottom: ${t * paddingBottom}px;`,
  };
}
