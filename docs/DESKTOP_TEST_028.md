# Monsterreise 028 – Desktop-Praxistest ohne Programmierkenntnisse

**Vorbereitung:** Erst nach ausdrücklicher Freigabe durch Chat 00 die von der Projektleitung bereitgestellte GitHub-Pages-Adresse öffnen. Nicht selbst veröffentlichen. Nur **einen** Spiel-Tab offen halten. Am besten ein separates Browserprofil verwenden. **Vorhandene Speicherplätze niemals für Tests überschreiben.** Wenn alle drei Plätze belegt sind, keine Testdaten erstellen; Projektleitung informieren.

| Nr. | Aktion | Erwartetes sichtbares Ergebnis | Fehler melden, wenn … |
|---|---|---|---|
| 1 | GitHub-Pages-Adresse im Desktop-Browser öffnen. | Startdorf und Figur sichtbar, Bedienleiste reagiert. | Weißer Bildschirm, Fehlermeldung, Karte fehlt. |
| 2 | Oben bei „Platz“ einen **bereits vorhandenen** Spielstand wählen (falls vorhanden). | Status meldet „geladen“, Team und gespeicherte Position erscheinen. | Falscher Platz, verlorenes Team, falsche Position. |
| 3 | Mit WASD/Pfeiltasten laufen; gegen Hindernis gehen. | Figur bewegt sich, Hindernisse bleiben undurchlässig. | Figur steckt fest oder durchläuft Wände. |
| 4 | Zur Tür des Hauses links oben gehen und **auf die Tür laufen**; innen zur Ausgangstür laufen. | Haus öffnet sich automatisch; Rückkehr ins Dorf. | Portal reagiert nicht oder löst eine Endlosschleife aus. |
| 5 | Falls noch kein Starter: Professor im Dorf ansprechen (von benachbartem Feld aus in seine Richtung schauen, Enter/Leertaste), Dialog durchklicken, Starter wählen. | Starter erscheint unter „Team“ mit Art, KP und Attacken/AP. | Dialog blockiert, kein Starter, unerwartete Attacken. **Achtung:** Die Startervergabe kann bereits speichern. Nur auf einem bewusst freigegebenen Platz durchführen! |
| 6 | „Team“ öffnen, KP und AP notieren; „Schließen“ wählen. | Teamdaten sichtbar; Steuerung danach wieder möglich. | Menüs bleiben offen, Daten fehlen. |
| 7 | Vorläufigen Testtrainer im Dorf ansprechen und Dialog beenden. | Trainerkampf öffnet sich; Bewegung und Speicherbedienung sind gesperrt. | Kein Kampf trotz kampffähigem Pokémon, Bewegung möglich. |
| 8 | Im Kampf angezeigte Attacken anklicken, bis Sieg oder Niederlage eintritt; ggf. Verzweifler benutzen. | Gegner greift automatisch an; KP/AP sinken; bei 0 nutzbaren AP erscheint Verzweifler; Rückstoß wird angezeigt. | Runde bleibt hängen, Gegner handelt nicht, AP/KP unplausibel. |
| 9 | Nach Kampfergebnis „Schließen“ wählen; Team öffnen und KP/AP mit Schritt 6 vergleichen. | Team übernimmt Kampfverluste, auch Rückstoß; während Kampf kein vorzeitiges Schließen. | Teamwerte springen zurück, Ergebnis doppelt übernommen. |
| 10 | Zum Gebäude rechts oben mit Center-Eingang gehen und auf dessen Tür laufen. | Center-Karte erscheint, Figur steht sicher im Raum. | Tür nicht erreichbar, Spawn blockiert. |
| 11 | Vor die Heilungsstation im Center (oben mittig) gehen, zur Station schauen und Enter/Leertaste drücken. | Bestätigungsdialog „Deine Pokémon sind wieder vollständig geheilt!“; Heilung erfolgt **bei dieser Interaktion** (keine Ja/Nein-Frage). | Ohne Interaktion geheilt, keine Reaktion, Fehlermeldung. |
| 12 | Dialog schließen; „Team“ öffnen und KP/AP kontrollieren. | Alle Team-Pokémon haben volle KP und AP; Identität/Level/Attackenauswahl unverändert. | Teilheilung, geänderte Attacken oder Pokémon. |
| 13 | Zur Ausgangstür unten mittig laufen. | Rückkehr zum Center-Eingang im Dorf ohne Portal-Schleife. | Falsche Position, Dauerschleife. |
| 14 | Oben „Speichern“ klicken, Status abwarten, Seite neu laden, denselben Platz laden. | Team, KP/AP und Weltposition entsprechen dem gespeicherten Zustand. | Statusfehler, alte Werte, falscher Ort. |
| 15 | Optional nur bei **freiem Platz**: „Testspielstand“ öffnen, „Normaler Test“ auswählen, erstellen; danach separat auf anderem freien Platz „Verzweifler-Test (0 AP)“ auswählen. | Normal: Evoli Lv. 5, Tackle 35/35 AP; Verzweifler: Evoli Lv. 5, volle KP, Tackle 0/35 AP. Bei Trainerkampf sofort Verzweifler. | Belegter Platz wird angeboten, 0 AP fehlen, Verzweifler nicht verfügbar. |

**Wichtige Hinweise:** Mit 0 KP kann ein Pokémon nicht erneut als Kämpfer gewählt werden. Falls kein kampffähiges Pokémon vorhanden ist, zuerst im Center heilen. Testspielstände werden nur auf freien Plätzen angelegt; beschädigte oder inkompatible Plätze gelten als geschützt. Nach dem Kampf wird **nicht automatisch gespeichert** – Schritt 14 ausdrücklich durchführen. Die separate Schaltfläche „Testkampf (Fallback)“ ist ein isolierter manueller Testkampf und **nicht** geeignet, um die Team-KP/AP-Übernahme zu prüfen.

**Fehlerbericht an Chat 00:** Browser und Version, Schritt-Nr., Speicherplatz (ohne private Daten), erwartetes/tatsächliches Ergebnis, Screenshot wenn möglich. Bei Speicherfehlern nicht wiederholt speichern und nichts löschen; Seite offen lassen und Rücksprache halten.

**Abnahme:** Erst wenn alle für den jeweiligen Spielstand anwendbaren Schritte tatsächlich im Desktop-Browser durchgeführt und protokolliert wurden. Automatisierte Node-Tests allein reichen nicht.
