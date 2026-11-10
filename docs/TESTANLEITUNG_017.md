# Monsterreise – Manuelle Testanleitung 017

## Vorbereitung
1. ZIP entpacken; im Ordner `Monsterreise_012` `npm test` ausführen (Soll: 107/107).
2. `npm start`; Desktop-Browser unter `http://localhost:8000` öffnen. Entwicklerkonsole offen halten.
3. Für iPhone: Computer und iPhone im selben WLAN; Server ggf. unter `http://<LAN-IP-des-Computers>:8000` öffnen. Firewall prüfen. Safari verwenden; einmal Hochformat, einmal Querformat.
4. Bestehende Spielstände vorher sichern; für isolierte Tests einen freien Speicherplatz wählen.

## Testfälle – jeweils Desktop und iPhone
| ID | Schritte | Erwartetes Ergebnis |
|---|---|---|
| M01 | Neues Spiel, WASD/Pfeile bzw. Touch-Steuerkreuz | Bewegung, Kollision und Blickrichtung funktionieren |
| M02 | Professor (18,16) ansprechen, Dialog vollständig weiterklicken | Startergalerie öffnet sich nach Dialog |
| M03 | Starter auswählen, Team öffnen und schließen | Starter erscheint genau einmal; Weltsteuerung nach Schließen aktiv |
| M04 | Speichern, anderen Slot wählen, zurückladen | Team und Position korrekt, Slots getrennt |
| M05 | Haus betreten und wieder verlassen | Richtige Innenraumkarte und Rückkehrposition |
| M06 | Im Startdorf Testtrainer bei Kachel (19,18) von benachbartem Feld aus ansehen und ansprechen | Vorläufiger Dialog; Kampf erst nach letzter Dialogzeile |
| M07 | Im Trainerkampf eine eigene Attacke wählen | Gegner antwortet automatisch, ohne eigene Gegnerauswahl; KP/AP und Meldungen aktualisieren sich |
| M08 | Während Kampf WASD/Pfeile/Touch-Aktion, Team, Speichern, Slotwahl, Fallback, Escape und Schließen versuchen | Keine Bewegung/Interaktion/andere Menüs; vor Ergebnis kein reguläres Schließen |
| M09 | Kampf bis Sieg durchspielen (ggf. mit anderem Starter/mehreren Versuchen) | Siegmeldung; Schließen aktiv; Rückkehr an unveränderte Weltposition |
| M10 | Kampf bis Niederlage durchspielen | Niederlagemeldung; Schließen aktiv; Rückkehr an unveränderte Weltposition |
| M11 | Nach Kampf Team und gespeicherten Spielstand prüfen | Kampf-KP/AP nicht dauerhaft übernommen; Weltsteuerung wieder aktiv |
| M12 | Während eines laufenden Kampfes Browser neu laden | Kein festhängender Kampf-/Menüzustand nach Neuladen; dies ist nur technischer Abbruch, keine Fluchtmechanik |
| M13 | Auf iPhone Portrait und Landscape, Safari-Adressleiste ein-/ausblenden, scrollen, drehen | Attacken/Schließen erreichbar, keine abgeschnittenen Inhalte, keine unbeabsichtigte Seitennavigation |
| M14 | Auf iPhone D-Pad und Aktion mit mehreren Fingern ausprobieren; während Kampf wiederholen | Keine hängenden Touchrichtungen; nach Kampf steuerbar |
| M15 | Optional Fallback-Testkampf starten und schließen | Fallback ist klar gekennzeichnet; vom Welttrainer-Kampf unterscheidbar |

## Dokumentation
Für jeden Fall Gerät, OS-/Browserversion, Bildschirmorientierung, Ergebnis PASS/FAIL/BLOCKED, Reproduktionsschritte, erwartetes und tatsächliches Verhalten, Screenshot/Video und Konsolenfehler notieren. Sieg und Niederlage separat protokollieren. Bei Blockade Spielstand/Starter/Attacke/Runde notieren.

## Freigabeschwelle
Alle M01–M11 und M13–M14 auf Desktop und echtem iPhone bestanden; M12 ohne kaputten Zustand; keine P1/P2-Blocker. Bis dahin keine endgültige Praxisfreigabe.
