<script lang="ts">
import Logo from '/@/lib/images/Logo.svelte';
</script>

<header
  id="navbar"
  class="text-gray-700 bg-charcoal-900 body-font shadow-titlebar z-999;"
  style="-webkit-app-region: drag;">
  <div class="flex mx-auto flex-row p-2 items-center">
    <div class="flex lg:w-2/5 flex-1 items-center text-base ml-auto"></div>
    <div
      class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
      <Logo />
      <span class="select-none ml-3 text-xl block text-gray-400">Podman Desktop</span>
    </div>
    <div class="lg:w-2/5 flex-1 lg:justify-end ml-5 lg:ml-0"></div>
  </div>
</header>
