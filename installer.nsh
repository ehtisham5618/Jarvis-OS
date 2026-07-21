; installer.nsh — Custom NSIS installer script for Jarvis OS
; Adds a "Launch Jarvis after install" checkbox

!macro customInstall
  ; Create a checkbox to launch after install
  ${If} ${SectionIsSelected} ${SEC01}
    ExecShell "" "$INSTDIR\Jarvis.exe"
  ${EndIf}
!macroend

!macro customHeader
  !system "echo '' > nul"
!macroend
