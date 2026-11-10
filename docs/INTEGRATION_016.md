# Auftrag 016 – Kampfoberfläche v0.4

## Umsetzung
- `src/ui/BattleView.js`: isolierter UI-Adapter für `createBattle()`, `submitAction()`, `getState()` und `createClassicBattleOptions()`.
- `src/main.js`: temporäre Testkampf-Integration; Teamreferenz wird beim Laden eines Speicherplatzes aktualisiert.
- `index.html`: klar gekennzeichneter Testkampf-Button und modales Kampfpanel.
- `styles.css`: responsive Ansicht, KP-Balken, Attacken und Meldungen.
- `tests/ui-battle-016.test.js`: vier neue automatische Prüfungen.
- `docs/TESTRESULT_016.txt`: vollständige Testausgabe.

## Testkampf
1. Im Startdorf beim Professor einen Starter wählen (Level 5).
2. „Testkampf“ im Kopfbereich drücken. Test-Gegner: Evoli, Level 5.
3. Eine eigene Attacke und anschließend eine gegnerische Attacke manuell wählen. **Keine KI**.
4. KP-Balken, AP, Treffer- und Ergebnismeldungen prüfen.
5. Mit „Schließen“ zurück zur Spielwelt. Der Team-/Spielstand wird durch den Testkampf nicht verändert.

Die Test-Pokémon erhalten ausschließlich im Testkampf die technischen Beispielattacken aus `sampleMoves.js`; dies sind **keine** festgelegten Startattacken. Statusattacken, Fangen und andere nicht unterstützte Aktionen werden nicht angeboten. Der Test-Gegner und seine Attacken sind keine verbindlichen Story- oder Balanceentscheidungen. Der Testkampf lässt sich später durch Entfernen von Button und BattleView-Anbindung entfernen.

## Schnittstellen und Grenzen
- Battle-Engine und Team-/Pokémon-Datenmodelle unverändert.
- `Game.setMenuOpen(true/false)` sperrt Weltbewegung und leert gehaltene Eingaben während des Kampfs.
- `BattleView.team` wird beim Wechsel des Speicherplatzes aktualisiert.
- `Battle.getState()` liefert HP, AP, Ereignisse, Rundenzahl und Ergebnis; maximale HP stammen aus der bestehenden Battle-Instanz.
- Die UI zeigt nur unterstützte Schadensattacken als aktiv an. Keine Trainer-KI, wilden Begegnungen, Fangaktionen oder dauerhaften Team-KP-Änderungen.
- Dialoge und andere Menüs verhindern den Start eines Testkampfs.

## Automatisierte Tests
`npm test`: **101 bestanden, 0 fehlgeschlagen**, davon 4 neue Tests. Die Tests prüfen die Battle-Adapter-Verbindung und Quell-/Markup-Verträge; sie ersetzen keine echten Browser- und Touch-Tests.

## Noch ausstehende praktische Tests
- Desktop: Testkampf öffnen, Attacken klicken, AP/KP und Meldungen prüfen, schließen und bewegen.
- iPhone Safari: Hoch- und Querformat, Scrollbarkeit des Panels, Safe Areas, Touch-Ziele, Vollbild-Fallback, Rückkehr zur Steuerung.
- Speicherplatzwechsel und Professor-Dialog mit anschließendem Testkampf prüfen.

## Übergabe an Chat 00
Geänderte Dateien: `src/ui/BattleView.js` (neu), `src/main.js`, `index.html`, `styles.css`, `tests/ui-battle-016.test.js` (neu), `docs/INTEGRATION_016.md` (neu), `docs/TESTRESULT_016.txt` (neu), `docs/HANDOFF_016.md` (neu). Schnittstellen: bestehende Battle-API, `Game.setMenuOpen()`, Teamreferenz beim Laden. Offene Fragen: späterer regulärer Kampfeinstieg, Gegnerwahl, Attackenvergabe und KI sind **nicht** Teil dieses Auftrags. Chat 01 sollte die Eingabesperre bei praktischen Tests gegenprüfen.
