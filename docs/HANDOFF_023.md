# Übergabe an Chat 00 – Auftrag 023

**Basis:** Auftrag 022, vollständiger Integrationskandidat. **Status:** Implementiert und automatisiert geprüft; Desktop-Praxistest und Integrationsfreigabe ausstehend.

**Geändert:** `src/battle/Battle.js`, `src/battle/BattleRules.js`, `src/battle/TrainerBattle.js`, `src/ui/BattleView.js`, `tests/battle-015.test.js`, `tests/battle-stability-022.test.js` (alte Erwartungen an AP=0 auf die neue verbindliche Regel aktualisiert).

**Neu:** `tests/struggle-023.test.js`, `docs/INTEGRATION_023.md`, `docs/HANDOFF_023.md`, `docs/TESTRESULT_023.txt`.

**Schnittstellen:** `STRUGGLE_MOVE_ID`, `Battle.hasUsableMove(side)`, Ereignis `recoil`. Vorhandene Team- und Speicher-Schnittstellen unverändert.

**Tests:** 152 bestanden, 0 fehlgeschlagen. Neue Tests für beide Seiten, AP, Schaden, Rückstoß, Ergebnisse und Team-Speicherrunde. Vorhandene Regressionstests wurden ausgeführt; zwei alte AP=0-Erwartungen mussten der neuen Regel entsprechend angepasst werden.

**Offen:** Schutz-/Immunitätseffekte, spätere besondere Effekte, manuelle Desktop-Integration. iPhone-Praxistests ausgesetzt.
