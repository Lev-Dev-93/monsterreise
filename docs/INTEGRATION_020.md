# Auftrag 020 – Kampfergebnisse

## Ablauf
`BattleView.openTrainerBattle()` sucht das erste Teammitglied mit KP > 0 (oder noch nicht initialisierten KP) und mindestens einer unterstützten Attacke mit AP. Es erzeugt eine browserkompatible Kampf-ID (`crypto.randomUUID` falls verfügbar, sonst Zeitstempel, Sequenz und Zufall), ruft `team.beginBattleSync(instanceId,battleId)` auf und übergibt ausschließlich die zurückgegebene Kopie an `createTrainerTestBattle({playerSnapshot})`. Die bestehende Battle-Engine initialisiert fehlende KP/AP nur auf dieser Kopie. Nach `battle.finished` übernimmt `commitTrainerResult()` einmalig ausschließlich `currentHp`, `maxHp`, `movePp` via `team.applyBattleResult`. Vorher kann die Welt nicht entsperrt werden. `cancelTrainerBattle()` verwirft einen technisch abgebrochenen laufenden Kampf über `team.cancelBattleSync`.

`Team.toSaveData()` und `restoreTeam()` speichern/laden die übernommenen Werte über das bestehende SaveSystem. Der laufende Kampf selbst wird nicht gespeichert. Team-Menü zeigt KP und gespeicherte AP an. Die alte manuelle Testkampffunktion bleibt ohne Persistenz erhalten.

## Einschränkungen
- Starter aus älteren Spielständen können `moveIds: []` besitzen. Für diese wird **kein** persistenter Trainerkampf gestartet, bis gültige Attacken über ein späteres verbindliches Lernsystem vergeben wurden. Keine erfundene Attackenliste und kein stiller Team-Eingriff.
- Trainerkämpfe mit fehlenden Gegner-AP/unterstützten Attacken oder ohne nutzbare Spielerattacke benötigen später eine explizite Struggle-/Abbruchregel.
- `crypto.randomUUID` ist der bevorzugte ID-Weg; Fallback ist browserkompatibel und pro laufender Sitzung durch Zähler unterscheidbar, aber nicht kryptografisch garantiert eindeutig über beliebige Sitzungen. Das Team weist wiederverwendete IDs zurück.
- Keine automatische Heilung; kein automatisches Speichern nach dem Kampf. Nutzer speichert über das vorhandene Menü.
- Nach einem technischen Fehler bei `applyBattleResult` bleibt das Kampfpanel gesperrt; es wird nicht stillschweigend entsperrt.

## Manuelle Prüfung Desktop / iPhone
1. Lokalen Server mit `npm start` starten, auf Desktop oder iPhone über dieselbe lokale Adresse öffnen.
2. Speicherplatz mit einem Pokémon wählen, das eine gültige Schadensattacke in `moveIds` hat; andernfalls ist der Trainerkampf bewusst nicht startbar.
3. Im Dorf den vorläufigen Trainer ansprechen, Dialog abschließen, Kampf spielen; prüfen, dass Weltbewegung, Team- und Speicheraktionen gesperrt bleiben.
4. Nach Sieg/Niederlage Schließen wählen, Teammenü öffnen und KP/AP vergleichen. Keine Heilung erwarten.
5. Speichern, Browser neu laden, denselben Speicherplatz laden und KP/AP erneut prüfen.
6. Mit 0 KP erneut Trainer ansprechen: kampfunfähiges Pokémon darf nicht ausgewählt werden. Test auf iPhone mit Touch-Steuerung wiederholen.

## Tests
`node --test tests/*.test.js` – siehe `docs/TESTRESULT_020.txt`. Automatisierte Regression inklusive Welt/Professor/Touch; echter iPhone-Praxistest nicht durchgeführt.
