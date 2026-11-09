# Entwicklungsauftrag 002 – Weltmodule (Integrationsvertrag, vorläufig)

## Grundlage
Projekthandbuch v1.0, insbesondere Kapitel 2, 8 und 30; vorhandene v0.1-Dateien unverändert. `docs/STATUS.md` ist veraltet; v0.1 läuft laut Übergabe auf Mac und iPhone. Die beiliegende ZIP ist die im Projekt verfügbare v0.1-Codebasis; ihre Identität mit der genannten GitHub-Pages-ZIP ist nicht nachgewiesen.

## Implementiert und automatisiert getestet
- `src/world/maps/startVillage.js`: 32×24 Tiles, Nordwald, Süd-Felder, Wege, Dorfplatz, vier **provisorische** Gebäudeblöcke, Brunnen, Bäume, ein NPC und ein Türportal. Namen und Gebäudeverteilung sind nicht beschlossen.
- `src/world/maps/sampleHouse.js`: 12×12 Tiles, neutraler betretbarer Testinnenraum (nicht das festgelegte Elternhaus).
- `src/world/WorldRegistry.js`: `MapWorld extends World`, bewahrt `rows`, `tileSize`, `width`, `height`, `isSolidTile`, `collidesRect`; ergänzt `id`, `label`, `terrain`, `portals`, `npcs`, `spawn`, `tileAt(tx,ty)`. `createWorldRegistry(): Map<string,MapWorld>`.
- `src/world/WorldSession.js`: `new WorldSession(registry?,initialMap?)`, `world`, `mapId`, `spawn():{x,y}`, `interact(player): null | {type:'dialog',npcId,speaker,lines} | {type:'transition',from,to,x,y,world} | {type:'blocked',reason}`. Einheiten Pixel für Spieler, Tile-Koordinaten für Kartenobjekte. Die Interaktion prüft die benachbarte Kachel in Blickrichtung. Rückkehrposition wird als Pixelposition gespeichert.
- `tests/world-v02.test.js`: Hindernisse, Bewegung, Kartenwechsel, Rückkehr, NPC-Interaktion und fehlender Rückkehrkontext.

## Erforderlicher Integrationsauftrag an Chat 01 und Chat 00 (NICHT umgesetzt)
1. `Game` erzeugt `WorldSession` und startet auf `session.world` bei `session.spawn()` statt auf `createTestWorld()`. Bei einem Transition-Event `game.world=event.world`, `player.x/y=event.x/y` setzen, Kamera sofort neu berechnen.
2. `Input` erhält ein einmaliges `interact`-Signal über Enter/Leertaste und eine separate iPhone-Schaltfläche; keine Änderung an der bestehenden Richtungssteuerung. Kein wiederholtes Auslösen durch gedrückte Taste.
3. `Game` ruft bei diesem Signal `session.interact(player)` auf und reicht `dialog`-Ereignisse an das Dialog-/UI-Modul weiter. Während Dialogen Bewegung blockieren. Die vorläufigen NPC-Texte sind **keine Storyfestlegung**.
4. `Renderer` (Chat 05) zeichnet `world.terrain` (grass/path/stone/tree/house/door/field/well/floor/wall) und `world.npcs` als Platzhalter. Die v0.1-Renderer-Methode zeichnet ansonsten nur freie und blockierte Kacheln; neue Terrain-Details wären derzeit nicht sichtbar.
5. Beim späteren SaveSystem (Chat 09) `mapId`, Spielerposition und `returnPositions` speichern, ohne statische Kartendaten zu serialisieren.

## Nicht implementiert / offene Entscheidungen
- Kein browserseitig lauffähiger v0.2-Integrationsbuild, keine manuellen Mac-/iPhone-Tests; v0.1-Engine-Dateien blieben unverändert.
- Noch keine endgültigen Grafiken, Namen, Dorfgeometrie, Hausfunktionen, Story-NPCs, Bach, mehrstöckiges Elternhaus, dynamische NPC-Bewegung oder Speicheranbindung.
- Kartenlayout ist ein **technischer Vorschlag**. Dorfname und genaue Gebäudeanordnung benötigen Entscheidung durch Chat 00/Nutzer.
- Für Produktionsqualität vor Integration noch prüfen: Spawn-Validierung für sämtliche Portale, Türen bei gedrückter Interaktion, mobiles Dialoglayout und visuelle Erreichbarkeit.
