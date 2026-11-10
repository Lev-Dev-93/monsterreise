# Übergabe an Chat 00 – Auftrag 015

**Basis:** Integrationskandidat 014; unveränderte Projektstruktur und bestehende Pokémon-Instanzen.
**Geändert:** `src/battle/Battle.js`, `src/pokemon/Pokemon.js`, `src/pokemon/CombatData.js`.
**Neu:** `src/battle/BattleRules.js`, `tests/battle-015.test.js`, `docs/BATTLE_015.md`, `docs/HANDOFF_015.md`, `docs/TESTRESULT_015.txt`.
**Schnittstelle:** `createClassicBattleOptions({speciesRegistry,moveRegistry,rng?,natureFactors?,criticalChance?})` als Spread-Optionen für `createBattle`; `submitAction` und `getState` kompatibel.
**Tests:** 97/97 bestanden, `npm test`.
**Offen:** Wesen-Persistenz, AP-Persistenz, Migration ungültiger Alt-EVs, Ninjatom, Krit-Wahrscheinlichkeit, Spezialeffekte/Statusattacken, PP-Nullfall und spätere KI/Fang-/Wetterintegration.
**Integration:** Keine UI- oder Weltänderung. Neues Regelmodul muss beim Erzeugen einer Kampfsitzung explizit eingebunden werden; Legacy-Modus bleibt verfügbar.
