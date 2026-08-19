@echo off
subst W: /D >nul 2>&1
subst X: /D >nul 2>&1
subst Y: /D >nul 2>&1

subst W: "C:\Users\Praveenkumar S\Documents\pdd\kingrat\derma_sense_ai"
subst X: "C:\Users\Praveenkumar S\flutter"
subst Y: "C:\Users\Praveenkumar S\AppData\Local\Pub\Cache"

set PUB_CACHE=Y:\

W:
call X:\bin\flutter pub get
call X:\bin\flutter build apk --release
call X:\bin\flutter build web --release
