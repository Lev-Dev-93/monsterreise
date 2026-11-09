# Entwicklungsauftrag 006 – v0.2.3 – UI & Grafik

## Implementiert
- Optionaler Fullscreen-Button im Header (mindestens 44×44 CSS-Pixel, ARIA-Status und zugänglicher Name).
- `src/ui/Fullscreen.js`: nutzt `requestFullscreen`/`exitFullscreen` auf unterstützten Browsern; synchronisiert die Darstellung mit `fullscreenchange`; bei fehlender oder abgelehnter API reversibler Layout-Fallback.
- iPhone Safari: **kein behaupteter nativer Vollbildmodus**. Fallback entfernt nur die Spiel-Fußzeile und nutzt die verfügbare `100dvh`-Höhe. Browser-Chrome kann sichtbar bleiben; auf dem Home-Bildschirm gestartete Web-Apps haben eigene Plattformregeln.
- Responsives Steuerkreuz und Aktionstaste; CSS berücksichtigt Safe-Area-Inset über den App-Container und Hoch-/Querformat. Dialog und Canvas passen sich an.
- `Game` beobachtet Canvas-Größenänderungen mit `ResizeObserver` (wenn vorhanden), zusätzlich zum bisherigen `window.resize`. Nach Größenänderungen werden Renderer und Kamera neu berechnet.

## Schnittstellen / Abstimmung mit Chat 01
- Neu: `new Fullscreen({root,button,doc?,win?})`, `toggle():Promise<void>`, `destroy()`.
- Keine Änderung an `Input`, `Player`, `World`, `WorldSession`, `Camera`, Karten oder Regeln.
- `Game` ergänzt lediglich einen `ResizeObserver` für die Canvas-Darstellungsfläche; die vorhandenen Methoden `onResize()`, `renderer.resize()` und `updateCamera()` bleiben erhalten. Chat 01 soll diese kleine Lifecycle-Erweiterung gegenprüfen.
- Keine Änderungen an Weltkoordinaten, Pointer-Mapping oder Bewegungswerten.

## Automatisierte Tests
`npm test` (Node.js, `node --test tests/*.test.js`): **33 bestanden, 0 fehlgeschlagen**; davon 6 neue Tests in `tests/fullscreen-v023.test.js`.
Prüft API-Eintritt/Austritt, externes Verlassen, iPhone-Fallback, API-Ablehnung, Listener-Cleanup und statische Responsive-Merkmale. Bestehende Tests decken Bewegung, NPC-Dialog, automatische Übergänge und Touch-Eingabe ab.

## Praktische Tests: AUSSTEHEND
- Desktop Chrome/Firefox/Safari: Vollbild ein/aus, Esc, Fenstergröße, Seitenverhältnis.
- iPhone Safari: Hoch-/Querformat, Browserleisten, Notch/Home-Indikator, Tastenerreichbarkeit, Dialoge.
- iPhone: Touch-Halten, Multi-Touch, NPC-Gespräch, automatischer Türwechsel, Fallback an/aus.
- Extrem kleine Viewports und Bildschirmtastatur sind praktisch noch zu überprüfen. Vollständige Freiheit von Überlappungen kann ohne reale Browserprüfung nicht zugesichert werden.

## Übergabe Chat 00
Geänderte Dateien: `index.html`, `styles.css`, `src/main.js`, `src/core/Game.js`, `package.json`, `README.md`; neu: `src/ui/Fullscreen.js`, `tests/fullscreen-v023.test.js`, `docs/INTEGRATION_006.md`.
Schnittstellen: siehe oben. Tests: 33/33 bestanden. Offene Punkte: Chat 01 prüft ResizeObserver-Ergänzung; reale Browser-/iPhone-Tests ausstehend.
