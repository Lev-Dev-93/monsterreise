# Übergabe an Chat 00 – 034 G5/G6

**Status:** technischer 034-Entwicklungskandidat mit getrenntem DEV-Entry und lauffähig vorbereitetem Story-Kartentest; kein vollständiger Storymodus, keine Browser-Abnahme. G4b und Fachmodule zusammengeführt; keine Quellkonflikte.

**Neue Dateien:** `story-test.html`, `src/story-test.js`, `src/integration/StoryRebind.js`, `src/integration/StoryRuntime.js`, `tests/integration-034.test.js`, `docs/INTEGRATION_034_G5_G6.md`, `docs/HANDOFF_034_G5_G6.md`, `docs/TESTRESULT_034_G5_G6.txt`. Bestehendes `index.html`, `src/main.js`, 033-Tests und Legacy-Speicherformat unverändert.

**Schnittstellen:** `createStoryRuntime` injiziert echte Team-/Story-/Location-/Transitionsvalidatoren, Lease, Transaktionslock, Operationstickets, TrustedPortalAdapter und Coordinator; `prepareStoryRebind`/`applyStoryRebind` synchron; Route-1-Gate im Kartentest bewusst fail closed.

**Tests:** 311/311 Node-Tests bestanden (304 Paketstand + 7 neue gezielte Integrationstests); keine Browser-/DOM-E2E-Abnahme.

**Integrationsgrenzen:** keine kanonische Species-Policy, keine Starterparameter, keine Chat-05-Story-UI, kein produktiver StorySave-Rebind im Kartentest; Session-Lease/Recovery im Browser noch ungetestet. DEV bleibt unverändert.

**Entscheidungen:** Chat 00 muss Ausschlussliste/Starterdaten und UI-/Story-Gate freigeben; Chat 03/05/06/09 haben offene Arbeiten gemäß Integrationsbericht. Keine Veröffentlichung.
