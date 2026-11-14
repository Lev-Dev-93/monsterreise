# MONSTERREISE – INTEGRATION 032

## Grundlage und Umfang
Kandidat 031, Entwicklung 029–031, Desktop-first. ZIP-Integrität der Quelle geprüft. Keine neuen Spielregeln, kein geändertes Speicherformat, keine Veröffentlichung, kein manueller Desktop-Test.

## Technische Änderungen
- `src/ui/BattleView.js`: Fehler beim initialen Anzeigen nach BattleLock-Erwerb lösen Rücknahme der noch nicht bestätigten Team-Synchronisation, UI-Rücksetzung und besitzgebundene Freigabe aus. Beide Startpfade abgesichert. Bei fehlerhafter Ergebnisübernahme bleibt der Kampf offen; der Benutzer kann mit „Schließen“ erneut die Ergebnisübernahme auslösen. Keine automatische Verwerfung von KP/AP.
- `src/core/Game.js`: Center-Effekttimer bei Weltübergängen auf 0 zurücksetzen.
- `src/renderer/CenterArt.js`: Heilungshinweis nur bei direkt angrenzender Heilungsstation in Blickrichtung (entspricht `WorldSession.interact`), an sichtbare Canvas-Fläche begrenzt; optionaler `canInteract`-Parameter.
- `src/renderer/Renderer.js`: Übergibt Canvas-Größe und tatsächlichen UI-/Battle-Zustand an Center-Overlay.
- `tests/integration-032.test.js`: 7 zusätzliche Tests für Renderfehler, Ergebnisübernahme/Retry, fremden Lock, Hinweisreichweite, Canvas-Grenzen, Karteneffekt und Eingabesperre.

## Sieben Risikobereiche und Nachweise
1. **Initialisierung/Renderfehler nach Lock-Erwerb: behoben und getestet.** Test 032 simuliert Renderausnahme nach Team-Sync; eigene Sperre und UI werden zurückgesetzt. Ausnahmen in der Rücknahme selbst sind nicht vollständig abgesichert.
2. **Fehlgeschlagene Ergebnisübernahme: teilweise abgesichert, Restrisiko offen.** `close()` lässt bei Fehler Kampf und Lock unverändert und erlaubt erneuten Abschluss; Test bestätigt einmalige erfolgreiche Anwendung nach vorherigem Fehler. Bei dauerhaft defekter Übernahme bleibt Welt absichtlich gesperrt, um Datenverlust zu vermeiden; ein transaktionaler Recovery-Prozess ist noch zu entscheiden.
3. **Abschlusswege Sieg/Niederlage/Unentschieden und Mehrfachaufrufe: bisherige Engine- und Lock-Tests bestanden, zusätzliche UI-Retry-Prüfung.** Ein vollständiger DOM-End-to-End-Test aller drei Resultate ist weiterhin offen.
4. **Gehaltene Eingaben: bestehende `Input.clear()`-Unterdrückung bestätigt; zusätzlicher Regressionstest.** Browser-Keyrepeat und Pointer-Sequenzen bleiben praktisch zu prüfen.
5. **Animationstimer/Kartenwechsel: behoben und getestet.** Beim Wechsel wird der Effekt zurückgesetzt; Rendering erzeugt keine Heilung/Save-Aktion.
6. **Hinweisreichweite: behoben und getestet.** Exakte NPC-Nachbarschaft und Blickrichtung, UI-/Kampfzustand als Zusatzbedingung.
7. **Canvas-Darstellung: teilweise abgesichert.** Hinweis wird bei zu kleinem Canvas nicht gezeichnet und sonst geklemmt; numerischer Test vorhanden. Visuelle Prüfung unterschiedlicher Desktop-Auflösungen bleibt offen.

## Regressionen
220/220 Tests bestanden, 0 fehlgeschlagen, 0 übersprungen. Vorher 213/213. Testprotokoll `docs/TESTRESULT_032.txt`.
Starter-Movesets, Ruckzuckhieb, Trainer-KI, Verzweifler, Teamheilung, SaveSystem, Testspielstände, Weltportale und BattleLock unverändert beziehungsweise Regressionstests erfolgreich. Keine Aussage über tatsächliche Browser-Abnahme.

## Schnittstellen
Unverändert: `BattleLock.isBattleActive/acquire/release`, `centerWorldEvent`, `healAtPokemonCenter`, `team.healAll`, SaveSystem und SAVE_VERSION. `centerStationOverlay` erhält **optionale** Argumente `viewportWidth`, `viewportHeight`, `canInteract` am Ende; ältere Aufrufe bleiben gültig.

## Offene Fragen
- Dauerhaft fehlgeschlagene Team-Ergebnisübernahme: sichere Wiederherstellung/Fehler-UI und eventuell persistenter Notfallzustand erfordern Entscheidung; keine unkontrollierte Freigabe.
- Ausnahme während Team-Sync-Rücknahme bzw. Fehler im onOpenChange-Cleanup: zusätzliche Härtung möglich.
- Echte DOM-/Desktop-Prüfung von Kampfabschluss, Tastatur und Canvas; auftragsgemäß verschoben bis nach 033.
- Vorläufige Starter-Movesets, Riolu, Center-Grafik; keine endgültigen Referenzdaten.
- Gleichzeitige Browser-Tabs: weiterhin keine atomare Speicherplatzsperre.

## Empfehlung
**Technisch mit Einschränkungen für Auftrag 033 geeignet.** Keine Freigabe als praktisch getestete Desktop-Version.
