# Auftrag 022 – Kampf-Stabilisierung (Desktop-first)

## Ausgangspunkt
Vollständiger Prüfstand 021A. Keine Änderungen an Welt, Professor, Steuerung, SaveSystem, Team oder Pokémon-Modell.

## Implementiert
- `BattleView.choose()` prüft die Verfügbarkeit einer gültigen KI-Aktion **vor** dem Einreichen der Spieleraktion. Ohne KI-Aktion wird keine halbe Runde erzeugt; die Welt bleibt gesperrt und eine sichtbare Fehlermeldung erscheint.
- `BattleView.choose()` fängt Fehler bei `commitTrainerResult()` ab, zeigt eine Fehlermeldung und hält die Kampfsitzung geöffnet. `battleSync.committed` wird nur nach erfolgreichem `applyBattleResult()` gesetzt.
- `BattleView.close()` hatte bereits die Eigenschaft, bei Fehlern der Ergebnisübernahme nicht zu schließen; dieser Vertrag ist nun getestet.
- `Battle.submitAction()` lehnt Aktionen nach Kampfende ab. Pokémon mit 0 KP gelten in der bestehenden Ergebnislogik als besiegt. `firstBattleReady()` schließt 0-KP-Pokémon aus.
- Vorhandene `Team.cancelBattleSync()`- und `restoreTeam()`-Verträge sind regressionsgetestet.

## Schnittstellen
Keine neue öffentliche API. `choose(side,moveId)` liefert bei fehlender KI-Aktion oder fehlgeschlagener Ergebnisübernahme `false`. `commitTrainerResult()` wirft weiterhin einen Fehler bei gescheitertem Commit. `close()` propagiert diesen Fehler und hält das Panel geöffnet. `team.applyBattleResult()` bleibt die einzige Stelle für die Übernahme von KP/AP.

## Noch nicht gelöst / Freigabe erforderlich
**Entscheidung Chat 00:** Welche Regel gilt, wenn alle AP aufgebraucht sind oder keine unterstützte Attacke verfügbar ist? Klassische Option: Verzweifler/Struggle mit eigenem Schaden und Rückstoß, aber Typ, Stärke, Priorität, Rückstoß, Verfügbarkeit und Unentschieden sind vor Implementierung festzulegen. Aktuell stoppt der Trainerkampf sicher, kann jedoch ohne technische Intervention nicht regulär beendet werden. Kein automatischer Abbruch, keine Heilung, keine erfundene Attacke.

## Technischer Wiederherstellungsweg
Bei einem Fehler in `applyBattleResult()` **nicht** den Browser aktualisieren und **nicht** die Synchronisation abbrechen: Kampf offen lassen, Fehlermeldung protokollieren und Fehlerursache beheben. Der Commit kann durch erneutes `commitTrainerResult()` oder `close()` versucht werden. Erst nach erfolgreichem Commit wird entsperrt. Bei einem technischen Abbruch vor `battle.finished` kann `cancelTrainerBattle()` verwendet werden; das verwirft bewusst die noch nicht übernommenen Kampfdaten. Für einen bereits abgeschlossenen Kampf mit dauerhaft scheiterndem Commit gibt es ohne zusätzliche abgestimmte Recovery-Strategie keinen verlustfreien Reload-Pfad. Ein Browser-Neustart speichert keinen laufenden Kampf; dies ist eine bekannte Einschränkung.

## Desktop-Testanleitung
1. Projekt lokal über `npm test` testen, dann `npm start` und `http://localhost:8000` öffnen.
2. Bestehenden Testspielstand/Starter mit gültiger Attacke verwenden, Testtrainer ansprechen, Kampf starten.
3. Attacken einsetzen, KP/AP kontrollieren, Kampf beenden, schließen, Teammenü öffnen, speichern und laden; KP/AP müssen erhalten bleiben.
4. Mit einem kampfunfähigen Pokémon (0 KP) testen: kein Trainerkampfeinstieg mit diesem Pokémon.
5. Automatisierter Grenzfalltest: `node --test tests/battle-stability-022.test.js` (KI ohne AP, Commit-Fehler, Legacy-Save).
6. Testspielstand-Funktion aus 021A und Welt-/Professor-Interaktionen manuell regressionsprüfen.

## Mobile
Keine iPhone-Praxistests in diesem Auftrag. Bestehende Touch-Tests bleiben in der vollständigen Suite.
