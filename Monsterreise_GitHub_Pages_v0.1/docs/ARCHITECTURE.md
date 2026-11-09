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
