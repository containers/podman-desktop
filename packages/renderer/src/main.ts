import * as svelte from 'svelte';
import Loader from './Loader.svelte';

const target = document.getElementById('app');
let app;
if (target) {
  // handle svelte v5
  if ((svelte as any).createRoot) {
    app = (svelte as any).createRoot(Loader, { target });
  } else {
    // v4 usage
    app = new Loader({
      target,
    });
  }
}
export default app;
