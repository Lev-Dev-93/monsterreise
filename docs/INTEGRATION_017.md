# Auftrag 017 – Vorläufiger Trainerkampf in der Spielwelt

## Umsetzung
- `src/world/maps/startVillage.js`: zusätzlicher, ausdrücklich vorläufiger Testtrainer bei Kachel (19,18), ohne Story-Relevanz.
- `src/battle/TrainerBattle.js`: Dialog-Anschluss, erstes kampffähiges Teammitglied, isolierte Kampfkopien und einfache deterministische Gegneraktion (erste gültige Schadensattacke mit AP).
- `src/ui/BattleView.js`: `openTrainerBattle()`, Gegneraktion automatisch nach Spieleraktion, Gegnerauswahl im Trainermodus ausgeblendet, Schließen erst nach Kampfergebnis.
- `src/main.js`: Welt-Event-Verknüpfung, Sperre von Speicherplatzwahl, Speichern, Team und Fallback-Knopf während Kampf.
- `index.html`: bisheriger Testkampf-Button ausdrücklich als Fallback gekennzeichnet.

## Schnittstellen
- `trainerWorldEvent(event,{team,startBattle})`: gibt unbetroffene Events unverändert zurück; für `trainer-test-017` Dialog mit `onComplete` zurück.
- `firstBattleReady(team)`: erstes Teammitglied mit `currentHp === null` oder `currentHp > 0`.
- `createTrainerTestBattle({team,registry,moveRegistry})`: bestehende `createBattle()` und `createClassicBattleOptions()`; Rückgabe `null`, wenn kein kampffähiges Mitglied.
- `chooseOpponentMove(battle,moveRegistry)`: erste verfügbare unterstützte Schadensattacke mit AP; `null`, wenn keine.
- `BattleView.openTrainerBattle()`: `true` bei Start, sonst `false`.
- `BattleView.onOpenChange(open)`: steuert andere Bedienelemente; `Game.setMenuOpen(open)` sperrt Bewegung und Eingaben.

## Einschränkungen
- Das Spielteam bleibt unverändert; KP/AP des Übungskampfs werden nicht gespeichert. Auch das gewählte Teammitglied wird nur als Kampfkopie verwendet.
- Beispielattacken `tackle` und `scratch` sind keine beschlossenen Lernlisten. Der Gegner ist vorläufig ein Evoli Level 5, kein Story-NPC.
- Keine Trainer-Teams, Wechsel, Statusattacken, Flucht, Erfahrung, Fangmechanik, Belohnungen oder KI-Taktik.
- Der Gegner besitzt 35 AP der Testattacke. Ein allgemeiner AP-Notfallzug ist nicht implementiert.
- Der manuelle Fallback-Knopf bleibt bis zum erfolgreichen Desktop-/iPhone-Test bestehen.
- Es wurden keine Browser- oder iPhone-Praxistests in dieser Ausführung durchgeführt.

## Desktop-Praxistest
1. `npm test`, danach `npm start` und `http://localhost:8000` öffnen.
2. Professor ansprechen und Starter auswählen; danach Testtrainer im Dorf nahe dem südöstlichen Rand des Dorfplatzes suchen (Kachel 19,18).
3. Trainer von einem benachbarten Feld aus ansehen und mit Enter/Leertaste ansprechen; Dialog vollständig bestätigen.
4. Im Kampf nur eigene Attacken auswählen. Prüfen: Gegner antwortet automatisch; KP, AP und Meldungen aktualisieren sich.
5. Während des Kampfs WASD/Pfeiltasten und Team-/Speicheraktionen prüfen: keine Weltbewegung/Öffnung. Vor Kampfergebnis darf Schließen nicht funktionieren.
6. Bis zum Ergebnis spielen, Schließen wählen und Position/Bewegung prüfen. Team und Speicherstand dürfen keine Kampf-KP-Veränderung enthalten.

## iPhone Safari – manueller Praxistest
1. Projekt über einen vom iPhone erreichbaren lokalen Webserver öffnen (gleicher WLAN-Zugang).
2. Starter wählen, mit Touch-Steuerkreuz zum Testtrainer gehen und mit „Aktion“ ansprechen.
3. Dialog durch Touch-Aktion abschließen; Kampfpanel im Hoch- und Querformat auf Lesbarkeit, Scrollen, Safe-Area und Touch-Ziele prüfen.
4. Attacke antippen, automatische Antwort und Meldungen prüfen; währenddessen Steuerkreuz und Menüs auf Sperre prüfen.
5. Nach Ergebnis „Schließen“ antippen, Position und Touch-Bewegung kontrollieren; bei Bedarf Vollbild-Fallback prüfen.

## Automatisierte Tests
`npm test`: 107 bestanden, 0 fehlgeschlagen (6 neue Tests). Die Prüfungen umfassen NPC, Dialog, Kampfbeginn, Gegneraktionen, Kampfende, Team-Unveränderlichkeit und Integrationsverträge. Browser-E2E- und reale Touchtests bleiben offen.
