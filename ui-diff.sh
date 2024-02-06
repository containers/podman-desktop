DIFF='diff --strip-trailing-cr'
AI_STUDIO_DIR=../../projectatomic/ai-studio
echo Button.svelte
${DIFF} packages/renderer/src/lib/ui/Button.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/button/Button.svelte
echo Button.ts
${DIFF} packages/renderer/src/lib/ui/Button.ts ${AI_STUDIO_DIR}/packages/frontend/src/lib/button/Button.ts
echo Spinner.svelte.ts
${DIFF} packages/renderer/src/lib/ui/Spinner.svelte $ {AI_STUDIO_DIR}/packages/frontend/src/lib/button/Spinner.svelte
echo ListItemButtonIcon.svelte
${DIFF} packages/renderer/src/lib/ui/ListItemButtonIcon.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/button/ListItemButtonIcon.svelte
echo ContainerIcon.svelte
${DIFF} packages/renderer/src/lib/images/ContainerIcon.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/images/ContainerIcon.svelte
echo Markdown.svelte
${DIFF} packages/renderer/src/lib/markdown/Markdown.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/markdown/MarkdownRenderer.svelte
echo LinearProgress.svelte
${DIFF} packages/renderer/src/lib/ui/LinearProgress.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/progress/LinearProgress.svelte
echo Table.svelte
${DIFF} packages/renderer/src/lib/table/Table.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/table/Table.svelte
echo table.ts
${DIFF} packages/renderer/src/lib/table/table.ts ${AI_STUDIO_DIR}/packages/frontend/src/lib/table/table.ts
echo SimpleColumn.svelte
${DIFF} packages/renderer/src/lib/table/SimpleColumn.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/table/SimpleColumn.svelte
echo Checkbox.svelte
${DIFF} packages/renderer/src/lib/ui/Checkbox.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/Checkbox.svelte
echo ErrorMessage.svelte
${DIFF} packages/renderer/src/lib/ui/ErrorMessage.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/ErrorMessage.svelte
echo Modal.svelte
${DIFF} packages/renderer/src/lib/dialogs/Modal.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/Modal.svelte
echo NavPage.svelte
${DIFF} packages/renderer/src/lib/ui/NavPage.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/NavPage.svelte
echo SettingsNavItem.svelte
${DIFF} packages/renderer/src/lib/preferences/SettingsNavItem.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/SettingsNavItem.svelte
echo Tab.svelte
${DIFF} packages/renderer/src/lib/ui/Tab.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/Tab.svelte
echo Tooltip.svelte
${DIFF} packages/renderer/src/lib/ui/Tooltip.svelte ${AI_STUDIO_DIR}/packages/frontend/src/lib/Tooltip.svelte
echo dialog-utils.ts
${DIFF} packages/renderer/src/lib/dialogs/dialog-utils.ts ${AI_STUDIO_DIR}/packages/frontend/src/lib/dialog-utils.ts
