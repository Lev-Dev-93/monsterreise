# Monsterreise – Implementierungs- und Prüfstatus

**Stand:** Auftrag 028, 10.11.2026. **Basis:** Integrationskandidat 027, gebündeltes Update 025–027. Dieses Dokument beschreibt nachprüfbare Implementierung und Tests, keine endgültige Abnahme.

## Implementiert (im vorliegenden Quellcode)
- Browser-Spielgrundgerüst mit Startdorf, Bewegung, Kollisionen, Kamera, Dialogen, Menüs, Tastatur und Touch-Eingaben.
- Vorläufiges Haus und vorläufiges Pokémon-Center als begehbare Innenräume mit automatischen Türportalen und Rückkehrpositionen.
- Vorläufiger Professor-NPC mit Starterauswahl; Pokémon-Team bis sechs Mitglieder.
- Vorläufige artspezifische Anfangsattacken aus `src/pokemon/starterMoves.js`; AP-Initialisierung aus Beispiel-Attackenregister.
- Vorläufiger Testtrainer mit rundenbasiertem Kampf, gegnerischer automatischer Aktion, Verzweifler bei fehlenden nutzbaren AP und Rückstoß.
- Übernahme von Kampf-KP/AP ins Team nach Kampfende, Schutz vor doppelter Ergebnisübernahme.
- `team.healAll()` und `healAtPokemonCenter()`; Heilung an der Station durch ausdrückliche Interaktion; keine automatische Center-Heilung.
- Drei Browser-Speicherplätze mit Team, KP/AP und Weltposition; manuelles Speichern. Startervergabe besitzt bereits einen bestehenden Speicherauslöser (`onTeamChanged`), der nicht mit einem generellen Autosave verwechselt werden darf.
- Isolierter Testspielstand-Modus für freien Speicherplatz: normal (Tackle volle AP) und Verzweifler (Tackle 0 AP).

## Automatisiert geprüft
- Unveränderter Kandidat 027: `npm test` am 10.11.2026 erneut ausgeführt: **184 Tests bestanden, 0 fehlgeschlagen, 0 übersprungen**.
- Tests decken Weltübergänge, Center-Interaktion, Heilung, Kampfsynchronisation, Verzweifler, Speicherformate, Starter-Attacken und Testspielstände ab. Die konkrete Tiefe jedes Szenarios ist den einzelnen Testdateien zu entnehmen; ein vollständiger End-to-End-Browserlauf ist dadurch nicht ersetzt.
- Die Integration 028 verändert keine Spielquellen oder Testlogik, sondern ergänzt Dokumentation und Pakete.

## Noch nicht praktisch im Browser bestätigt
- Gesamtablauf Dorf → Haus → Professor → Starter → Testtrainer → Kampf → Center → Heilung → Speichern → Laden.
- Sichtbare Eingabe-/Dialog-/Kampfzustände und alle Klick-/Tastaturpfade auf einem regulären Desktop-Browser.
- Headless-Chromium-Aufruf im Prüfcontainer durch Umgebung gesperrt (`net::ERR_BLOCKED_BY_ADMINISTRATOR`); **kein erfolgreich abgeschlossener Browser-Test**.
- iPhone-Praxistests bleiben ausgesetzt (Desktop-first).

## Vorläufige Testinhalte
- Startdorf, Haus, Center-Grafik und Positionen, Professor, Testtrainer, Beispielattacken, Testspielstände und Fallback-Testkampf sind nicht als endgültige Spielinhalte freigegeben.
- Starter-Attacken: Glumanda Kratzer/Glut, Evoli Tackle, Raupy Tackle, Riolu derzeit keine reguläre Attacke. Die Zuordnungen sind **Vorschläge**, keine finalen Lernlisten.

