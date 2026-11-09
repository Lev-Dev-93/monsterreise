# Entwicklungsauftrag 009 – UI-Integration v0.3

## Bestätigte Entscheidungen
- Starter beginnt auf Level 5.
- Auswahl wird **später beim Professor** ausgelöst. Die Professor-Szene bzw. der NPC existiert in diesem Stand nicht; daher wird die Auswahl nicht automatisch geöffnet und ist im normalen Spielverlauf noch nicht erreichbar.
- Keine Änderungen an Karten, Weltregeln, Pokémon-Stammdaten oder Kämpfen.

## Geänderte Dateien
- `index.html`: Team-Schaltfläche und responsives Dialogpanel.
- `styles.css`: responsives Team-/Startermenü, Touch-Zielgrößen, Sprite-Platzhalter.
- `src/main.js`: Instanziierung des bestehenden Registers/Teams und UI-Adapter; exportierter Hook `openProfessorStarterSelection()`.
- `src/core/Game.js`: `setMenuOpen(boolean)` löscht gehaltene Eingaben; während offener Menüs keine Bewegung, Interaktion oder Portalprüfung.
- `src/ui/PokemonMenus.js` (neu): rein visuelle Darstellung und Starterauswahl, nutzt `registry.starterOptions()`, `team.assignStarter({speciesId,instanceId,level:5})`, `team.getMembers()` und `team.starterAssigned`.
- `tests/ui-009.test.js` (neu): sechs Tests zu Berechtigung, Einmaligkeit, Teamansicht, Menüsperre, Integration und Professor-Hook.
- `docs/TESTRESULT_009.txt`: automatisierter Testlauf.

## Schnittstellen
- `new PokemonMenus({root,registry,team,onOpenChange})` bindet DOM an bestehende Fachmodule.
- `pokemonMenus.openTeam()` öffnet die Teamansicht.
- `pokemonMenus.openStarterSelection()` öffnet Auswahl nur bei noch nicht vergebenem Starter, Rückgabe `boolean`.
- `openProfessorStarterSelection()` in `src/main.js` ist ein Integrationshook für die künftige Professor-Ereignissteuerung. Noch keine Ereignisverdrahtung.
- `Game.setMenuOpen(boolean)` sperrt Eingaben ohne `Input` oder `WorldSession` umzubauen.
- Der Teamzustand liegt derzeit nur im Speicher. SaveSystem-Anbindung ist ein separater Folgeauftrag; Neuladen setzt den Zustand zurück.

## Tests
`npm test`: 58 bestanden, 0 fehlgeschlagen (52 bestehende + 6 neue). Node-Tests sind kein Ersatz für reale Browserprüfungen.

## Offene Punkte / Chat 00 und Chat 01
- Chat 06/00: Professor-Dialog und konkretes Ereignis zum Aufruf des Hooks festlegen und implementieren.
- Chat 01: `Game.setMenuOpen` als neue UI/Engine-Schnittstelle bestätigen.
- Chat 09: spätere Persistenz des Teamzustands abstimmen.
- Test auf Desktop, iPhone Safari, Hoch-/Querformat, Vollbild und Touch-Steuerung ausstehend.
- Starterliste stammt ausschließlich aus dem kleinen vorhandenen Beispieldatensatz, nicht aus einer vollständigen Pokédex-Datenbank.
