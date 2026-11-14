# Monsterreise 034 G3b – isolierter StoryController (Chat 06)

Status: ausführbare isolierte Domäne; keine produktive Engine-/Save-/UI-Integration. Grundlage: 033 v0.4 + G2a + Chat-03-G3b. Chat-00-G3a-Artwahl hat Vorrang vor älteren Drei-Wünsche-Vorschlägen.

## Dateien und Grenzen

- `src/story/StoryController.js`: zwölf unveränderte `PROLOGUE_EVENTS`, `StoryController`, `createInitialStoryState`, `validateStoryState`, `validateStoryTransition`, `canEnterRoute1`, `validateRoute1Entry`.
- `tests/story-controller-034.test.js`: 16 neue Node-Tests.
- `docs/G3B_STORY_TEST.log`, `docs/G3B_CROSS_TEST.log`: reale Testausgaben.
- Alle übrigen Dateien sind unverändert gegenüber dem gelieferten G3b-StarterDomain-Archiv.

## APIs

`new StoryController({registry,policy,reserveIds,starterParameters,ownedIds=[],eggIds=[]})`

`controller.onEggWishSelected(speciesId,snapshot,context) -> StoryResult`: **einzige öffentliche Artenauswahlgrenze**; `speciesId` kanonisch, `birthday.wishId` bleibt Schema-v2-Feld. Die zusätzlichen `snapshot/context`-Parameter sind technische Dependency-Übergabe, keine weitere Auswahl-API. UI bindet sie per Closure und ruft nur `onEggWishSelected(speciesId)` auf.

`controller.handleStoryEvent(event,snapshot,context) -> StoryResult`: synchroner, reiner Kandidatenersteller (abgesehen von transientem Token-Dedupe). `event` enthält `eventId`, `mode:'story'`, `slotId`, `sessionEpoch` sowie szenenspezifische Bestätigungsfelder. Rückgabe `status:'prepared'` mit **vollständigem, abgetrenntem** `snapshot`, oder `scene`, `already-selected`, `already-completed`, `already-hatched`, `blocked`. Ein `prepared`-Resultat bedeutet **nicht** committed.

`validateStoryState(snapshot,{registry,policy,ownedIds,eggIds}) -> true | throws`: prüft Storyflag-Reihenfolge, Ei-/Wunschidentität, Team/BattleSync über Chat 03, Hatchkonsistenz. G2a-Adapter: nur `true` als gültig anerkennen; Exceptions als `false`/Validierungsfehler behandeln.

`validateStoryTransition(before,after,deps) -> boolean | throws`: Monotonie plus Zustand; Exceptions sind Ablehnung. Für G2a `validators.transition` als Wrapper injizieren.

`canEnterRoute1(snapshot,context,deps) -> {status:'ready'|'already-hatched'|'blocked',reason?}`: prüft Session, Locks, Storyflags, Ei und Teamkapazität. Portalmetadaten werden separat mit `validateRoute1Entry(event,context)` geprüft.

`controller.resetTransitionTokens()`: nur nach bestätigtem `not-committed`/Sessionwechsel, **nie** bei `uncertain` ohne Recovery; die persistierte Hatchflag-Prüfung bleibt maßgeblich.

## Kontext / Route-1-Gate

`context = {mode:'story',slotId,sessionEpoch,activeSessionEpoch,locked?:boolean,battleActive?:boolean}`. Der Integrator prüft zusätzlich den aktiven Session-Lease, Revisions-/Commit-Ticket und Interaktions-Gates. Bei falschem Epoch, Kampf oder Sperre wird fail-closed abgelehnt.

Das Route-1-Event benötigt exakt `eventId:'story.prologue.route1.first-entry'`, `source:'portal'`, `validated:true`, `fromMapId:'mu-start-village'`, `mapId:'mu-route-1'`, `transitionId:'tr-village-route1'`, `spawnId:'route1-village-entry'`, nichtleeres `transitionToken`, gleiche `slotId`/`sessionEpoch` und ein vom Kartenadapter validiertes `targetLocation`-Objekt. Ein beliebiger Aufrufer könnte `validated:true` behaupten: **die Authentizität dieses Feldes muss der vertrauenswürdige Chat-01/02-Adapter sicherstellen**, nicht ein UI-Event. Ein Reload/Teleport darf diese Metadaten nicht erhalten.

