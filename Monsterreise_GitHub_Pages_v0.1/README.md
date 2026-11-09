# Monsterreise – technische Testversion 0.1

Entwicklungsauftrag 001; eigenständiges Grundgerüst, **kein** vollständiges Spiel. Keine Abhängigkeiten außer einem modernen Browser und einem lokalen HTTP-Server.

## Start

1. ZIP entpacken.
2. Terminal im Ordner `monsterreise-v0.1` öffnen.
3. `python3 -m http.server 8000` ausführen (alternativ `npx serve .`).
4. Im Desktop-Browser `http://localhost:8000` öffnen.
5. Auf dem iPhone: iPhone und Rechner im selben WLAN; `http://RECHNER-IP:8000` in Safari öffnen. Ggf. Firewallzugriff erlauben. `localhost` auf dem iPhone bezeichnet **das iPhone**, nicht den Rechner.

Die direkte Öffnung von `index.html` über `file://` ist wegen JavaScript-ES-Modulen nicht zuverlässig. Internetzugang und Build-Schritt sind nicht nötig.

## Steuerung

WASD, Pfeiltasten oder die vier eingeblendeten Touch-Richtungstasten. Diagonalbewegung per Tastatur ist möglich. Auf dem iPhone Hoch-/Querformat ausprobieren. Kollisionen verhindern, dass Spielfigur durch dunkle Hindernisse oder über Kartenränder läuft.

## Tests

`node --test tests/*.test.js` (Node.js 18+ empfohlen). Prüft Kartendimensionen, Hindernisse, Kartenrand, Geschwindigkeit, diagonale Normalisierung, Kollision, Gleiten und Kamerabegrenzung. Browser-/iPhone-Prüfung ist zusätzlich manuell nötig; automatisierte Node-Tests ersetzen keine echten Gerätetests.

## Nicht implementiert

Spielmenü, Interaktionen, NPCs, Kartenwechsel, echte Pixel-Art, Animationen, Rennen, Joystick-Umschaltung, Zoom/Filmszenen, Save-System, Pokémon und Story. Steuerkreuz ist eine erste technische Umsetzung des im Handbuch vorgesehenen Touch-Steuerkreuzes; alternative Joystick-Steuerung folgt später.

## Quellen

Projekthandbuch Master 1.0: Kapitel 1–4, Entwicklungsplan Abschnitt 1. Architektur-Arbeitsentwurf: `core/Game`, `player/Player`, `world/World`, `renderer/Renderer`, `ui/UI`. Schnittstellen siehe `docs/INTERFACES.md`.
