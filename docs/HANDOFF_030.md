# Übergabe Auftrag 030 – Chat 00 und Chat 10

Basis: Integrationskandidat 029 (199/199 Tests laut Ausgangsauftrag); keine Engine-/Welt-/Save-Änderungen.

Geändert: `src/pokemon/starterMoves.js`, `src/pokemon/sampleMoves.js`, `tests/starter-moves-025.test.js` (historische Erwartung Riolu), `tests/pokemon-014.test.js` (Attackenanzahl 4 -> 5).
Neu: `tests/starter-moves-030.test.js`, `docs/STARTER_MOVES_030.md`, `docs/STARTER_DECISIONS_030.md`, `docs/HANDOFF_030.md`, `docs/TESTRESULT_030.txt`.

Schnittstelle `getStarterMoveIds` unverändert. Neues Test-Registry-Element `quick-attack`. Keine Änderungen an Pokémon-Instanzformat, Team-API, Battle, SaveSystem oder zentraler Kampfsperre.

Tests: 208/208 bestanden (9 neue). Kein manueller Desktop-Test; keine GitHub-Veröffentlichung.

Chat 00: A–D und Riolus Moveset sowie editionsgetreue Datenfreigabe entscheiden. Chat 10: Integrations-/Regressionstest mit 030-ZIP, insbesondere Startervergabe, AP und Verzweifler.
