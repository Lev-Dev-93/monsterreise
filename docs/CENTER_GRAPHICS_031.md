# Auftrag 031 – vorläufige Pokémon-Center-Grafik

## Bestandsaufnahme (Basis 030)
- Dorf: `src/world/maps/startVillage.js`; Center bei x=22–27, y=6–9, Portal (24,9).
- Innenraum: `src/world/maps/pokemonCenter.js`, 12×12 Tiles zu 48 px; Station/NPC (5,4), Ausgang (5,10), Spawn (5,8).
- `src/world/WorldRegistry.js` (`MapWorld`) besitzt Terrain, Kollisionen und Portale.
- `src/renderer/Renderer.js` zeichnet Canvas-Tiles, NPC und Spieler; Kamera: `src/core/Camera.js`.
- Dialoge: `src/ui/UI.js` und `src/core/Game.js`.
- Heilung: `src/center/CenterWorldInteraction.js` → `src/center/PokemonCenter.js` → `team.healAll()`; Kampfsperre: `src/battle/BattleLock.js`.

## Gestaltung (nicht kanonisch)
- Außen: rot-rosafarbenes Dach, ein zentrales helles Kreuzsymbol, hervorgehobener Türrahmen und Schwelle.
- Innen: klare blau-graue Wände, heller gekachelter Boden, farbiger Ausgang, türkisfarbene Heilungsstation mit Kreuzsymbol und freundlicherer Stationsfigur.
- Bei Annäherung an Station: Hinweis `E / Aktion: Heilen`. Nach **bestätigtem** Heilerfolg: 1,35 s Lichtkreuz/Glanz, zusätzlich der vorhandene Erfolgsdialog. Keine Animation bei gesperrter/fehlgeschlagener Heilung.
- Keine externen Bilddateien. Alle Ressourcen sind selbst erstellte, programmatisch gezeichnete Canvas-Rechtecke in `src/renderer/CenterArt.js`; pro Tile 48×48 logische Pixel, skaliert auf die vorhandene Tilegröße. Lichtkreuz ca. 38×38 logische Pixel, Hinweistext mit 12 px Schrift. Keine fremden Lizenzen.
- Das Zeichnen verändert weder Karten- noch Kollisionsdaten. Keine neuen NPCs oder Räume.

## Technische Einbindung
- `centerArt(ctx,terrain,x,y,t,tx,ty)` liefert `true`, wenn es eines der sechs Center-Terrain-Tiles zeichnet.
- `centerStationOverlay(ctx,world,camera,player,effectRemaining)` zeichnet Hinweis und Glanz im Canvas, ohne Spiellogik aufzurufen.
- `centerWorldEvent()` ergänzt **nur bei erfolgreichem** `healAtPokemonCenter()` das optionale Feld `centerHealSuccess: true` im vorhandenen Dialogereignis.
- `Game.applyWorldEvent()` setzt dann `centerHealEffect=1.35`; `Game.tick()` zählt den Timer pro Frame bis 0 herunter. Wiederholte Interaktionen starten den Timer erneut, aber erzeugen keine zusätzliche Heilung.
- `Renderer.render()` liest `Game.centerHealEffect` ausschließlich zur Anzeige.

## Grenzen / offene Sichtprüfung
- Der neue Stil ist vorläufig. Exakte Lesbarkeit, Schilderposition, Z-Order und Hinweis bei unterschiedlichen Desktop-Fenstergrößen werden im späteren gemeinsamen Desktop-Test des Pakets 029–033 geprüft.
- Kein manueller Browser- oder iPhone-Test in Auftrag 031.
