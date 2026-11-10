# Auftrag 021 – Sicherer Testmodus für KP/AP

## Zweck und Sicherheitsgrenzen

Die Schaltfläche **Testspielstand** ist eine ausdrücklich vorläufige Testfunktion. Sie zeigt den Status aller drei Speicherplätze und den **konkreten freien Zielplatz** vor dem Anlegen. Erst der gesonderte Button „Testspielstand auf Platz N erstellen“ bestätigt die Erstellung. Es wird **ausschließlich** auf einem Platz geschrieben, für den `SaveSystem.load(slot).status === 'empty'` gilt. Belegte, beschädigte, inkompatible oder nicht lesbare Speicherplätze gelten als geschützt. Vor dem Schreiben erfolgt eine erneute Prüfung. Sind alle Plätze belegt, gibt es keinen Erstellen-Button. Bestehende Daten werden nicht überschrieben.

**Wichtig:** Die Kontrolle ist für die synchrone Browser-`localStorage`-Nutzung gedacht. Zwischen zwei gleichzeitig geöffneten Browser-Tabs gibt es keine transaktionale, tabübergreifende Schreibsperre. Für strenge Parallelzugriffssicherheit wäre später eine atomare SaveSystem-API nötig. Während dieses Testmodus nicht in mehreren Tabs gleichzeitig speichern.

## Testdaten

Ein isoliertes Team über `createTeam` und `team.addMember(createPokemon(...))`: Evoli (`eevee`), Level 5, Herkunft `other` (kein zweiter Starter), eine ausdrücklich **vorläufige** Attacke `tackle` aus `sampleMoves.js`. KP werden mit `createClassicStatAdapters` und `initializeHp` berechnet, AP mit `initializeMovePp` initialisiert. Keine endgültige Attackenvergabe für normale Starter. Das bestehende Teammodell und `SaveSystem.save/load` bleiben unverändert. Nach Erstellung wird der neue Platz über `loadSlot` aktiviert und das Pokémon im normalen Teammenü angezeigt.

## Dateien / Schnittstellen

- **Neu:** `src/ui/TestSaveMode.js`: `inspectTestSlots(saveSystem)`, `makeTestTeam({registry})`, `createTestSave({saveSystem,registry,slot,confirmed,location})`, `TestSaveMode`.
- **Geändert:** `src/main.js`: Testmodus an `saveSystem`, `game`, `loadSlot` und Menü-Eingabesperre gebunden; Speicherplatzwechsel bei aktivem Kampf/Testdialog blockiert.
- **Geändert:** `index.html`: sichtbarer Test-Button und Bestätigungsdialog.
- **Geändert:** `styles.css`: responsive, berührungsgerechte Darstellung.
- **Neu:** `tests/test-save-021.test.js`, `docs/TESTRESULT_021.txt`, `docs/INTEGRATION_021.md`, `docs/HANDOFF_021.md`.

Es werden keine Kampf-, Team-, SaveSystem-, Welt- oder Professorregeln verändert. Testfunktion rückbaubar durch Entfernen von TestSaveMode, UI-Markup, CSS und main.js-Integration.

## Testanleitung Desktop / iPhone

1. Projekt mit `npm start` über lokalen Webserver oder GitHub Pages öffnen. Auf dem iPhone die veröffentlichte HTTPS-Adresse nutzen.
2. **Vorher wichtige Spielstände sichern.** Auf **Testspielstand** tippen/klicken. Prüfen, dass alle Plätze angezeigt werden und ein freier Zielplatz genannt ist. **Abbrechen** prüfen: kein Spielstand wird angelegt.
3. Testmodus erneut öffnen und ausdrücklich **Testspielstand auf Platz N erstellen** drücken. Der neue Platz wird aktiv. Über **Team** Evoli, Level 5, KP und Tackle-AP kontrollieren.
4. Vorläufigen Testtrainer im Dorf ansprechen und Kampf spielen. Prüfen, dass währenddessen Weltbewegung gesperrt ist. Nach Kampf Team öffnen und reduzierte KP/AP prüfen.
5. **Manuell speichern**, Seite neu laden, denselben Platz laden und die Werte im Team vergleichen. Es erfolgt keine automatische Heilung oder Speicherung nach Kämpfen.
6. Auf Desktop mit Maus/Tastatur und auf iPhone in Hoch- und Querformat prüfen, dass Dialog und alle Tasten erreichbar sind. Vollbild-/Safari-Fallback separat prüfen.
7. Negativtest mit drei belegten Plätzen: Kein Erstellen-Button, kein Überschreiben. Keine vorhandenen Spielstände für diesen Test löschen.

## Einschränkungen

Der Modus ist nur ein Entwicklungswerkzeug. Keine neue Trainer-KI, keine wilden Begegnungen, keine endgültigen Attackenlisten, keine automatische Heilung oder Kampfspeicherung. Praktische Browser-/iPhone-Tests **ausstehend**.
