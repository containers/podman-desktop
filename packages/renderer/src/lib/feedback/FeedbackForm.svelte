<div>
  <div class="relative max-h-80 overflow-auto text-[var(--pd-modal-text)] px-10 pb-4">
    <slot name="content" />
  </div>

  <div class="px-5 py-5 mt-2 flex flex-row w-full space-x-5">
    <div class="grow">
      <slot name="validation" />
    </div>
    <slot name="buttons" />
  </div>
</div>
