# Monsterreise v0.1 – Schnittstellen (vorläufig, implementiert)

Einheiten: Weltkoordinaten und Hitboxen in **Pixeln**; Zeitdifferenz `dt` in **Sekunden**. Bildschirmkoordinaten = Weltkoordinaten minus `camera.x/y`. Keine zyklischen Modulimporte.

- `core/Game.js`: `new Game({canvas: HTMLCanvasElement, controls: HTMLElement, world?: World})`; `start()`, `stop()`, `destroy()`. Besitzt `world`, `player`, `camera`, `input`, `renderer`, `ui`; aktualisiert in `requestAnimationFrame` mit begrenztem `dt` (max. 0,05 s). Nur Game koordiniert die Module.
- `player/Player.js`: `new Player(x,y,{width?,height?,speed?})`; öffentliche `x,y,width,height,speed,facing,center`; `update(dt,{x,y},world)`. Position = linke obere Ecke der Kollisionsbox. Richtungsvektor wird normalisiert. Kollisionen werden achsenweise geprüft.
- `world/World.js`: `new World(rows:string[],tileSize=48)`; `rows` ist ein rechteckiges Raster aus `.` (frei) und `#` (blockiert), `width,height,tileSize` in Pixeln; `isSolidTile(tx,ty):boolean`, `collidesRect(x,y,w,h):boolean`. Außerhalb der Karte gilt als blockiert. `createTestWorld()` ist **nur** Testinhalt. Chat 02 kann World später erweitern, ohne die öffentlichen Methoden zu ändern.
- `core/Camera.js`: `new Camera()`; `follow(player,world,viewportWidth,viewportHeight)` setzt `x,y,width,height`; Kamera wird an Kartenrändern begrenzt. Chat 05 kann zusätzliche Kameraeffekte später separat abstimmen.
- `core/Input.js`: `new Input(document,controlsElement)`; `getVector():{x:number,y:number}`, `clear()`, `destroy()`; Tastatur und Pointer werden zusammengeführt. UI-Elemente mit `data-dir=up|down|left|right` steuern Touch.
- `renderer/Renderer.js`: `new Renderer(canvas)`; `resize()`, `render({world,player,camera})`; Eigenschaften `width,height`. Keine Kollisions- oder Spielregeln. Chat 05 kann die Platzhalterzeichnung austauschen.
- `ui/UI.js`: `new UI(root)` und `setStatus(message)`; minimales Platzhaltermodul, kein Menüsystem.

## Integrationsregeln

1. Chat 02 stellt Kartenobjekte bereit, die `World`-Vertrag erfüllen; keine endgültigen Kartendaten aus dem Test ableiten.
2. Chat 05 zeichnet aus dem Game-Zustand, verändert aber nicht `Player` oder `World`.
3. Die Testwelt enthält weder NPCs noch Kartenübergänge oder Interaktionen. Diese Schnittstellen sind **noch nicht definiert** und werden vor Erweiterung mit Chat 00 abgestimmt.
4. Konfigurationswerte (48 px Kachel, 170 px/s, 26×30 px Hitbox) sind technische Provisorien, keine Spielentscheidungen.
5. Keine Speicherung, Story, Kampf-, Audio- oder Pokémon-Funktionen in v0.1.

## Pokémon-Grundmodul (Auftrag 007)
Siehe `docs/POKEMON_007.md` für die exportierten Funktionen und die Abgrenzung zu Battle/SaveSystem. Keine Laufzeitintegration in Game.

## Teamverwaltung (Auftrag 008)
`createTeam({registry})` → `assignStarter({speciesId,instanceId,level})`, `addMember(pokemon)`, `getMembers()`, `getMember(id)`, `moveMember(id,index)`, `removeMember(id)`, `toSaveData()`; `restoreTeam(saved,registry)` für SaveSystem. Details und Grenzen: `docs/TEAM_008.md`.

## Auftrag 010 – Dialogabschluss
`Game({onWorldEvent?: (event) => event})` unterstützt die Anreicherung von Dialogereignissen. Optionales `dialog.onComplete()` wird nach der letzten Zeile einmal aufgerufen. `ProfessorEncounter({team,openStarterSelection}).handle(event)` liefert für `npcId='professor-test'` einen Dialog mit Abschlussaktion nur solange `team.starterAssigned===false`; andere Ereignisse bleiben unverändert. Keine neue Starterverwaltung.