Die Reihenfolge ist 00 transienter Geburtstagsbeginn, 01 Artenwahl, 02 Ei-Geschenk, 03 Risse, 04 Giratina, 05 Absol, 06 freiwillige Expedition, 07 schillerndes Raupy, 08 Kampfvorführung, 09 Professor fängt Raupy, 10 sichere Rückkehr, 11 gültiger Route-1-Hatch. Szenen 03–10 benötigen `sceneCompleted:true`; 06 zusätzlich `voluntary:true`, 09 `caughtBy:'professor'`, 10 `safeReturn:true`.

## Commit und Wiederaufnahme

1. Vor dem Dispatch hält Chat 01/10 Session-Lease und Transition-/Commit-Sperre; aktiven Slot/Revision/Epoch validieren.
2. `prepared` enthält nur Kandidaten. Chat 09 `commit({slotId,expectedRevision,expectedCommitId,sessionEpoch,next,reason:'story-event'|'hatch'})` schreibt einen Gesamt-Snapshot und bestätigt Readback.
3. Nur bei `committed` und unverändertem Ticket vollständigen Engine-Rebind durch Chat 01/10; erst dann Szene/Bewegung freigeben.
4. `not-committed`: Kandidat verwerfen; Quell-/Gateposition kontrolliert wiederherstellen; Token erst nach freigegebenem Retry zurücksetzen. `uncertain`: Recovery und Sperre, kein Retry/zweiter Starter.
5. Bei Reload wird ausschließlich der letzte bestätigte Snapshot verwendet. `birthday.begin` bleibt transient. Ein ungeschlüpftes Ei auf Route 1 löst beim Laden **keinen** Hatch aus. Chat 02/10 müssen Gate-Rückweg bzw. Quellcheckpoint implementieren.

## Abhängigkeiten und offene Integrationsfragen

- **Chat 03:** `validateStarterSpecies`, `createStarterEgg`, `prepareStarterAssignment`, `validateStarterEgg`, `validateStoryTeam`; endgültige Arten-Policy, Level/Moves/HP/Shiny, Besitz-ID-Registry und `reserveIds` noch freizugeben. Keine feste Dreierliste.
- **Chat 09:** G2a `validators.story`/`validators.transition` per Wrapper; Gesamtcommit, Revision/Readback/Recovery; separater dauerhaft gehaltener Session-Lease zusätzlich zum G2a-Transaktionslock.
- **Chat 01/02:** vertrauenswürdiger Portal-Dispatch und `targetLocation`-Validierung; 033-`WorldSession` mutiert vor Event, deshalb sichere Vorabprüfung/Rollback. `source`/`validated` dürfen nicht von untrusted UI kommen. Input-/BattleLock-/Epoch-Gates.
- **Chat 10:** alleiniger Merge von `src/main.js`, Entry/Bootstrap/Build; Rebind von Team/UI/BattleLock/Location; Storymodus darf DEV-Professorstarter nicht importieren. Keine Änderungen dieser Dateien hier.
- **Offen:** finale Art-Ausschlüsse/Starterparameter, visuelle Giratina-/Absol-Reihenfolge, Dialoge, Gate-Geometrie, Session-Lease-API und Browser-End-to-End.

## Teststatus

`node --test tests/story-controller-034.test.js` und `node --test tests/starter-domain-034.test.js tests/story-save-034.test.js tests/story-controller-034.test.js`. Testlogs im Paket. Node-Tests sind keine Browser-/Web-Locks-/E2E-Abnahme. Ein Live-Commit und ein produktiver Hatch sind **nicht** implementiert.

## Übergabe Chat 00

Isolierter G3b-StoryController fertig; zwölf Events, 16 gezielte neue Tests, keine gemeinsamen Dateien verändert. Produktive Integration bleibt bis Chat-00-Freigaben und Chat-10-Merge gesperrt.
