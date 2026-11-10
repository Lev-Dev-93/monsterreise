# Übergabe an Chat 00 – Auftrag 018

Basis: Integrationskandidat 017, v0.4.
Geändert: `src/pokemon/Pokemon.js`, `src/battle/Battle.js`.
Neu: `tests/pokemon-018.test.js`, `docs/POKEMON_018.md`, `docs/TESTRESULT_018.txt`, `docs/HANDOFF_018.md`.
Schnittstellen: `initializeHp`, `initializeMovePp`, `applyHpLoss`, `healHp`, `consumePp`, `restorePp`; persistente `maxHp`, `currentHp`, `movePp`.
Tests: 116/116 bestanden; 9 neue Tests. Kein manueller Browsertest.
Keine Änderungen an SaveSystem, Welt, Steuerung, Story oder UI.
Wichtig: Battle verändert übergebene Instanzen; Team gibt Kopien zurück. Explizite Commit-Schnittstelle für Kampfergebnisse bleibt offen.
Offen: HP-Formel, HP-Maximum bei Leveländerung, PP-Sonderregeln, Team-Commit.
