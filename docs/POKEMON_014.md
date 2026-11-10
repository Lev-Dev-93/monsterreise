# Entwicklungsauftrag 014 – Kampfwerte und Attackendaten

## Grundlage und Status
Basis: Integrationskandidat 013 v0.4, Projekthandbuch Master 1.0, bestehende `src/pokemon/Pokemon.js`-Instanzen und `src/battle/Battle.js`.
Das Handbuch legt sechs Werte und sechs IVs (Starter/Shiny je 31), Attacken-Lernwege und Typen fest, **nicht** jedoch eine numerische KP-/Statuswert-/Schadensformel, EV-Grenzen, Erfahrungsformel oder konkrete Typentabelle. Keine dieser offenen Regeln wird verbindlich vorweggenommen.

## Neue Dateien
- `src/pokemon/CombatData.js`: Attackenmodell, Typenliste, Kampfwert-Eingaben, Formel-Injektion, Battle-Adapter und Typenfaktor-Schnittstelle.
- `src/pokemon/sampleMoves.js`: vier illustrative Attacken (vorläufige Zahlen; keine finale Balance).
- `tests/pokemon-014.test.js`: automatische Regressionstests.

## Schnittstellen
- `defineMove(data)` und `createMoveRegistry(entries)` – reine Attacken-Stammdaten, keine Spielstandsmutation. `moveId`, `name`, `type`, `category`, `power`, `accuracy`, `pp`, `priority`, `effectId`.
- `getStatInputs(pokemon, speciesRegistry)` – Kopien der sechs Basiswerte, IVs und EVs sowie Level. Keine Berechnung.
- `calculateBattleStats(pokemon, speciesRegistry, formula)` – `formula({stat,base,iv,ev,level,pokemon})` wird pro Wert aufgerufen; numerische Regeln werden ausdrücklich extern bestimmt.
- `createBattleStatAdapters(speciesRegistry, formula)` – liefert `{maxHp, speed}` passend zum bestehenden `createBattle({playerPokemon,opponentPokemon,maxHp,speed,damage,tieBreaker})`.
- `typeEffectiveness(attackType, defenderTypes, resolver)` – delegiert an expliziten Typen-Resolver, keine heimliche Effektivitätstabelle.
- `damage({attacker,defender,moveId,round,side})` – weiterhin Battle-013-Schnittstelle. Auflösung der `moveId` über Attackenregister und Schadensformel bleibt Aufgabe des Kampfsystems.

## Kompatibilität
`Pokemon.js`, `Battle.js`, `SaveSystem.js`, `Game.js`, Starterauswahl, Welt, Renderer und UI sind unverändert. Neue Module sind opt-in. Bestehende `serializePokemon`/`deserializePokemon`-Daten bleiben unverändert. Keine neue Pokémon-Instanzstruktur.

## Offene Entscheidungen für Chat 00
1. Statuswertformeln (inkl. Wesen, Rundung), EV-Obergrenzen und EV-Verteilung.
2. Levelgrenze und Erfahrungskurven.
3. Finale Typen-Effektivitätstabelle und eventuelle Sonderregeln.
4. Attackenwerte, Genauigkeit, Priorität, Effekte, AP-Verbrauch und Lernlisten.
5. Schadensformel, STAB, Zufallsfaktor, Kritische Treffer und Gleichstandsregel.

## Tests
`npm test` im Projektverzeichnis. Resultate in `docs/TESTRESULT_014.txt`.
