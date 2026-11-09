# Monsterreise – v0.2.1 Integrationskandidat

Technischer Teststand. Startdorf, Haus und NPC sind Platzhalter, keine endgültige Weltgestaltung.

## Start
Die Dateien inklusive `index.html` in das Root-Verzeichnis eines GitHub-Pages-Repositories hochladen oder lokal `python3 -m http.server 8000` starten und `http://localhost:8000` öffnen. Keine Build-Tools erforderlich.

## Steuerung
WASD/Pfeiltasten oder Touch-Steuerkreuz: bewegen. **Auf die sichtbare Haustür laufen**: automatischer Eintritt. Im Haus auf die Tür am unteren Rand laufen: automatischer Austritt. Enter/Leertaste oder Touch-„Aktion“: NPC ansprechen / Dialog fortsetzen; Türen brauchen keine Aktionstaste.

## Tests
Node.js: `npm test` (21 automatisierte Tests bestanden). Manuelle GitHub-Pages-, Mac-, iPhone- und Hoch-/Querformatprüfungen stehen aus.

Siehe `docs/INTEGRATION_004.md` für geänderte Schnittstellen und die Abstimmung mit Chats 02, 05, 06 und 10.

## v0.2.2 – iPhone Safari Touch-Fix
Touch-Schaltflächen unterdrücken Safari-Textauswahl und Kontextmenüs; Pointer-Freigabe ist bei Abbruch und Capture-Verlust abgesichert. Siehe `docs/INTEGRATION_005.md`. Der tatsächliche Safari-Gerätetest steht noch aus.
