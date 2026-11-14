# Übergabe 029 – Chat 00 / Chat 10

**Basis:** Integrationskandidat 028, 184 Tests. **Änderung:** zentrale Runtime-Kampfsperre, kein geändertes Speicherformat.

**Neu:** `src/battle/BattleLock.js`, `tests/battle-lock-029.test.js`, `docs/BATTLE_LOCK_029.md`, `docs/HANDOFF_029.md`, `docs/TESTRESULT_029.txt`.

**Geändert:** `src/main.js`, `src/core/Game.js`, `src/world/WorldSession.js`, `src/ui/BattleView.js`, `src/center/PokemonCenter.js`, `docs/STATUS.md`.

**Schnittstellen:** `BattleLock.isBattleActive/acquire/release`; `bindTeamBattleLock`, `isTeamBattleLocked`; `Game.isBattleActive`; optionale `battleLock`-Injektion in `Game`, `WorldSession` und `BattleView`.

**Tests:** 199/199 bestanden, 15 neue Fälle; Tests 10–12 prüfen Lock-Freigabe je Ergebnisart, kein vollständiger Browser-End-to-End-Test.

**Offen:** unabhängige Prüfung Chat 10, Desktop-Test erst nach Bündelung 029–033, iPhone-Praxis ausgesetzt. Speicherregel bleibt wie zuvor: kein Speichern während Kampf. Kein Rollback von Kampfrunden bei technischen Fehlern.
