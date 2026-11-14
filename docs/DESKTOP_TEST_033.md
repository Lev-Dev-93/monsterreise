# Monsterreise 033 – Mac-Desktop-Testanleitung

**Status:** Anleitung, noch kein durchgeführter Browsertest. Test ausschließlich nach Freigabe durch Chat 00. Verwende **einen einzigen Browser-Tab**. Speicherplätze 1–3 werden im Browser lokal gespeichert; vor dem Test bestehende Daten sichern und niemals einen belegten Platz für Testdaten verwenden. Eine neue GitHub-Pages-Adresse oder ein anderer Browser kann andere lokale Spielstände haben.

## Vorbereitung
1. Chat 00 stellt das freigegebene Pages-Paket im Repository bereit und nennt die genaue HTTPS-Adresse (voraussichtlich Pfad `/monsterreise/`). Öffne diese Adresse auf dem Mac in Safari oder Chrome. **Erwartet:** MONSTERREISE, Dorfkarte, Steuerung und Speicherplatz-Auswahl sichtbar. **Melden:** leere Seite, Ladefehler, fehlende Grafik oder unbedienbare Tasten. Browser und Version notieren.
2. Prüfe oben die Speicherplatz-Auswahl 1–3. Ein bestehender Platz darf nicht durch einen Testspielstand überschrieben werden. Für einen neuen Test nur einen ausdrücklich **freien** Platz verwenden. **Melden:** unerwartete Teamdaten oder eine fehlende Warnung. Teste nicht gleichzeitig in mehreren Tabs.

## A – Start, Bewegung, Dialoge, Gebäude
3. Bewege die Figur mit WASD oder Pfeiltasten; halte eine Taste kurz und lasse sie los. **Erwartet:** Bewegung stoppt nach Loslassen, Wände und Bäume blockieren. **Melden:** Hängenbleiben, Weiterlaufen, Durchqueren von Hindernissen.
4. Gehe zur Haustür im Nordwesten des Dorfes und betrete sie durch Drauflaufen; verlasse das Haus über die Tür unten. **Erwartet:** Innenraum und Rückkehr ins Dorf ohne sofortige Rücksprungschleife. **Melden:** falscher Spawn, Endloswechsel, schwarze Karte.
5. Sprich einen NPC an: vor ihm stehen, ihn ansehen, Enter/Leertaste drücken. **Erwartet:** Dialog erscheint, erneute Aktion schaltet weiter; währenddessen keine Weltbewegung. **Melden:** doppelte Dialoge, unbeabsichtigte Schritte.

## B – Starter und Trainerkampf
6. **Nur in einem neuen/freien Spielstand:** Sprich den vorläufigen Professor im Dorf an und folge dem Dialog zur Starterauswahl. Wähle genau einen Starter. **Erwartet:** genau ein Pokémon; Team-Menü zeigt seine vorläufigen Attacken und AP. Glumanda: Kratzer/Glut; Raupy/Evoli: Tackle; Riolu: Ruckzuckhieb. **Melden:** doppelte Starter, fehlende Attacken, falsche AP. Bestehende Spielstände nicht zurücksetzen.
7. Sprich den vorläufigen Testtrainer im Dorf an und beende dessen Dialog. **Erwartet:** Kampfoberfläche öffnet, eigene Attacken sind auswählbar, Gegner handelt automatisch. Notiere KP/AP vor und nach mindestens einer Runde. **Melden:** keine Kampföffnung, doppelte Kampfoberfläche, falscher AP-Abzug.
8. Spiele den Kampf bis zu einem erreichbaren Ende. **Erwartet:** Sieg oder Niederlage wird angezeigt, Ergebnis nach Schließen einmalig ins Team übernommen, Welt ist wieder bedienbar. **Melden:** fehlende Ergebnisanzeige, unendliche Sperre, veränderte KP/AP nach wiederholtem Schließen. **Unentschieden** nicht künstlich erzwingen: Wenn nicht regulär erreichbar, als „nicht manuell getestet“ markieren (automatisierte Engine-Tests vorhanden).
9. Während eines laufenden Kampfes drücke WASD, Enter, Speicherknopf und versuche ein anderes Menü zu öffnen. Halte zum Kampfende eine Bewegungstaste gedrückt. **Erwartet:** keine Weltaktion während Kampf; nach Ende keine unerwartete Bewegung oder erneute Traineransprache. **Melden:** Aktionen im Hintergrund, Eingaben bleiben hängen.

