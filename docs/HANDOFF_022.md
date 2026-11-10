# Übergabe an Chat 00 – Auftrag 022

Basis: 021A. Geändert: `src/ui/BattleView.js`. Neu: `tests/battle-stability-022.test.js`, `docs/INTEGRATION_022.md`, `docs/HANDOFF_022.md`, `docs/TESTRESULT_022.txt`.

Automatisiert: 146 bestanden, 0 fehlgeschlagen. Desktop-Praxistest nicht ausgeführt; iPhone-Praxistest bewusst ausgesetzt.

Schnittstellen: `BattleView.choose()` prüft KI-Verfügbarkeit vor Aktion; Commit-Fehler sperren weiter. Bestehende `Battle`, `Team`, `SaveSystem` unverändert.

**Entscheidung nötig:** Vollständiger AP-Verbrauch/fehlende unterstützte Attacken (z. B. Verzweifler). Bis zur Freigabe kein endgültiger Fallback. Laufende Kämpfe können dadurch sicher blockiert bleiben. Bei fehlgeschlagenem Commit kein Reload, sondern Ursache beheben und Commit erneut versuchen.
