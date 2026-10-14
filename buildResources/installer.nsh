!macro customUnInit
  ; Remove startup registry entry
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "${PRODUCT_NAME}"

!macroend

; Hide the install-scope selection page during an update.
;
; When Podman Desktop is updated (electron-updater runs the installer with the
; --updated flag), we force the installer to reuse the scope of the existing
; installation and skip the "Install for all users / only for me" page. This
; prevents users from switching per-machine <-> per-user during an update, which
; leaves PATH and environment in an inconsistent state and breaks the Podman CLI
; / machine detection.
; See https://github.com/podman-desktop/podman-desktop/issues/17461
;
; Fresh installs and manual re-runs of the installer are left untouched, so the
; user can still choose the scope there.
;
; This hook is invoked by electron-builder's PAGE_INSTALL_MODE (multiUserUi.nsh)
; for interactive installs. Silent updates skip the page; electron-builder's
; initMultiUser already selects the existing scope when exactly one is present.
; Setting $isForceMachineInstall / $isForceCurrentInstall to "1" forces the scope
; and aborts the selection page.
!macro customInstallMode
  ; The updater passes --updated. Explicit scope options must take precedence.
  ${if} ${isUpdated}
  ${andIfNot} ${isForAllUsers}
  ${andIfNot} ${isForCurrentUser}
    ; initMultiUser has already read the registry into these flags. If both
    ; scopes are installed, let the user choose rather than guessing which to update.
    ${if} $hasPerMachineInstallation == "1"
    ${andIf} $hasPerUserInstallation == "0"
      StrCpy $isForceMachineInstall "1"
    ${elseif} $hasPerUserInstallation == "1"
    ${andIf} $hasPerMachineInstallation == "0"
      StrCpy $isForceCurrentInstall "1"
    ${endif}
  ${endif}
!macroend
