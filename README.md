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

## v0.2.3 – optionaler Vollbildmodus

Über das Vergrößern-Symbol oben rechts wird die Vollbilddarstellung ein- und ausgeschaltet. Auf Browsern mit Fullscreen API wird der App-Container im echten Vollbild angezeigt; Esc kann diesen Modus verlassen. Auf iPhone Safari wird stattdessen nur das Spiellayout vergrößert (die Browserleisten werden dadurch **nicht** entfernt). Siehe `docs/INTEGRATION_006.md` für Tests, Einschränkungen und Schnittstellen.

### Auftrag 008 – Teamverwaltung
Reines Datenmodul `src/pokemon/Team.js` auf Basis von Auftrag 007. API und offene Fragen: `docs/TEAM_008.md`. Automatisierte Tests: `npm test`.

## Auftrag 009 – UI-Integration
Das Teammenü ist über **Team** erreichbar. Die Starterauswahl ist implementiert, wird aber absichtlich **nicht** beim Start geöffnet: Sie ist für ein späteres Professor-Ereignis über `openProfessorStarterSelection()` vorbereitet. Starterlevel: 5. Kein Speicheranschluss vorhanden. Siehe `docs/INTEGRATION_009.md`.

## Auftrag 010 – vorläufiger Professor-Test
In der Testwelt steht bei (18,16) ein als Test markierter Professor. Von Süden ansprechen, Dialog abschließen und die vorhandene Starterauswahl verwenden. Diese Szene ersetzt **nicht** den im Projekthandbuch vorgesehenen Einführungsausflug mit Shiny-Raupy. Details und Tests: `docs/INTEGRATION_010.md`.
