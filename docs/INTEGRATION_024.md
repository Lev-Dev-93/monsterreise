# Auftrag 024 – Verzweifler-Testspielstand (0 AP)

## Basis und Änderungen
Basis: vollständiger Integrationskandidat 023. Geändert: `src/ui/TestSaveMode.js`. Neu: `tests/test-save-024.test.js`, `docs/INTEGRATION_024.md`, `docs/TESTRESULT_024.txt`.

## UI / Schnittstellen
Die vorhandene Schaltfläche „Testspielstand“ öffnet weiter denselben Dialog. Dort sind jetzt die Varianten `normal` („Normaler Test (Tackle)“) und `struggle` („Verzweifler-Test (0 AP)“) auswählbar. Vor der Bestätigung zeigt der Dialog Modus und ersten nachweislich freien Platz an. Nach Auswahl wird der Platz vor dem Schreiben erneut geprüft. `makeTestTeam({registry,moveRegistry,mode='normal'})` und `createTestSave({saveSystem,registry,slot,confirmed,location,mode='normal'})` erweitern die bestehenden Schnittstellen rückwärtskompatibel. `TEST_MODES` enthält die Beschriftungen. Unbekannte Modi werden abgewiesen.

`struggle` erzeugt dasselbe Test-Evoli (Level 5, volle KP, ausschließlich Tackle) wie `normal`, setzt jedoch `movePp.tackle.current=0`, während `max=35` bleibt. Keine produktiven Starterdaten, Attackenwerte, Kampfregeln oder Speicherformate geändert. Die vorhandene TrainerBattle-API übernimmt die geladene Pokémon-Kopie und löst bei 0 AP Verzweifler aus. Kein automatisches Speichern oder Heilen.

## Grenzen / Risiken
Das Schreiben ist durch zwei Prüfungen gegen versehentliches Überschreiben geschützt; bei gleichzeitigen Schreibzugriffen aus anderen Tabs existiert weiterhin kein atomarer Speicherschutz. Unlesbare/inkompatible Slots werden niemals als frei gewertet. Die Testfunktion ist durch das UI-Modul isoliert und später entfernbar. Kein eigenständiger GitHub-Pages-Release: zuerst Integrationsprüfung durch Chat 10.

## Desktop-Prüfanleitung
1. Integrationskandidat lokal mit einem HTTP-Server starten, z. B. `python3 -m http.server 8000`, und `http://localhost:8000` öffnen.
2. Vorhandene Spielstände sichern. „Testspielstand“ öffnen und die Slotübersicht kontrollieren.
3. „Verzweifler-Test (0 AP)“ auswählen; in der Bestätigung Modus und freien Speicherplatz prüfen; erst dann erstellen.
4. Teammenü öffnen: Evoli Level 5, volle KP und Tackle 0/35 AP prüfen.
5. Den vorläufigen Trainer ansprechen, Kampf starten und die automatische Verzweifler-Auslösung sowie KP-/AP-Anzeige prüfen.
6. Nach dem Kampf manuell speichern, Seite neu laden und KP/AP erneut prüfen. Bestehende Slots müssen unverändert bleiben.
7. Bei drei belegten/defekten Slots prüfen, dass keine Erstellung angeboten wird. Anschließend auch den normalen Testmodus prüfen (Tackle 35/35 AP).

## Übergabe Chat 00
Automatisiert: 159 bestanden, 0 fehlgeschlagen, 7 neue Tests. Desktop-Praxistest und Chat-10-Integrationsprüfung ausstehend; iPhone-Praxistests laut Auftrag nicht erforderlich. Schnittstellenänderung ist optionaler `mode`-Parameter; Engine/SaveSystem/Battle unverändert.
