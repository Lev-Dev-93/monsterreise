# Auftrag 013 – Battle Phase 1 (v0.4)

## Verbindlich aus Projekthandbuch Master 1.0
Kapitel 17: klassische rundenbasierte Kämpfe, anspruchsvolle Schwierigkeit, Trainerstrategien, kein Level-Scaling. Kapitel 30: Attacken, Statuswerte, Erfahrung, Fangen und Trainerkämpfe als Ausbauziele. Die konkrete Schadensformel, Typentabelle, Initiative-Gleichstand, KP- und Initiative-Statformel sind nicht festgelegt.

## Implementiert
`src/battle/Battle.js`: UI-freie Kampfsitzung für genau eine aktive Instanz pro Seite. Nutzt unverändert Pokémon-Objekte aus `src/pokemon/Pokemon.js`, mutiert ausschließlich deren `currentHp`. Runden werden nach je einer Attackenaktion beider Seiten aufgelöst, höhere Initiative zuerst. KO stoppt Gegenaktionen; Ergebnis `player`, `opponent`, `draw` oder `null`. Ereignisse für spätere UI-Anbindung. Kein Level-Scaling.

## Schnittstelle
`createBattle({playerPokemon, opponentPokemon, maxHp, speed, damage, tieBreaker?})` gibt `Battle` zurück. `maxHp(pokemon)` und `speed(pokemon)` liefern ganze Zahlen; `damage({attacker,defender,moveId,round,side})` liefert nichtnegativen ganzzahligen Schaden; `tieBreaker({pokemon,round})` liefert `player` oder `opponent` bei Gleichstand. Diese Callbacks sind ausdrücklich **Integrationsadapter**, keine festgelegten Kampfregeln. `battle.submitAction('player'|'opponent',{type:'move',moveId})` nimmt nur dem Pokémon bekannte Attacken-IDs an. `battle.getState()` liefert Rundenzahl, Ergebnis, KP, ausstehende Seiten und Ereignisse. `battle.pokemon` referenziert Originalinstanzen.

## Offene Entscheidungen
- KP-/Initiative-Berechnung aus Basiswerten, IV, EV und Level
- Typeneffektivität, physischer/spezieller Schaden, STAB, Genauigkeit, Priorität, Zufall, kritische Treffer
- Status, AP, Items, Wechsel, Flucht, Erfahrung und Mehrfachteams
- Gleichstandsregel, Trainer-KI, wilde Begegnungen und Fangformel

## Integration
Keine Änderungen an Game, World, UI, Team, SaveSystem. Kampfstart erfolgt später durch Game/World; UI kann Ereignisse lesen. KI soll Gegneraktionen einreichen; Fangmechanik später als eigene Aktion/Service. Aktuelle API erfordert vom Aufrufer ausdrücklich bereitgestellte Rechenregeln. Für diese Phase nur `move`-Aktionen. Hinweis: Fehler aus benutzerdefinierten Regel-Callbacks können während der Rundenauflösung auftreten; diese Callbacks müssen deterministisch und valide sein.

## Tests
`npm test` führt sämtliche vorhandenen Tests plus `tests/battle-013.test.js` aus; Protokoll `docs/TESTRESULT_013.txt`.
