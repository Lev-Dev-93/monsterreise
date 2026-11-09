# Entwicklungsauftrag 004 – v0.2.1 Integrationsvertrag

## Beschlossene Änderung
Gebäudeübergänge erfolgen automatisch beim Betreten einer Tür-/Ausgangskachel. Enter/Leertaste und die Touch-Aktionstaste bleiben für NPCs und gezielte Interaktionen reserviert.

## Kartendaten (provisorische Testgeometrie, mit Chat 02 abzugleichen)
- `start-village`: sichtbare Haustür, nicht blockierte Kachel und Portal befinden sich gemeinsam bei `(7,9)`. Die zuvor fälschlich zweite Tür `(8,9)` ist wieder Gebäudewand. Die freie Außenkachel `(7,10)` ist der Rückkehr-Spawn.
- `sample-house`: Ausgang bei `(5,10)`; Eingangsspawn `(5,8)` ist frei. Es handelt sich nicht um das kanonische Elternhaus.
- Portalobjekt: `{id,x,y,targetMap,activation:'enter',targetSpawn?,returnSpawn?,returnToPrevious?}`; sämtliche Koordinaten der Mapobjekte sind Tiles, Spielerpositionen Pixel.
- Für normale Eingangstüren müssen `targetSpawn` und `returnSpawn` freie, geeignete Kacheln bezeichnen. Für Rückkehrportale ist `returnToPrevious:true` vorgesehen.

## Schnittstellen
- `WorldSession.updatePosition(player): null | transition | blocked` wird nach jeder Spielerbewegung aufgerufen. Der Spielerzentrum-Tile bestimmt die Auslösung; je betretenem Tile wird höchstens ein Ereignis erzeugt.
- `WorldSession.interact(player)` liefert weiterhin NPC-Dialogereignisse, **keine** Portalübergänge mehr.
- `Game.update(dt)` aktualisiert Bewegung, prüft automatische Portale und setzt bei Übergang sofort `world`, `player.x/y`, Kamera und Statusanzeige.
- `Game.applyWorldEvent(event)` verarbeitet Welt-Ereignisse; `Game.interact()` bleibt für NPCs und Dialogfortschritt.
- `returnPositions` speichert bei Hauseintritt den definierten sicheren Außen-Spawn, nicht mehr die exakte Pixelposition vor der Tür. Der Stack bleibt für spätere SaveSystem-Anbindung vorgesehen.
- `lastPortalKey` ist eine Laufzeit-Entprellung pro Karte/Kachel; keine feste Zeitverzögerung. Bei Kartenwechsel wird die Ankunftskachel markiert, damit kein sofortiger Rückwechsel stattfindet.

## Renderer / Chat 05
`Renderer.render({world,player,camera})` bleibt unverändert. Die Welt liefert `terrain='door'` auf derselben Kachel wie das Portal. Gebäude bleiben provisorische farbige Kachelblöcke. Die spätere Darstellung muss exakt diese Kachelgeometrie verwenden oder in Abstimmung mit Chat 02 beide gemeinsam anpassen.

## Tests
`npm test` (Node.js): 21/21 bestanden. Darin enthalten: bestehende Engine-, Welt- und Integrationsprüfungen (an automatische Türen angepasst) sowie fünf neue Prüfungen für Tür-Ausrichtung, Bewegung durch Portale, sichere Spawns, Entprellung, NPC-Interaktion und Kamera.

Nicht ausgeführt: manuelle Browserprüfung auf GitHub Pages, Safari/Mac, Safari/iPhone, Touch und Orientierung. Daher nur **v0.2.1 Integrationskandidat**.

## Grenzen
Keine endgültigen Gebäude, NPC-Namen, Dialogtexte, Grafik oder Storyentscheidungen. `docs/STATUS.md` aus dem frühen Projektstand wurde nicht als aktueller Implementierungsnachweis verwendet. Der alte Vertrag `WORLD_V02_INTEGRATION.md` bleibt als historischer Stand bestehen und wird durch dieses Dokument hinsichtlich Portalen überschrieben.
