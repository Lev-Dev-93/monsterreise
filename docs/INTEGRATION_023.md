# Auftrag 023 – Verzweifler

## Verbindliche Implementierung
- `STRUGGLE_MOVE_ID = 'struggle'` ist eine interne Kampfaktion und **kein** Eintrag im regulären Attackenregister oder der Pokémon-Lernliste.
- `Battle.hasUsableMove(side)` prüft auf unterstützte Schadensattacken mit positiven AP. Sind keine vorhanden, wird jede eingereichte Attackenaktion automatisch in Verzweifler umgewandelt. Direkte Verzweifler-Aktionen werden nur in diesem Zustand akzeptiert.
- Stärke 50, physische Berechnung mit Angriff/Verteidigung, **typenlos**, kein STAB, keine Typeneffektivität, keine AP, keine Genauigkeitsprüfung. Der vorhandene Zufallsfaktor 85–100 % wird angewandt; Krit-Würfe werden nicht ausgeführt. Keine Sonderwirkungen.
- Rückstoß `min(aktuelleKP, max(1, floor(maximaleKP/4)))` **nach** dem Treffer. Bei gleichzeitigem KO ist das Ergebnis `draw`. Ein kampfunfähiges Pokémon handelt nicht.
- Die bisherige Rundungsregel für normalen Schaden bleibt unverändert. Verzweifler: Basisformel, dann `floor(Basis * Zufallsprozent / 100)`; mindestens 1 Schaden.
- `chooseOpponentMove()` gibt bei fehlenden einsetzbaren Attacken `'struggle'` zurück. `BattleView` zeigt Verzweifler nur in diesem Fall; `openTrainerBattle` akzeptiert auch vollständig erschöpfte AP.
- KP und AP werden weiterhin ausschließlich durch bestehendes `team.applyBattleResult` nach `battle.finished` übernommen. Rückstoß-KP werden damit erfasst. Kein neues Speicherformat.

## Schnittstellen
- Neu: `STRUGGLE_MOVE_ID`, `Battle.hasUsableMove(side)`.
- Bestehend: `createBattle`, `submitAction`, `getState`, `createClassicBattleOptions`, `chooseOpponentMove`, `BattleView`, `beginBattleSync` und `applyBattleResult`.
- Neues Ereignis: `{type:'recoil',round,side,damage,targetHp}`.
- `submitAction` akzeptiert bei vollständig fehlenden nutzbaren AP weiterhin eine `move`-Aktion und normalisiert sie zu `struggle`; für die Oberfläche kann direkt `moveId:'struggle'` verwendet werden.

## Einschränkungen / offene Fragen
- Keine Schutz-, Fähigkeiten-, Wetter- oder Feldeffekte vorhanden; deren Interaktion mit Verzweifler bleibt offen.
- Die Definition „keine einsetzbare Attacke“ umfasst hier die **bereits implementierten Schadensattacken**; Statusattacken ohne Effektlogik gelten als nicht einsetzbar.
- Technische Fehler während einer Runde werden nicht durch ein Transaktions-/Rollback-System abgesichert; bestehende Ergebnisübernahme-Fehlersperre aus 022 bleibt erhalten.
- Keine manuelle Desktop-Freigabe; iPhone-Praxistests ausgesetzt.

## Desktop-Praxistest
1. Projekt lokal mit `npm run start` starten, im Desktop-Browser öffnen und vorhandenen Testspielstand laden.
2. Mit einem kampffähigen Pokémon und regulären AP den Testtrainer ansprechen; normale Attacke verwenden und AP-Verbrauch prüfen.
3. Einen separaten Testspielstand mit AP=0 für sämtliche Attacken vorbereiten, Testtrainer ansprechen. „Verzweifler“ muss sichtbar sein, der Gegner bei AP=0 ebenfalls handeln.
4. Rückstoß-KP, Rundenzahl und Kampfende (Sieg/Niederlage/Unentschieden) prüfen. Nach Ende schließen; Weltposition und Steuerung prüfen.
5. Team-KP und AP prüfen, regulär speichern und neu laden. Werte müssen erhalten bleiben; keine automatische Heilung.
6. Nachweis der bestehenden Eingabesperre während des Kampfes und Verhalten bei absichtlich provoziertem Synchronisationsfehler prüfen.