## Offene Entscheidungen und technische Risiken
1. Referenzgeneration und endgültige Starter-Movesets; insbesondere Riolus Anfangsattacken.
2. Endgültige Center-Grafik und ggf. Gestaltung mit Chat 05.
3. Zentrale Kampfsperre für zukünftige Kampfarten: aktuelle Center-Freigabe prüft vorhandene BattleView-/Menüzustände und Team-Synchronisation; kein universeller Kampfstatus.
4. Ältere Spielstände mit fehlenden KP/AP: Kompatibilität im Rahmen vorhandener Normalisierungs-/Berechnungswege; tatsächliche Altbestände separat prüfen.
5. Gleichzeitige Browser-Tabs: keine atomare Sperre für Schreibzugriffe auf dieselben Speicherplätze. Nur einen Tab verwenden.
6. Bei einem technischen Fehler während einer Kampfrunde ist kein generelles transaktionales Rollback vorhanden.
7. Vorläufige Versionsangaben in `package.json`, `README.md` und Seitentitel sind nicht auf Auftragsnummer 028 angehoben; sie sind keine belastbare Freigabeversionsnummer.
8. Eine endgültige Desktop-Browser-Abnahme und Veröffentlichungsentscheidung durch Chat 00 stehen aus.

## Schnittstellen / Datenformat
- Keine Änderungen an produktiven Schnittstellen in Auftrag 028.
- `Team.healAll`, `healAtPokemonCenter`, `centerWorldEvent`, `BattleView`, `TestSaveMode`, `SaveSystem` und `WorldSession` unverändert.
- `SAVE_VERSION = 1` und bestehende LocalStorage-Schlüssel unverändert.

## Auftrag 029 – noch nicht praktisch abgenommen
- Zentrale Laufzeit-Kampfsperre in Game, WorldSession, BattleView und Center; Save-Format unverändert.
- Automatisierte Tests: 199 bestanden, 0 fehlgeschlagen (184 bisherige + 15 neue).
- Unabhängige Prüfung durch Chat 10 und Desktop-Praxistest nach Paket 029–033 ausstehend.


## Auftrag 032 – Integration und Stabilisierung (10.11.2026)
- Implementiert: Fehler-Cleanup nach Kampfsperrenerwerb beim Rendern, Rücksetzung des Center-Effekts bei Kartenwechsel, genaue und sichtbarkeitsbegrenzte Heilungshinweise.
- Automatisiert geprüft: 220/220 Tests erfolgreich (213 Bestand + 7 neue). Keine Änderung an Save-Format oder verbindlichen Kampfregeln.
- Praktisch nicht bestätigt: Desktop-DOM-/Canvas-End-to-End nach 029–032; Test gebündelt nach Auftrag 033. iPhone ausgesetzt.
- Vorläufig: Starter-Movesets, Riolus Startattacke, Center-Grafik, Testtrainer und Testspielstände.
- Offen: Recovery bei dauerhaft fehlerhafter Team-Ergebnisübernahme (bewusstes Beibehalten der Sperre zum Schutz der Teamdaten), vollständige Browser-End-to-End-Tests, parallele Browser-Tabs und visuelle Canvas-Abnahme. Details `docs/INTEGRATION_032.md`.


## Auftrag 033 – Vorbereitung Desktop-Testpaket (10.11.2026)
- Basis: unveränderte Spielquellen 032; 220/220 Node-Tests erneut bestanden. Vollständige Projekt-ZIP und separat reduzierte GitHub-Pages-ZIP vorbereitet, nicht veröffentlicht.
- Automatisiert geprüft: Node-Tests, ZIP-Integrität, lokale Import-/Assetpfade und Pages-Rootstruktur. Keine praktische Mac-Browser-Abnahme.
- Vorläufig: Starter-Movesets und Center-Grafik bleiben Testinhalte. Keine Änderung an Spielregeln oder Save-Format.
- Offen: dauerhaft fehlerhafte Ergebnisübernahme, Fehler bei Team-Sync-Rücknahme, DOM-End-to-End-Tests, gehaltene Eingaben, visuelle Fenstergrößen, mehrere Tabs. Siehe `docs/RELEASE_CHECK_033.md` und `docs/DESKTOP_TEST_033.md`.


## 034 G5/G6 – isolierte Zusammenführung (14.11.2026)
- DEV-Entry `index.html` unverändert; separater Story-Kartentest `story-test.html` ohne Speichern, Prolog oder Startervergabe.
- G2a/G3b/G4a/G4/G4b-Module gemeinsam im Entwicklungsstand; injizierbarer StoryRuntime- und synchroner Rebind-Adapter hinzugefügt, produktiv nicht aktiviert.
- 311/311 Node-Tests bestanden; Browser-Abnahme offen. Keine Veröffentlichung, keine neue kanonische Starterregel. Details: `docs/INTEGRATION_034_G5_G6.md`.
