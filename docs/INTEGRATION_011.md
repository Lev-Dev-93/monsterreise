# Auftrag 011 – Speichern und Laden (v0.3)

## Verbindliche Regeln
Projekthandbuch Master 1.0, Kapitel 29: drei unabhängige Speicherplätze; Autosave bei wichtigen Ereignissen; manuelles Speichern über Hauptmenü außerhalb von Kämpfen/Zwischensequenzen. Kapitel 14: Starter nur einmal; Kapitel 18: maximal sechs Teammitglieder. Die im ZIP enthaltenen `docs/ARCHITECTURE.md` und `docs/STATUS.md` haben gegenüber dem älteren externen Status Vorrang für den Integrationsstand.

## Tatsächlich implementiert
`src/save/SaveSystem.js`: Browser-`localStorage`, drei getrennte Schlüssel `monsterreise.v03.slot.1` bis `.3`, Format `{version:1,team:{starterAssigned,members}}`. `Team.toSaveData()` und `restoreTeam()` nutzen vorhandene Pokémon-Serialisierung/Validierung. Beim Laden wird vor dem Austausch des Teams vollständig geprüft; beschädigte, veraltete und zukünftige Formate werden nicht automatisch überschrieben oder gelöscht. Speicherzugriffsfehler werden abgefangen. Kein automatischer Rückfall auf einen anderen Slot.

`src/main.js`: Slot 1 wird beim Start geladen. Teamreferenzen in `PokemonMenus` und `ProfessorEncounter` werden beim Slotwechsel aktualisiert. Starterwahl löst einen Autosave des aktuellen Slots aus. `src/ui/PokemonMenus.js`: optionales `onTeamChanged()` nach erfolgreicher Startervergabe. Die vorläufige Professorbegegnung bleibt unverändert und prüft stets den aktuellen Teamstatus.

`index.html` / `styles.css`: vorläufige Header-Steuerung für Slotwahl und manuellen Speicherknopf; Statusmeldungen. Das endgültige Hauptmenü ist nicht vorhanden. Der Knopf blockiert bei geöffnetem Dialog oder Pokémon-Menü; eine Kampf-/Zwischensequenzsperre kann erst mit entsprechenden Zustands-APIs integriert werden. Die aktuelle Spielwelt/Position wird **nicht** gespeichert; ein Slotwechsel ersetzt ausschließlich Team und Starterstatus. Kein stillschweigendes Versprechen eines vollständigen Spielstands.

## Schnittstellen
- `new SaveSystem({registry,storage?})`; `save(slot,team)` -> `{status:'ok'|'error'}`; `load(slot)` -> `{status:'ok',team}` / `{status:'empty'|'invalid'|'incompatible'|'error'}`. Slots 1–3, andere Werte werfen `RangeError`.
- `PokemonMenus({...,onTeamChanged?})`: Callback nach Startervergabe; kein neues Pokémonmodell.
- `main.js`: `saveCurrent()` und `loadSlot(slot)` als Integrationsfunktionen.

## Vorläufige Entscheidungen / offene Fragen
1. Endgültiges Hauptmenü und sichere Sperren für Kampf/Zwischensequenzen fehlen. Header-UI ist ausdrücklich provisorisch.
2. Welche weiteren Ereignisse lösen Autosave aus? Aktuell nur erfolgreiche Startervergabe, weil weitere wichtige Fortschrittsereignisse nicht integriert sind.
3. Künftiges Migrationsschema für ältere Versionen sowie vollständige Welt-/Quest-/Zeitdaten muss abgestimmt werden.
4. Slotwechsel während laufender Spielsitzung betrifft nur das Team, nicht die Welt. Für vollständige Spielstände muss die Spielstart-/Slotwechselstrategie zentralisiert werden.
5. `localStorage` ist browser-/ursprungsgebunden; bei gelöschten Websitedaten oder privatem Modus können Spielstände verloren gehen. Backup/Export noch offen.

## Praktische Browser-Tests
1. `npm start`, `http://localhost:8000` öffnen, Professor-Test-NPC bei (18,16) ansprechen und Starter wählen; Statusmeldung prüfen.
2. Seite neu laden: Team und IVs kontrollieren; Professor erneut ansprechen, keine zweite Starterauswahl.
3. Platz 2 wählen: leeres Team, Starter wählbar; anschließend Platz 1 wählen: ursprüngliches Team und Sperre wiederhergestellt.
4. Manuell speichern und neu laden. Browser-Speicher blockieren: Fehlermeldung, kein Absturz.
5. Über DevTools einen Slotwert beschädigen; neu laden: Warnung und keine automatische Überschreibung; andere Slots bleiben erhalten.
6. Desktop-Tastatur, Touch-Steuerung, Hausportale, Vollbild und iPhone-Hoch-/Querformat auf Regressionen prüfen.

## Tests
`npm test` mit Node-Test-Runner; siehe `docs/TESTRESULT_011.txt`. Echte iPhone-/Safari-Tests noch offen.
