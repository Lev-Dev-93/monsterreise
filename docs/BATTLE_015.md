# Auftrag 015 – Klassische Kampfberechnungen (v0.4)

## Verbindliche Regeln und Umsetzung
- `src/battle/BattleRules.js`: `classicStat`, `modernTypeEffectiveness`, `classicDamage`, `createClassicStatAdapters`, `createClassicBattleOptions`.
- Statuswerte: Gen-III-Formeln mit Ganzzahlabrundung, Wesen 0.9/1/1.1; EV pro Wert 252, gesamt 510, IV 0–31. Starter-/Shiny-IV unverändert.
- Moderne 18-Typen-Tabelle, zwei Verteidigertypen werden multipliziert; Immunität = 0.
- Schaden: Basis = floor(floor(floor(2*Level/5+2)*Stärke*Angriff/Verteidigung)/50)+2; danach nacheinander floor für STAB, Typ, Krit und Zufall 85–100 %. Bei positivem Typfaktor mindestens 1. Dies ist eine **vereinfachte** Modifikator-Reihenfolge, keine exakte Generation-III- oder -IX-Implementierung.
- Kritische Treffer: optionaler `criticalChance` (standardmäßig 0; kein unbeschlossener fester Krit-Satz), Faktor 1.5. RNG injizierbar; Werte in [0,1).
- Attacken: Register aus `CombatData.js`; Status-/Effektattacken werden vor Annahme zurückgewiesen. Genauigkeit `null` bedeutet keine Trefferprüfung; Genauigkeit 1–100. AP werden beim tatsächlichen Ausführen vor Genauigkeitswurf verbraucht, auch bei Fehlschlag. Nicht ausgeführte Aktionen nach Kampfende verbrauchen keine AP.
- Reihenfolge: Priorität, dann Initiative, dann pro Runde injizierter Zufallsentscheid. Bestehende `tieBreaker`-Option weiterhin nutzbar.

## Schnittstellen
`createClassicBattleOptions({speciesRegistry,moveRegistry,rng?,natureFactors?,criticalChance?})` liefert `maxHp`, `speed`, `stats`, `damage`, `tieBreaker`, `moveRegistry`, `rng` für `createBattle({playerPokemon,opponentPokemon,...options})`.
`natureFactors` ist eine Zuordnung pro Stat oder eine Funktion `(pokemon)=>({attack:1.1,...})`; mangels Wesensfeld in `Pokemon.js` Standard neutral.
`classicDamage({attacker,defender,move,attackerStats,defenderStats,attackerTypes,defenderTypes,rng?,critical?})` ist separat testbar.
`Battle.submitAction(side,{type:'move',moveId})` und `getState()` bleiben kompatibel. `getState()` ergänzt `remainingPp` und Ereignistyp `move-miss`.
Legacy-Modus ohne `moveRegistry` bleibt erhalten (injizierte Schaden-/Initiativeregeln, keine AP-/Genauigkeitslogik).

## Einschränkungen / offene Entscheidungen
- AP-Zustand ist **sitzungslokal**, da `Pokemon.js` nur `moveIds` besitzt; keine Änderung am Save-Schema. Persistenz zwischen Kämpfen und Wiederherstellung von AP sind offen.
- Wesen sind nicht Bestandteil bestehender Pokémon-Instanzen; Faktor wird extern injiziert. Ninjatom wird explizit als nicht unterstützt zurückgewiesen.
- Keine Statusattacken, Sekundäreffekte, Fähigkeiten, Items, Wetter, Feld, Erfahrung, Fangmechanik, KI, Wechsel oder Flucht.
- Kein automatisches Verzweifler-Verhalten bei erschöpften AP; zukünftige Entscheidung nötig.
- `sampleMoves.js` bleibt ausdrücklich Testdatenbestand, keine endgültige Attackendatenbank.
- Bestehende Speicherstände mit EV >252 je Wert oder >510 gesamt werden bei Deserialisierung nun abgelehnt; Migration/Validierungsstrategie ist mit Chat 00 zu klären. Regelkonforme bestehende Spielstände behalten ihr Format.
- Keine endgültige Entscheidung zu kritischer Trefferwahrscheinlichkeit oder Wesen-Verteilung.

## Tests
`npm test` – vollständiges Ergebnis in `docs/TESTRESULT_015.txt`. Typen: alle 324 Einzelkombinationen validiert, Referenzfälle und doppelte Schwäche geprüft. Tests umfassen Formeln, Grenzwerte, Schaden, Priorität, RNG, AP, Genauigkeit, Sieg/Niederlage und bestehende Regressionstests.
