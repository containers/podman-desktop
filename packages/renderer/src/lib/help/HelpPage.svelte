<div class="flex flex-col min-h-full">
  <div class="min-w-full flex">
    <div class="pt-5 px-5">
      <p class="text-xl">Help</p>
      <p class="text-sm text-gray-400">Looking for assistance? We've got you covered.</p>
    </div>
  </div>
  <div class="min-w-full flex-1">
    <ul role="list" class="px-5 py-3">
      <li class="pb-2">
        <i class="fas fa-solid fa-book-open" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://podman-desktop.io/docs/intro')}"
          title="https://podman-desktop.io/docs/intro"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          Access to Documentation
        </p>
      </li>

      <li class="pb-2">
        <i class="fas fa-solid fa-bug" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://github.com/containers/podman-desktop/issues/new/choose')}"
          title="https://github.com/containers/podman-desktop/issues/new/choose"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          Report a bug
        </p>
      </li>

      <li class="pb-2">
        <i class="fas fa-solid fa-comment" aria-hidden="true"></i>
        <p
          on:click="{() => {
            window.events.send('display-feedback', undefined);
          }}"
          title="Share your Feedback"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          Share your Feedback
        </p>
      </li>

      <li class="pb-2">
        <i class="fas fa-solid fa-comment" aria-hidden="true"></i>
        <p
          on:click="{() =>
            window.openExternal('https://github.com/containers/podman-desktop/discussions/categories/general')}"
          title="https://github.com/containers/podman-desktop/discussions/categories/general"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          Create a GitHub discussion
        </p>
      </li>

      <li class="pb-2">
        <i class="fas fa-comments" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://discordapp.com/invite/TCTB38RWpf')}"
          title="https://discordapp.com/invite/TCTB38RWpf"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          General questions (bridged with IRC & Matrix): Join #general on Discord
        </p>
      </li>
      <li class="pb-2">
        <i class="fas fa-comments" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://libera.chat')}"
          title="https://libera.chat"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          General questions (bridged with Discord & Matrix): Join #podman-desktop on Libera.Chat
        </p>
      </li>
      <li class="pb-2">
        <i class="fas fa-comments" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://fedora.im')}"
          title="https://fedora.im"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          General questions (bridged with Discord & IRC): Join #podman-desktop on Matrix
        </p>
      </li>
      <li class="pb-2">
        <i class="fas fa-comments" aria-hidden="true"></i>
        <p
          on:click="{() => window.openExternal('https://slack.k8s.io/')}"
          title="https://slack.k8s.io/"
          class="text-sm inline-flex ml-1 cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
          Kubernetes questions: Join #podman-desktop on the Kubernetes Slack
        </p>
      </li>
    </ul>
  </div>
</div>
