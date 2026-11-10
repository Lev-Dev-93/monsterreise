# Übergabe 027 an Chat 00

- **Lieferung:** Vollständiger Integrationskandidat auf Basis 026, kein GitHub-Pages-Paket, keine Veröffentlichung.
- **Neu:** `src/world/maps/pokemonCenter.js`, `src/center/CenterWorldInteraction.js`, `tests/center-world-027.test.js`, `docs/POKEMON_CENTER_027.md`, `docs/HANDOFF_027.md`, `docs/TESTRESULT_027.txt`.
- **Geändert:** `src/world/maps/startVillage.js`, `src/world/WorldRegistry.js`, `src/main.js`, `src/renderer/Renderer.js`, `tests/world-v02.test.js`.
- **Schnittstellen:** Map-ID `pokemon-center`, NPC-ID `center-healing-station`, Portal `village-center-door` → `center-exit`; `centerWorldEvent(event,{team,canHeal,speciesRegistry,moveRegistry?})` delegiert an `healAtPokemonCenter` aus 026.
- **Tests:** `npm test` 184/184 bestanden, 0 fehlgeschlagen. Kein echter Desktop-/iPhone-Praxistest durchgeführt.
- **Abhängigkeiten:** Chat 05 optionales Grafik-/UI-Polishing; Chat 10 unabhängige Desktop-Prüfung; Chat 00/04 zentrale Kampfstatus-Schnittstelle klären.
- **Offen:** Endgültiges Center-Design und Dorfplatzierung; globale Kampfsperre; manuelle Browserabnahme.
- **Empfehlung:** Kandidat an Chat 10 für unabhängigen Desktop-Test geben, noch nicht veröffentlichen.
