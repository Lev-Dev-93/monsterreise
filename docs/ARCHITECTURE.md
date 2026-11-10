# Architektur – Arbeitsentwurf

Quelle: Projekthandbuch v1.0, Kapitel 2 und 30. Die konkrete Engine bleibt offen.

## Verantwortung
- core/Game: Start, Szenen- und Zustandskoordination.
- player/Player: Position und Bewegung.
- world/World: Karten, Übergänge und Interaktionen.
- renderer/Renderer: visuelle Darstellung, keine Spielregeln.
- ui/UI: Menüs, Eingabeoberfläche und Anzeigen.
- dialog/Dialog: Gespräche und Ereignissteuerung.
- pokemon/Pokemon: Datenmodelle und Eigenschaften.
- battle/Battle: rundenbasierte Regeln und Kampfablauf.
- inventory/Inventory: Gegenstände und Bestände.
- pokedex/Pokedex: Gesehen/Gefangen und Forschungsdaten.
- quests/QuestSystem: Queststatus und Fortschritt.
- save/SaveSystem: drei getrennte Spielstände und Autosave.
- audio/Audio: Musik und Effekte, getrennte Lautstärken.
- time/TimeSystem: Tageszeit, Kalender, Jahreszeiten.
- weather/WeatherSystem: regionales Wetter.

## Integrationsvertrag (vorläufig)
- Fachmodule liefern Daten/Ereignisse, Renderer und UI stellen sie dar.
- Welt- und Kampfzustand werden getrennt gehalten.
- Daten in JSON dürfen nicht mit laufenden Spielstandsdaten verwechselt werden.
- Schnittstellen werden vor Implementierung in diesem Dokument konkretisiert.
- Kein Modul importiert zyklisch ein anderes.

## Auftrag 008 – Team
- `pokemon/Team.js` verwaltet bis zu sechs Instanzen aus `pokemon/Pokemon.js`; keine UI-/Battle-/World-Imports.
- UI liest Kopien via `getMembers()`; SaveSystem erhält JSON via `toSaveData()` und rekonstruiert via `restoreTeam()`.
- PC-Übergaben, Kampfzustandsprüfung und spielstandweite ID-Vergabe verbleiben bei späteren Integrationsschichten.

## Auftrag 010 – Professor-Testbegegnung
`dialog/ProfessorEncounter` interpretiert das `WorldSession`-Dialogereignis `professor-test` und ergänzt ein Abschlussereignis. `Game` koordiniert dessen Ausführung nach Schließen des Dialogs; `main.js` verbindet es mit dem bestehenden Starter-Hook. Die Startervergabe bleibt ausschließlich in `Team.assignStarter()` über `PokemonMenus`. Dies ist eine vorläufige Testszene, keine kanonische Story-Implementierung.

## Integration 012 – Positionsspeicherung (v0.3.1)
`save/SaveSystem` speichert optional `location` im bestehenden Slot-Datensatz: `{mapId,x,y,facing,returnPositions}`. Weltpixel und Rückkehrpunkte werden anhand `world/WorldRegistry` validiert. `core/Game` erstellt/übernimmt den Positions-Snapshot; `world/WorldSession` bleibt Eigentümer von Karten-ID und Rückkehrstapel. Bestehende Team-only-Speicherstände sind lesbar. Details: `docs/INTEGRATION_012.md`.

## Auftrag 019 – Battle-zu-Team-Übernahme
Die Teamverwaltung (`src/pokemon/Team.js`) verwaltet Kampfregistrierungen, zustandsgebundene Übernahme und persistierte Replay-IDs. Battle verändert nur die übergebene Kopie; UI und SaveSystem bleiben getrennt. Details: `docs/TEAM_BATTLE_019.md`.
