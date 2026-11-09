# Auftrag 010 – Professor-Begegnung (v0.3)

## Grundlage und Abgrenzung
Projekthandbuch Master 1.0, Kapitel 9, 11, 14; Integrationskandidat 009. Professor: Forscher/Historiker, freundlich, humorvoll, zerstreut. Name, Geschlecht und Standort offen. **Verbindliche Reihenfolge:** Vor Starterwahl kurzer Ausflug, Shiny-Raupy, Professor demonstriert Kampf und Fang, Rückkehr, Starterwahl. Die vollständige Szene ist **nicht implementiert**. Stattdessen existiert eine **vorläufige, ausdrücklich nicht-kanonische Testbegegnung**; Freigabe für dauerhafte Storyintegration ausstehend.

## Ablauf
Startdorf-Testkarte: Professor (Test) auf Kachel (18,16), südlich bei (18,17) stehen und nach oben schauen, mit Enter/Leertaste/Aktion sprechen. Zwei Textzeilen durch Interaktion weiterblättern; erst nach der letzten Zeile öffnet `openProfessorStarterSelection()` die unveränderte Auswahl. Starterauswahl und `Team.assignStarter()` sind unverändert. Wird der Dialog erneut ausgelöst, nachdem `team.starterAssigned` wahr ist, erscheint nur ein kurzer Hinweis, ohne erneuten Auswahl-Hook. Die Teamverwaltung ist die einzige Quelle für den Vergabestatus. Ein Abbruch der Auswahl ohne Starter erlaubt erneutes Ansprechen.

## Schnittstellen
- `src/world/maps/startVillage.js`: zusätzlicher vorläufiger NPC `professor-test`; WorldSession.interact() liefert weiterhin ein gewöhnliches `dialog`-Ereignis.
- `src/dialog/ProfessorEncounter.js`: `new ProfessorEncounter({team,openStarterSelection}).handle(event)` nimmt Dialogereignisse entgegen; gibt unveränderte fremde Ereignisse oder ein Professor-Dialogereignis mit optionalem `onComplete()` zurück. Keine eigenständige Starter- oder Questverwaltung.
- `src/core/Game.js`: optionaler Constructor-Parameter `onWorldEvent` für Dialoganreicherung; ruft `onComplete()` genau beim Schließen der letzten Dialogzeile auf. Eingabe und Bewegung bleiben bei Dialog bzw. Menü gesperrt, einschließlich Portalprüfung.
- `src/main.js`: vorhandener exportierter Hook `openProfessorStarterSelection()` wird über den Controller verwendet. `PokemonMenus` und `Team` unverändert.

## Tests
`npm test` beziehungsweise `node --test tests/*.test.js`: 62 erfolgreich, 0 fehlgeschlagen (Node-Testumgebung). Neue Tests: NPC-Platzierung/Interaktion, einmalige Vergabe, Abbruchfähigkeit durch weiterhin nicht vergebenen Starter, Sperre bei Dialog und Menü, Game-Callback. Bestehende Tests einschließlich automatischer Portale bleiben erfolgreich. Manuelle Browser- und iPhone-Tests stehen aus.

## Offene Fragen
1. Wie heißt der Professor, welches Geschlecht hat die Figur und wo befindet sie sich endgültig?
2. Wann wird der verbindliche Einführungsausflug einschließlich Shiny-Raupy, Kampf und Fang implementiert?
3. Soll der vorläufige Test-NPC bis dahin bleiben oder durch eine andere Debug-Auslösung ersetzt werden?
4. Speichern/Laden des Vergabestatus ist nicht Bestandteil dieses Auftrags.

## Praktischer Test
1. `npm start` und `http://localhost:8000` öffnen.
2. Von Startposition (15,17) nach rechts bis unter Professor (18,16) gehen; nach oben schauen und Aktion auslösen.
3. Während Dialog Bewegungs- und Richtungstasten testen; zwei Textzeilen per Aktion durchgehen.
4. Im Startermenü Bewegung, Aktion und automatischen Gebäudeeintritt prüfen; Starter auswählen, Team anzeigen und Menü schließen.
5. Professor erneut ansprechen: nur Hinweis, keine zweite Starterauswahl.
6. Neue Sitzung starten, Auswahl vor Vergabe schließen und Professor erneut ansprechen: Auswahl wieder möglich.
7. Haus bei (7,9) betreten und wieder verlassen; iPhone-Touch und Desktop-Tastatur prüfen.
