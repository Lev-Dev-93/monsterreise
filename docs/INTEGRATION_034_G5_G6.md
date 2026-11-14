# Monsterreise 034 – G5/G6: tatsächlicher Integrationsstand

Stand: 14.11.2026. **Isolierter Entwicklungsstand, keine Veröffentlichung und keine Browser-Abnahme.** 033 bleibt über `index.html` und `src/main.js` unverändert erreichbar.

## Herkunft und Konflikte

Ausgang: `Monsterreise_034_G4b_Engine_Chat01.zip`, gegen G2a, G3b Chat03, G3b Chat06, G4a Chat02 und G4 Chat09 anhand relativer Dateipfade und SHA-256-Inhalte abgeglichen. **0 voneinander abweichende gleichnamige Dateien** in den gelieferten ZIPs. G4b enthält die Module aus den anderen Paketen kumulativ. Es wurden keine Fachchat-Dateien überschrieben oder bestehenden Tests entfernt. Der tatsächliche Inhalt ist maßgeblich; 304/304 wurden vor der Zusammenführung erneut mit Node bestätigt.

## Was jetzt läuft

- `index.html`: unveränderter DEV-/Legacy-Modus aus 033, inklusive Professor-Teststarter, Team, Kampf, Center, Legacy-Slots. Keine automatische Migration.
- `story-test.html`: eigenständiger **034-Story-Kartentest** mit fünf registrierten Karten, Bewegung, Portalen und gewöhnlichen Kartenwechseln über `TrustedPortalAdapter`; Route-1-Gate sperrt kontrolliert. Kein Storyspielstand, kein Prolog, keine Startervergabe. Keine DEV-Professor-/Starter-UI im Story-Kartentest; DEV-Knöpfe werden ausgeblendet. **Nicht** als vollständiger Storymodus bezeichnen.
- `src/integration/StoryRebind.js`: synchrone Vorbereitung und Anwendung von Team-/Story-/Location-Rebind; BattleLock und optionale Menü-/BattleView-Teamreferenzen werden aktualisiert; best-effort Rollback bei Fehler. Ohne validen Snapshot keine Anwendung.
- `src/integration/StoryRuntime.js`: injizierbarer, **nicht automatisch aktivierter** Adapter für G2a StorySaveSystem, echten Chat-03-/06-Team-/Storyvalidator, Chat-02-Locationvalidator, G4-SessionLease, G4b-Tickets/Gate/Portal/Coordinator. Der Start ist ohne ausdrücklich freigegebene Artenpolicy gesperrt; kein `()=>true`-Ersatzvalidator. Der Adapter ist noch **nicht** im Story-Kartentest verbunden.

## Grenzen und Risiken

1. **Keine freigegebene vollständige Species-Registry und Artenpolicy:** 033 `sampleRegistry` ist keine freigegebene Gen-1–4-Datenbasis. Deshalb kein produktives Ei/Geschenk/Hatch, keine neuen Standardlevel/Moves/KP/Shiny.
2. **Chat-05-UI fehlt:** Geburtstagsauswahl, Prolog, Ei, Professor-Raupy, Recovery-Dialoge fehlen. Keine künstlichen Storyflags als Ersatz.
3. **Browser-Web-Locks nicht real getestet:** Node-Tests beweisen nicht den dauerhaften Lease im Zielbrowser. Der Story-Kartentest verwendet absichtlich keine Schreibsitzung.
4. **Rebind-Fehler:** `StoryEngineCoordinator` hält bei Fehler ein Recovery-Gate; Rollback in `StoryRebind` ist best effort, nicht vollständig atomar gegenüber beliebigen fremden UI-Callbacks. Vollständige Rebind-/Slotwechsel-E2E-Tests stehen aus.
5. **Route-1-Übergang:** im Kartentest explizit blockiert, statt einen nicht freigegebenen Starter zu vergeben. `TrustedPortalAdapter` ist für die spätere bestätigte Hatch-Transaktion vorbereitet; kein Event wird durch bloßen Reload erzeugt.
6. **Kein Browserlauf durchgeführt:** `story-test.html` ist als lokale HTTP-Entwicklungsseite vorbereitet; Rendering, Portalpositionen und Eingaben sind praktisch am Desktop zu prüfen. Keine Aussage über Browser-Abnahme.
7. **Eintritt in Story-Kartentest:** nur über separate `story-test.html`, kein automatischer Moduswechsel, keine Legacy-Slotänderung.

## Nächste Facharbeiten

- Chat 03: vollständige kanonische Gen-1–4-Species-Datenbasis, freizugebende Ausschlussliste und Startparameter; ohne diese fail closed.
- Chat 05: Story-UI, Wunschwahl `onEggWishSelected(speciesId)`, Ei- und Prologdarstellung, Sperr-/Recovery-Meldungen.
- Chat 06: reale Szenen-/Eventauslösung, Dialog-Checkpoint-Commit und Wiederaufnahme; keine künstlichen Flag-Fortschritte.
- Chat 09: Browser-Abnahme Web Locks/Leaseverlust, vollständige Fehler-/Recovery-Integration mit G2a; Commit-/Slotwechsel-E2E.
- Chat 01/02: realer Desktop-Kartenlauf, Portal-Geometrie, Spawn- und Rückwegprüfung; Rollback-/Gate-Kopplung für tatsächlichen Hatch.
- Chat 10: nach Freigaben StoryRuntime aktivieren, vollständigen Rebind und UI-Bindings im Story-Entry testen, dann Browser- und Gesamtabnahme.

## Ausführung

Im Projektordner `npm test`; zum manuellen Prüfen `npm start` und im Browser `http://localhost:8000/story-test.html` öffnen. `http://localhost:8000/index.html` bleibt der 033-DEV-Modus. Keine GitHub-Veröffentlichung durchgeführt.
