# Auftrag 026 – Pokémon-Center-Heilung

## Bestand und Entscheidungen
- `src/pokemon/Pokemon.js`: `initializeHp`, `initializeMovePp`, `healHp`, `restorePp`; Initialisierung füllt **vorhandene** AP nicht auf.
- `src/pokemon/Team.js`: gekapselte Teammitglieder, `getMembers()` liefert Kopien, `beginBattleSync`/`applyBattleResult` führen laufende Kämpfe zusammen.
- `src/pokemon/sampleMoves.js`: aktuell vorhandenes Attackenregister (vorläufige Attackendaten aus 025 unverändert).
- `src/battle/BattleRules.js`: `createClassicStatAdapters(registry).maxHp(pokemon)` liefert vorhandene klassische KP-Berechnung, sofern für Legacy-Pokémon benötigt.
- `src/save/SaveSystem.js`: serialisiert `team.toSaveData()` und lädt mit `restoreTeam()`; keine Formatänderung erforderlich.
- `src/main.js`: `BattleView.isOpen()` und Dialog-/Menüzustände; `src/dialog/ProfessorEncounter.js` verarbeitet Weltinteraktionen. Keine Center-Interaktion vorhanden.
- `src/world/maps/startVillage.js`: vorhandene Dorfkarte, kein neu angebundenes Pokémon-Center.
- `docs/STATUS.md` ist im gelieferten 025-ZIP nicht vorhanden; historische Statusangaben sind nicht als aktueller Implementierungsstand zu behandeln.

## API
`team.healAll({calculateMaxHp?, moveRegistry?}) -> {healed, changed}`
- Heilt ausschließlich nach **explizitem Aufruf** alle aktiven Mitglieder (0–6).
- `maxHp` bleibt erhalten; bei Legacy-`maxHp:null` ist `calculateMaxHp(pokemon)` erforderlich. Für die bestehende klassische Kampfformel kann `createClassicStatAdapters(speciesRegistry).maxHp` übergeben werden. Kein stillschweigendes Erfinden einer KP-Formel.
- `moveRegistry` ist optional und verwendet standardmäßig das bestehende `sampleMoveRegistry`; für neue Attacken muss der Aufrufer das tatsächlich gültige Register übergeben.
- AP-Maxima werden gegen das Attackenregister geprüft; gespeicherte, abweichende Maxima werden nicht still überschrieben. Fehlende Legacy-AP werden erst beim ausdrücklich ausgelösten Heilen initialisiert.
- Erst werden alle Pokémon vollständig geprüft und als neue Instanzen rekonstruiert; bei Fehlern bleibt das ganze Team unverändert.
- Bei laufendem `beginBattleSync` wird der Aufruf abgewiesen. Änderungen erhöhen die jeweilige Teamrevision. Wiederholte Heilung ist wirkungslos (`changed:0`).
- Identitäts-/Entwicklungsdaten, Level, Erfahrung, IV, EV, Shiny, Starter, Status und Attackenauswahl bleiben erhalten. Kein automatisches Heilen nach Kampf, Save oder Load.

`healAtPokemonCenter({team,canHeal,calculateMaxHp?,moveRegistry?}) -> {healed,changed}` aus `src/center/PokemonCenter.js`.
- `canHeal` muss eine Funktion sein und explizit `true` liefern, sonst wird ohne Mutation abgebrochen.
- **Integrationsbeispiel für Chat 02 / Chat 05:** Nach bestätigtem Center-Dialog und nur wenn `!battleView.isOpen()` und keine Sperrinteraktion aktiv ist: `healAtPokemonCenter({team, canHeal:()=>!battleView.isOpen(), calculateMaxHp:createClassicStatAdapters(sampleRegistry).maxHp, moveRegistry:sampleMoveRegistry})`.
- Eine laufende Team-Kampfsynchronisation sperrt unabhängig vom UI-Gate ebenfalls die Heilung.
- **Nicht** bei Laden, Speichern, Karteneintritt oder nach Kampf automatisch aufrufen.
- Nach der Heilung kann der bestehende manuelle `saveSystem.save(slot,team,location)` verwendet werden. Kein Autosave hinzugefügt.

## Bedienbarkeit und Einschränkungen
- Die Funktion ist programmatisch testbar, aber derzeit **nicht** über die Welt oder die Oberfläche erreichbar.
- Chat 02: vorhandene Weltstruktur prüfen und Center-Ort/NPC/Interaktionsereignis erst nach Entscheidung integrieren.
- Chat 05: spätere Anzeige/Bestätigung der Heilung und gegebenenfalls Dialoggestaltung.
- Chat 00/04: entscheiden, ob und wie aktive Kampfzustände über eine zentrale Game-Sperre statt nur `BattleView` und `beginBattleSync` erkannt werden; noch kein globaler Kampfzustandsdienst.
- Fehlende oder widersprüchliche Legacy-KP erfordern eine explizite Berechnungsfunktion; die Heilung lehnt sonst ab, statt ungefragt zu initialisieren.
- Die bestehende `status`-Eigenschaft wird nicht verändert, da Auftrag 026 nur KP/AP verbindlich spezifiziert.

## Tests
`npm test` → 175/175 bestanden, 0 fehlgeschlagen; vollständige Ausgabe in `docs/TESTRESULT_026.txt`.
Neue Tests: Teilheilung, 0-KP, Mehrfachteam, Identität, wiederholte/leere Teams, atomarer Fehler, Kampf-Sperre, Save-Roundtrip, Legacy-Daten, Register-Maxima. Bestehende Tests zu Trainerkampf, Verzweifler und Testspielständen 024 sind weiterhin erfolgreich.
