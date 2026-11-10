# Prüfauftrag 021A – Engine & Steuerung

## Grundlage
Unveränderte ZIP `Monsterreise_021_Integrationskandidat_v0.4(2).zip`; kein Zugriff auf ein echtes iPhone oder eine interaktive Safari-Sitzung. Die ZIP enthielt 138 bestehende Node-Tests, die vor Änderungen vollständig bestanden.

## Befunde und Korrekturen
1. Testspielstand-Dialog: `TestSaveMode.open()` setzt `game.setMenuOpen(true)` und löscht Eingaben. `close()` entsperrt und löscht erneut. Nach dem Schließen konnte ein weiterhin physisch gedrückter Tastaturknopf durch wiederholtes `keydown` wieder aktiv werden. **Korrigiert:** `Input.clear()` merkt sich gedrückte Tastaturtasten und ignoriert weitere `keydown`-Ereignisse bis zum passenden `keyup`. Für Touch werden aktive Pointer gelöscht; eine neue Berührung ist erforderlich.
2. Trainerkampf: `BattleView.openTrainerBattle()`/`openTestBattle()` sperren über `game.setMenuOpen(true)` Weltbewegung, NPC-Interaktion und Portaltrigger; `Game.update()` kehrt bei `menuOpen` vor Bewegungs- und Portalprüfung zurück. Die UI blockiert den Speicherplatzwähler. **Zusätzlich abgesichert:** `loadSlot()` und `saveCurrent()` verweigern jetzt direkte Aufrufe während Kampf/Testdialog. Keine Änderung der Kampfregeln.
3. Testspielstand aktivieren: Erfolgreiches Anlegen schließt den Testdialog und ruft `loadSlot()` auf; dort werden Team-Referenzen für Professor, Teammenü und Kampfansicht sowie die Position synchronisiert. Die bestehende Prüfung auf explizit leere Speicherplätze und der zweite Check unmittelbar vor dem Schreiben bleiben unverändert. Keine tabübergreifende atomare Sperre vorhanden.
4. Touch/Rotation/Vollbild: Touch-Pointer werden bei `clear()` entfernt. CSS nutzt `100dvh`, Safe-Area-Abstände, responsive Steuerkreuzgrößen und Touch-Callout-Schutz. `Fullscreen` nutzt bei fehlender Fullscreen-API einen Layout-Fallback. Keine offensichtliche direkte Überschneidung der Input-Sperre mit diesen Funktionen in der Codeprüfung; reale Safari-Tests fehlen.

## Automatisierte Tests (Node.js)
- Vor Korrektur: **138/138 bestanden** (`npm test`).
- Nach Korrektur: **141/141 bestanden**, **0 fehlgeschlagen** (`npm test`).
- Neu: `tests/input-lock-021a.test.js`: gehaltene Richtung nach Dialogschließen, gehaltene Enter-Taste nach Dialogschließen, Touch-Freigabe bei Sperre.
- Vorhandene Tests: SaveSystem/Testspielstand, Kampf, Welt und UI weiterhin grün.
- Nicht durchgeführt: echter Browser-/iPhone-Test, interaktive Rotation, Vollbild-Fallback, End-to-End-Test eines vollständigen Trainerkampfs mit echtem DOM und lokalem Browserspeicher. Die zusätzlichen Guard-Pfade wurden anhand des Codes geprüft, nicht separat browserautomatisiert.

## Freigabeempfehlung
**Bedingte Freigabe als Integrations-/Prüfkandidat**, nicht als auf iPhone validierte Version. Auf GitHub Pages insbesondere gehaltene WASD-/Pfeiltasten über Öffnen/Schließen, Touch-Halten, NPC-Interaktion, Portalwechsel, Trainerkampf und Speicherplatzwechsel sowie Testspielstand-Aktivierung in Hoch-/Querformat prüfen. Vorher vorhandene Spielstände sichern; parallele Tabs für den Testmodus vermeiden.

## Übergabe an Chat 00
- Geändert: `src/core/Input.js`, `src/main.js`.
- Neu: `tests/input-lock-021a.test.js`, `docs/PRUEFBERICHT_021A.md`.
- Schnittstellen: Keine neuen öffentlichen APIs. Bestehende `Input.clear()`, `loadSlot()` und `saveCurrent()` haben strengere Sperrsemantik.
- Bestehende Spielstände, Pokémon-Daten, Karten, Story und Kampfregeln nicht verändert.
- Offen: manuelle Safari-/Desktop-Tests; transaktionssichere parallele Schreibzugriffe auf Speicherplätze; vollständiger Browser-E2E-Test.
