import Loader from './Loader.svelte';

const target = document.getElementById('app');
let app;
if (target) {
  app = new Loader({
    target,
  });
}
export default app;
