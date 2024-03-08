import { expect, test } from 'vitest';
import { fadeSlide } from './animations';
import { cubicOut } from 'svelte/easing';

test('fadeSlide', () => {
  const delay = 10;
  const duration = 300;
  const element = document.createElement('div');
  element.style.setProperty('opacity', '50');
  element.style.setProperty('height', '100px');
  element.style.setProperty('padding-top', '4px');
  element.style.setProperty('padding-bottom', '8px');
  const result = fadeSlide(element, { delay, duration, easing: cubicOut });
  expect(result.delay).toEqual(delay);
  expect(result.duration).toEqual(duration);
  expect(result.easing).toEqual(cubicOut);
  const css = result.css;
  expect(css(0)).toEqual('overflow: hidden;opacity: 0;height: 0px;padding-top: 0px;padding-bottom: 0px;');
  expect(css(0.5)).toEqual('overflow: hidden;opacity: 25;height: 50px;padding-top: 2px;padding-bottom: 4px;');
  expect(css(1)).toEqual('overflow: hidden;opacity: 50;height: 100px;padding-top: 4px;padding-bottom: 8px;');
});
