# Übergabe 026 an Chat 00

**Basis:** vollständiger Integrationskandidat 025; kein GitHub-Deployment.
**Geändert:** `src/pokemon/Team.js`.
**Neu:** `src/center/PokemonCenter.js`, `tests/center-026.test.js`, `docs/POKEMON_CENTER_026.md`, `docs/TESTRESULT_026.txt`, `docs/HANDOFF_026.md`.
**Unverändert:** Pokémon-Modell, Starter-Movesets 025, BattleView, SaveSystem, Welt, Karten, Dialoge, UI.
**Schnittstellen:** `team.healAll({calculateMaxHp?,moveRegistry?})` und `healAtPokemonCenter({team,canHeal,calculateMaxHp?,moveRegistry?})`.
**Tests:** `npm test`: 175 bestanden, 0 fehlgeschlagen (7 neu). Alte 024-Testspielstände und bestehende Battle-/Struggle-Tests bleiben grün.
**Noch nicht bedienbar:** Center-Weltinteraktion und UI-Bestätigung; Chat 02/05 müssen anbinden, ohne Position/Dialog eigenmächtig festzulegen.
**Offen:** zentrale Sperre für andere künftige Kampfmodi, explizite KP-Formel bei Legacy-null-KP, verbindliches Attackenregister bei künftig erweiterten Movesets. `docs/STATUS.md` fehlt im 025-ZIP.