## C – Verzweifler-Test ohne Entwicklerkonsole
10. Nur wenn ein Speicherplatz ausdrücklich frei ist: Oben „Testspielstand“ öffnen, Variante „Verzweifler-Test (0 AP)“ wählen und die Erzeugung bestätigen. **Erwartet:** Evoli Level 5, volle KP, Tackle 0/35 AP; bereits belegte Plätze bleiben unverändert. **Melden:** Überschreiben oder andere AP.
11. Trainer ansprechen. **Erwartet:** Verzweifler automatisch verfügbar/ausgeführt, Rückstoß verringert KP, Tackle verbraucht keine weiteren AP. Nach dem Kampf Team öffnen und Werte kontrollieren. **Melden:** Blockade bei 0 AP, falsche KP/AP, nicht übernommener Rückstoß. Ein normaler Testspielstand kann auf einem *anderen freien Platz* erstellt werden; dort startet Tackle mit 35/35 AP.

## D – Pokémon-Center
12. Im Dorf das nordöstliche Center-Gebäude betreten. Zur Heilungsstation gehen und sie direkt ansehen. **Erwartet:** Hinweis „E / Aktion: Heilen“ nur in tatsächlicher Interaktionsreichweite. **Melden:** Hinweis an falscher Stelle oder außerhalb des sichtbaren Fensters.
13. Enter/Leertaste drücken. **Erwartet:** Bestätigungsdialog und kurzzeitiger Heileffekt nur nach erfolgreicher Interaktion; Team-KP und AP sind vollständig wiederhergestellt, auch bei vorher 0 KP. **Melden:** Heilung ohne Aktion, fehlende Heilung, endloser Effekt. Danach Center verlassen und erneut betreten: kein alter Heileffekt darf erscheinen.

## E – Fenstergrößen
14. Wiederhole kurze Bewegung, Dialog, Center-Hinweis und Menüansicht im normalen Fenster, kleineren Fenster und – falls unterstützt – Vollbild. **Erwartet:** lesbare Bedienelemente, keine abgeschnittenen Hinweise, keine Grafikreste nach Kartenwechsel. **Melden:** Screenshot plus Fenstergröße.

## F – Speichern/Laden
15. Nach beendetem Kampf und außerhalb eines Dialogs „Speichern“ drücken. **Erwartet:** Bestätigung für den gewählten Platz. Notiere Pokémon, KP, AP und Kartenposition. Lade die Seite neu und wähle denselben Platz. **Erwartet:** identische Teamdaten und Position. **Melden:** abweichende Werte, falscher Slot, beschädigte Anzeige. **Wichtig:** Es gibt keinen generellen Autosave nach Kämpfen oder Heilung.

## G – Fehler melden
Notiere Testschritt, Browser/Version, verwendeten Speicherplatz (keine privaten Daten), Ausgangszustand, exakte Klick-/Tastenfolge, erwartetes und tatsächliches Ergebnis. Screenshot bei Grafikproblemen. Wenn ein Kampf nicht schließt oder die Welt gesperrt bleibt, **nicht** durch wiederholte Speicherplatzwechsel oder Tab-Duplikate experimentieren; Fehlerzustand dokumentieren und Chat 00 melden. Keine absichtliche Beschädigung echter Spielstände. Dauerhafte Ergebnisübernahmefehler und vollständige DOM-End-to-End-Abdeckung bleiben offen; die 220 Node-Tests ersetzen diese Prüfung nicht.
