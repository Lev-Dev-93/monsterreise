# Monsterreise 034 G4a – isoliertes Kartenpaket

Basis: 033 v0.4. Tilegröße 48 Pixel. Begehbare Testgeometrie, keine finalen Grafiken oder NPC-Szenen. Keine Änderungen an vorhandenen 033-Dateien, kein Story-Hatch.

## Karten und Spawnpunkte (Tile x,y; Pixel x48)

| Map-ID | Größe | Spawns |
|---|---|---|
| mu-breeder-house | 16x12 | house-start (8,6), house-door-return (8,8) |
| mu-breeder-farm | 24x18 | farm-arrival (12,10), farm-house-return (11,9), farm-village-return (19,10) |
| mu-start-village | 30x22 | village-farm-entry (3,11), village-route1-return (25,11), village-professor-return (15,11) |
| mu-professor-house | 16x12 | professor-entry (8,8) |
| mu-route-1 | 30x20 | route1-village-entry (4,10), route1-return-entry (8,10) |

## Portale und Transition-IDs (Quelltiles)

| ID | Portal-ID | Quelle | Zielspawn |
|---|---|---|---|
| tr-farm-house-enter | pt-farm-house-door | farm (11,7) | house-door-return |
| tr-farm-house-exit | pt-house-exit | house (8,10) | farm-house-return |
| tr-farm-village | pt-farm-village | farm (22,10) | village-farm-entry |
| tr-village-farm | pt-village-farm | village (1,11) | farm-village-return |
| tr-village-professor-enter | pt-professor-door | village (15,8) | professor-entry |
| tr-professor-village-exit | pt-professor-exit | professor (8,10) | village-professor-return |
| tr-village-route1 | pt-village-route1 | village (28,11) | route1-village-entry |
| tr-route1-village | pt-route1-village | route1 (1,10) | village-route1-return |

## Schnittstellen

Chat 01/10: `createMuStoryRegistry()`, `MU_STORY_MAPS`, `MU_STORY_START`, `new MuStorySession({registry?,initialMap?,battleLock?})`. Session-Methoden: `spawn(spawnId?)`, `previewTransition(player)` (mutationsfrei), `updatePosition(player,{canTransition?})`, `rollbackTransition(event)`, `getLocation(player)`, `validateLocation(location,width?,height?)`, `restoreLocation(location,width?,height?)`. Der synchrone Guard `canTransition` muss explizit `true` liefern. Übergangsresultat: `{type,from,to,x,y,world,fromMapId,mapId,transitionId,spawnId,portalId,transitionToken,sourceCheckpoint,eventId}`. Ziel `x/y` in Pixeln. Engine muss Spieler/Kamera auf Zielposition setzen und bis zur asynchronen Storyentscheidung Input sperren. Bei abgelehntem Commit Quellcheckpoint via `rollbackTransition` wiederherstellen, nicht speichern.

Chat 06: Bei `tr-village-route1` wird lediglich `eventId:'story.prologue.route1.first-entry'` geliefert. Keine Ei-/Team-/Story-Mutation; vollständige Guards, Idempotenz und Hatch bleiben im StoryController. Gate-Spawn Route 1 (4,10), Pixel (192,480), Rückweg vorhanden.

Chat 09: 033-kompatibles Location-Objekt `{mapId,x,y,facing,returnPositions}`; Pixelkoordinaten und `up|down|left|right`. `returnPositions` bleibt kompatibel, wird bei expliziten bidirektionalen Storyportalen nicht gepusht. Save-Validierung zusätzlich zu Weltkollision durch Domänenvalidatoren. Keine Legacy-Migration.

Chat 10: Story-Registry nur im getrennten Story-Entry registrieren; `start-village` und bestehende DEV-Karten unverändert. Kein Merge von `src/main.js`, Bootstrap oder Builds in diesem Paket.

## Tests und Grenzen

`node --test tests/mu-world-034.test.js`: 7/7 bestanden; siehe `docs/G4A_TEST.log`. Abgedeckt: Karten-/Transition-IDs, DEV-Isolation, Kollision/Spawns, alle 8 bidirektionalen Portale, Portal-Pingpong, Route-Metadaten, blockierte/ungültige Ziele ohne Mutation, Rollback, Pixel-Save, BFS-Erreichbarkeit. Kein Desktop-Browser-E2E, keine 220er Vollregression.

Offen: Engine-Player-/Kamera-Anbindung, Story-/Save-Commit und Session-Lease, `uncertain`-Recovery, Epoch-/Slot-Tickets, finale NPC-/Grafikgestaltung, 033-ReturnStack-Abgleich. Rollback ist nur vor dem nächsten Übergang und unter Eingabesperre zulässig; Token ist sitzungslokal. `validateLocation` prüft keine Storyflags.

## Übergabe Chat 00

Neue Dateien: fünf Karten, `muMapFactory.js`, `MuStoryWorld.js`, ein Test, diese Dokumentation und Testlog. Bestehende 033-Dateien unverändert. 7/7 gezielte Tests bestanden. Isolierte G4a-Übergabe an Chat 01/06/09/10; keine produktive Engine-Integration und kein Starter-Schlüpfen.
