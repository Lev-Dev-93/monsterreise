# Auftrag 012 – Spielerposition und Karte (v0.3.1)

## Grundlage und Umfang
Auftrag 011 erweitert; Handbuch Master 1.0, insbesondere Kapitel 29. Keine neuen Pokémon-Modelle, keine Änderungen an Karten, Dialogen oder Steuerung. Drei Slots bleiben unabhängig.

## Umsetzung
`SaveSystem.save(slot, team, location?)` speichert zusätzlich `location: {mapId,x,y,facing,returnPositions}` unter dem bestehenden Versionswert 1 und dem bisherigen Slot-Schlüssel. X/Y sind Weltpixel (linke obere Ecke der Spieler-Kollisionsbox), nicht Tile-Koordinaten. `returnPositions` bewahrt die Rückkehradresse bei einem Gebäudeportal. `SaveSystem.load(slot)` liefert zusätzlich `location` und `locationStatus` (`ok`, `legacy`, `invalid`). Teamdaten bleiben über `Team.toSaveData()` / `restoreTeam()` serialisiert. Team-only-Dateien aus Auftrag 011 bleiben lesbar und verwenden den Startspawn.

Positionsdaten werden gegen vorhandene Karten, endliche Koordinaten, Kollisionen, Blickrichtung und Rückkehrstapel validiert. Bei ungültigen Daten wird das Team trotzdem geladen, der Weltzustand auf den Startspawn gesetzt und die Warnung angezeigt. Die gespeicherten Bytes werden beim Laden nicht verändert. Speicheraufrufe mit ungültiger Position schreiben nichts.

`Game.getSaveLocation()` erzeugt den Snapshot; `Game.restoreSaveLocation(location)` setzt Session, Player, Kamera und UI-Label; `Game.resetSaveLocation()` setzt den Startspawn. Beim Wiederherstellen wird die aktuelle Portal-Kachel als bereits betreten markiert, damit kein sofortiger automatischer Übergang stattfindet. Beim erneuten Betreten nach Verlassen funktioniert der Übergang wieder. `main.js` nutzt dieselben Methoden beim Start, Slotwechsel und Autosave nach Startervergabe.

## Schnittstellen
- `new SaveSystem({registry, storage?, worldRegistry?})` – `worldRegistry` ist für Positionsdaten erforderlich.
- `save(slot,team,location?)` → `{status:'ok'|'error',reason?}`.
- `load(slot)` → bei Erfolg `{status:'ok',team,location,locationStatus}`; bestehende Fehlerstatus bleiben.
- `Game.getSaveLocation()` → serialisierbarer Snapshot.
- `Game.restoreSaveLocation(location)` / `Game.resetSaveLocation()` → Weltzustand aktualisieren.

## Offene Fragen / Grenzen
- Weiterhin keine endgültige Hauptmenüintegration, keine Kampf-/Cutscene-Zustände. Manueller Knopf bleibt provisorisch.
- Saveformat-Version bleibt 1, weil `location` ein optionales, rückwärtskompatibles Feld ist. Ein formales Migrationssystem für künftige Formate fehlt.
- Bei defekten Positionsdaten wird bewusst auf Startdorf-Spawn zurückgesetzt; keine automatische Reparatur der gespeicherten Bytes. Der Nutzer kann danach bewusst neu speichern.
- Rückkehrstapel unterstützt den bestehenden Hausportal-Fall; komplexere verschachtelte Portalfolgen und beliebige neue Karten brauchen spätere eigene Validierungsregeln.
- Nur Team/Starter und Kartenposition sind persistiert; andere Welt-, Quest-, Zeit- und Inventardaten noch nicht.

## Browserprüfung
1. Starter erhalten, im Dorf bewegen, manuell speichern, Seite neu laden; Team, Karte, Position und Blickrichtung kontrollieren.
2. Haus betreten, innen speichern, Seite neu laden; Haus verlassen und korrekten Außen-Rückkehrpunkt prüfen.
3. Direkt auf der Haus-Tür speichern, neu laden; prüfen, dass kein sofortiger Portalwechsel ausgelöst wird; Kachel verlassen und erneut betreten.
4. Auf Slot 2 wechseln, dort anders positionieren und speichern; zwischen Slots 1–3 wechseln, ohne dass sich Positionen oder Teams vermischen.
5. Per DevTools ungültige `location.mapId` bzw. blockierte Koordinaten eintragen; Team bleibt, Startspawn erscheint und Warnung wird angezeigt; gespeicherte Daten bleiben beim Laden unverändert.
6. Alte Team-only-Speicherung aus Auftrag 011 laden; Startspawn und Pokémon prüfen.
7. Desktop-Tastatur, iPhone-Touch, Vollbild, NPC-Dialoge und Gebäudeübergänge auf Regressionen prüfen. Echte iPhone-/Safari-Tests stehen aus.

## Automatisierte Tests
`npm test`: siehe `docs/TESTRESULT_012.txt` (72 bestanden, 0 fehlgeschlagen, fünf neue Tests).
