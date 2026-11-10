# Monsterreise – Prüfbericht 017 (v0.4)
Stand: 10.11.2026 · Chat 10 Integration & Tests

## Freigabeempfehlung
**Mit Einschränkungen freigabefähig für einen beaufsichtigten manuellen Praxistest; keine endgültige Browser-/iPhone-Freigabe.**

## Verifizierte Ergebnisse
- ZIP: `unzip -t` ohne Fehler; 94 Einträge; Projektwurzel `Monsterreise_012/`.
- Node: `npm test` frisch ausgeführt: **107 bestanden, 0 fehlgeschlagen**, Exit 0, ca. 501 ms.
- Enthalten: Game/Player/Input/Camera, World/WorldSession/Karten, Renderer, UI/Dialog/Professor, Pokemon/Team, Battle/TrainerBattle/BattleView, SaveSystem, CSS, HTML und 17 Testdateien. Nicht alle im Handbuch geplanten Module sind bereits implementiert; dies ist keine Vollständigkeit des fertigen RPG.
- Der Testtrainer ist in `startVillage.js` bei (19,18) als `placeholder:true` eingetragen. Sein Dialog wird in `TrainerBattle.js` erst nach Abschluss zum Kampfstart umgebogen.
- Der Trainerkampf verwendet das erste kampffähige Teammitglied und Kampfkopien; Evoli Level 5 ist ein vorläufiger Gegner. `chooseOpponentMove` wählt die erste unterstützte Schadensattacke mit verbleibenden AP. `BattleView.choose` löst diese Antwort nach Spieleraktion automatisch aus.
- `BattleView.openTrainerBattle` sperrt die Welt über `game.setMenuOpen(true)`; `main.js` deaktiviert Speichern, Slotwahl, Team und Fallback. `close()` entsperrt nach Ergebnis und setzt Eingaben zurück. Kein Positionswechsel ist im Kampfcode vorgesehen.
- Bestehende Tests umfassen Welt, Portale, Professor, Team, Save, Kampf, UI, Safari-/Touch-Logik; sie ersetzen keinen interaktiven Browserlauf.

## Auffälligkeiten und Risiken
1. **P1 – Kein echter Browser-/iPhone-Praxistest:** Bedienung, Layout, Fokus, Safe-Area, Scrollen und echte Pointer-Events sind nicht end-to-end bestätigt.
2. **P2 – Potenzieller Kampf-Stillstand bei erschöpften Gegner-AP:** `chooseOpponentMove` liefert `null`, wenn keine unterstützte Attacke mit AP übrig ist. Dann bleibt die Runde möglicherweise auf die Gegneraktion wartend. Für den vorläufigen Gegner sind 35 AP vorgesehen; in normalen kurzen Testkämpfen voraussichtlich nicht relevant. Kein neuer Notfallzug ohne Freigabe ergänzt.
3. **P2 – Abbruch im Trainerkampf bewusst gesperrt:** `close()` verweigert Schließen vor Kampfergebnis, auch per Escape. Es gibt keinen eigenen Abbruchmechanismus. Abbruch nur durch Reload/Tab-Schließen testbar; dies ist keine reguläre Fluchtfunktion.
4. **P2 – Sieg/Niederlage und Rückkehr nur logisch/über Unit-Tests abgedeckt:** Keine echte Browserinteraktion oder reale Geräteprüfung erfolgt.
5. **P3 – Statische Testlücke:** Der Test für UI-Sperren sucht überwiegend Quelltextmuster und simuliert keinen vollständigen DOM-Eingabefluss.
6. **P3 – Versions-/Dokumentationsstand:** `package.json` nennt `0.3.1`, HTML-Titel `v0.3`, obwohl der Integrationsauftrag `v0.4` lautet. Das Archiv enthält keine `docs/STATUS.md`; die separat bereitgestellte STATUS-Datei beschreibt den frühen Stand vom 09.11. und ist gegenüber dem ZIP offensichtlich veraltet.
7. **P3 – Touch-Fokus/Viewport:** Battle-Panel ist scrollbar und Schaltflächen sind mindestens 44px hoch; tatsächliches Verhalten in Safari Hoch-/Querformat nicht überprüft.

## Änderungen
Keine Spielquellen verändert: keine bestätigte reproduzierbare P1-Codefehlfunktion im Node-Lauf. Keine neuen Spielmechaniken eingeführt.

## Schnittstellen
Unverändert: `trainerWorldEvent`, `createTrainerTestBattle`, `chooseOpponentMove`, `BattleView.openTrainerBattle`, `BattleView.onOpenChange`, `Game.setMenuOpen`, `SaveSystem`.

## Entscheidungskriterien
- Für beaufsichtigten Test: geeignet, mit obigen Einschränkungen.
- Für endgültige Freigabe: erst nach Desktop- und echtem iPhone-Safari-Durchlauf, Prüfung beider Kampfergebnisse, Eingabesperren, Dialogabschluss, Rückkehr und Speichern.
