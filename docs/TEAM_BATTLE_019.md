# Auftrag 019 – Sichere Kampfzustandsübernahme

## Grundlage und Kopiersemantik
`Team.getMembers()` und `Team.getMember()` liefern serialisierte, getrennte Kopien. `Battle` mutiert die ihm übergebene Pokémon-Instanz. Ohne explizite Übernahme bleibt der Teamzustand unverändert. `Pokemon.js`, `Battle.js`, `BattleView.js` und `SaveSystem.js` wurden nicht verändert.

## Integration für Chat 04
```js
const {battleId, pokemon} = team.beginBattleSync(instanceId, uniqueBattleId);
// pokemon als playerPokemon an createBattle übergeben; Battle mutiert diese Kopie.
// Erst wenn battle.finished === true:
team.applyBattleResult({
  battleId, instanceId,
  currentHp: pokemon.currentHp,
  maxHp: pokemon.maxHp,
  movePp: pokemon.movePp
});
// Danach kann SaveSystem.save(slot, team) wie bisher aufgerufen werden.
```
`uniqueBattleId` muss pro Spielstand und Kampf eindeutig sein (z. B. UUID aus Integrationsschicht). Ein erneuter Aufruf mit derselben ID wird abgelehnt. `beginBattleSync` muss **vor** der Battle-Konstruktion erfolgen, da diese KP/AP initialisiert. Bei Abbruch `team.cancelBattleSync(instanceId,battleId)` aufrufen. Der Aufrufer muss sicherstellen, dass der Kampf tatsächlich beendet ist; Team prüft ausschließlich die Zustandsdaten, nicht den Battle-Sieg.

## Validierung
- Nur `currentHp`, `maxHp`, `movePp` akzeptiert; keine beliebigen Pokémon-Felder.
- KP/AP ganzzahlig und innerhalb der Grenzen; kein KP- oder AP-Zuwachs durch diesen ausschließlich für Kampfverbrauch gedachten Pfad.
- Bereits gespeicherte KP-Maxima/AP-Maxima dürfen nicht verändert werden; erstmalige Initialisierung aus `null` ist möglich.
- Alle gelernten Attacken müssen einen AP-Eintrag haben; keine fremden Attacken.
- Unbekannte Instanz-ID, fehlende aktive Kampfregistrierung, doppelte Kampf-ID und parallele Sitzungen desselben Teammitglieds werden abgewiesen.
- Prüfung und Ersetzung erfolgen erst nach vollständiger Validierung, ohne Teilupdates.
- `getMembers()` bleibt eine Kopie. Es gibt keine automatische Heilung.

## Speicherung
`toSaveData()` enthält zusätzlich `battleSync: {revisions, consumed}`. `restoreTeam` akzeptiert ältere Teamdaten ohne `battleSync`. `SaveSystem` nutzt weiterhin Version 1 und serialisiert die Teamdaten unverändert. Bereits übernommene Kampf-IDs bleiben nach Save/Load gesperrt. Aktive Kampfregistrierungen werden **nicht** persistiert; ein während des Kampfes gespeicherter Spielstand kann dessen Ergebnis nach dem Laden nicht übernehmen. Chat 09 sollte Speichern während eines laufenden Kampfes über die UI verhindern.

## Einschränkungen / offene Entscheidungen
- Keine kryptografische Authentifizierung: Ein manipulierter Client kann Daten selbst fälschen; lokale Plausibilitätsprüfung ist kein Anti-Cheat-System.
- Der Abschluss eines Kampfes wird vom Aufrufer bestätigt, nicht vom Team selbst verifiziert. Chat 04 muss `battle.finished` prüfen.
- Der Pfad unterstützt ausschließlich HP/AP-Verbrauch, keine Heilung, Levelaufstiege, neue Attacken, Statusänderungen oder Wechsel mehrerer Teammitglieder in einem Kampf.
- `consumed` wächst mit jeder Kampf-ID; eine spätere begrenzte Replay-Historie braucht ein abgestimmtes Migrationskonzept.
- Die Definition der eindeutigen Kampf-ID und mögliche Kampfwechsel/Mehrfachteilnehmer sind mit Chat 04/00 abzustimmen.
- `maxHp` und AP-Maxima bleiben bei späteren Level-/Attackenänderungen gesondert zu behandeln.

## Tests
`npm test`: 127 bestanden, 0 fehlgeschlagen; davon 11 neue Tests in `tests/team-019.test.js`. Keine manuelle Browserprüfung.
