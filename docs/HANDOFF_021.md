# Übergabe an Chat 00 – Auftrag 021

**Ergebnis:** Vorläufiger Testspielstand-Dialog, nur auf explizit leerem Platz; Evoli Level 5 mit vorläufigem Tackle, initialisierten KP/AP; normaler Team-/Trainerkampf-/Speicherablauf.

**Dateien:** `src/ui/TestSaveMode.js` (neu), `src/main.js`, `index.html`, `styles.css`, `tests/test-save-021.test.js` (neu), `docs/INTEGRATION_021.md`, `docs/TESTRESULT_021.txt`.

**Schnittstellen:** Bestehende `createTeam`, `createPokemon`, `initializeHp`, `initializeMovePp`, `SaveSystem.load/save`, `loadSlot`, `Game.setMenuOpen`. Keine Engine- oder Regeländerung. Chat 01: bitte Menüsperre/Touch nachprüfen.

**Automatisierte Tests:** `npm test`; Ergebnis in `docs/TESTRESULT_021.txt`.

**Offen:** Praktische Tests Desktop/iPhone, Querformat, Fullscreen-Fallback, Trainerkampf und Save-Reload; parallele Tabs vermeiden (kein atomarer SaveSystem-Schreibschutz). Keine automatische Heilung oder Speicherung nach Kämpfen.
