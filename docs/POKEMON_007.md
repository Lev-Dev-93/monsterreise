# Auftrag 007 – Pokémon-Grundsystem (Phase 1)

## Grundlage
Projekthandbuch Master 1.0, Kapitel 13–18; `docs/ARCHITECTURE.md`; Integrationskandidat v0.2.3.

## Dateigrenzen
- `src/pokemon/Pokemon.js`: Datenmodell und reine Funktionen, keine UI-/Welt-/Battle-Abhängigkeit.
- `src/pokemon/sampleData.js`: sechs exemplarische Stammdatensätze; kein vollständiger Pokédex.
- `tests/pokemon-007.test.js`: automatisierte Modultests.

## Öffentliche Schnittstellen
- `defineSpecies(input)`: validierte Stammdaten einer Art.
- `createRegistry(species[])`: `{get(speciesId), list(), starterOptions()}`.
- `createPokemon({registry,speciesId,instanceId,level,experience?,origin?,shiny?,iv?,ev?,moveIds?,nickname?,status?,currentHp?})`: individuelle Instanz.
- `perfectIVs()` / `randomIVs(rng?)`: IV-Erzeugung; RNG liefert Werte in [0,1).
- `evolutionTargets(registry,speciesId)`: mögliche Folgearten, **keine** Entwicklungsprüfung.
- `serializePokemon(instance)` / `deserializePokemon(saved,registry)`: JSON-fähiger Save-Payload / validierte Rekonstruktion.
- `STAT_KEYS`: `hp`, `attack`, `defense`, `specialAttack`, `specialDefense`, `speed`.

## Verbindliche Regeln umgesetzt
Starter nur explizit zugelassene Basisformen aus Generation 1–4, ohne legendäre/mystische Arten; Starter-IV und Shiny-IV stets 31 in allen sechs Werten. Wilde IVs zufällig 0–31. Die Starterberechtigung ist **explizites Stammdatenfeld**, keine unzuverlässige Ableitung aus Generation oder Entwicklungsverweisen.

## Integration mit Battle / Save / Pokédex
Battle kann Stammdaten per `registry.get(pokemon.speciesId)` lesen und die individuelle Instanz verarbeiten. **Keine** Schadens-, KP- oder Erfahrungsformeln implementiert. SaveSystem speichert ausschließlich serialisierte Instanzen; Stammdaten bleiben im Register und werden über `speciesId` referenziert. Pokédex kann Stammdaten über `registry.list()` lesen; Gesehen/Gefangen-Zähler gehören **nicht** in Pokémon-Stammdaten. `instanceId` wird vom aufrufenden System vergeben; Eindeutigkeit über mehrere Instanzen muss dort geprüft werden.

## Noch offene Entscheidungen / technische Platzhalter
- Erfahrungskurven, Maximallevel, Levelaufstiegslogik, Statuswertformeln, EV-Grenzen, Kampfeffekte, PP und Attacken-Lernregeln.
- Entwicklungsbedingungen einschließlich Ersatz für Handelsentwicklungen.
- Vollständige Starterliste und Arten-/Formenregister, vollständige Attacken, Ei-Gruppen, Wesen und Zuchtmechanik.
- `origin`, `moveIds`, `status`, `currentHp` sind Datenfelder ohne implementierte Spielmechanik; `currentHp=null` bedeutet noch nicht berechnet.
- Sample-Arten enthalten Entwicklungsverweise auf noch nicht erfasste Arten. Sie werden bewusst nicht als vollständige Entwicklungsketten ausgegeben.

## Tests
`npm test` im entpackten Projektordner ausführen. Keine Änderung an Engine, Bewegung, Welt, UI oder Renderer. Keine automatische Initialisierung in `src/main.js`; damit keine sichtbaren Pokémon im Spiel.
