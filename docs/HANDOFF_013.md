# Übergabe Chat 00 – Entwicklungsauftrag 013
Version: v0.4 Phase 1; Basis: Integrationskandidat v0.3.1 (Auftrag 012).
Neue Dateien: `src/battle/Battle.js`, `tests/battle-013.test.js`, `docs/BATTLE_013.md`, `docs/HANDOFF_013.md`, `docs/TESTRESULT_013.txt`.
Schnittstellen: `createBattle`, `Battle.submitAction`, `Battle.getState`; Berechnungs-Callbacks `maxHp`, `speed`, `damage`, optional `tieBreaker`.
Testergebnis: 79 bestanden, 0 fehlgeschlagen (`npm test`).
Integration: kein Import in Game, keine UI, kein Eingriff in Team oder Save. Pokémon-Instanzen bleiben die bestehende Datenstruktur.
Offen: KP-/Initiativeformel, Schaden, Typen, Gleichstand, AP, Status, Erfahrung, Trainer-KI, Fangregeln. Diese Regeln müssen vor produktiver Integration beschlossen werden.
