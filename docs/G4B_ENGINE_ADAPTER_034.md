# Monsterreise 034 G4b – isolierte Engine-Adapter

Stand 2026-11-14. Implementierung ohne produktive Entry-Verdrahtung. **Kein Storymodus freigegeben.**

## Neue APIs

- `new InteractionGate({input})`: `acquire(reason)` gibt nicht fälschbares Referenztoken zurück, `release(token)`, `has(reason)`, `isBlocked()`, `canWorldAction(battleLock)`. Gründe: `dialog`, `cutscene`, `transition`, `story-commit`, `slot-switch`, `recovery`. Input wird bei Acquire und Release gelöscht. BattleLock bleibt eigenständig.
- `new SessionTickets({lease})`: `issue()`, `verify(ticket)`, `verifyRebind(ticket)`, `complete(ticket)`, `invalidate()`. Bindet Operationen an das echte `StorySessionLease`-Ticket und eine zusätzliche Generation.
- `new TrustedPortalAdapter({session: MuStorySession,gate,battleLock})`: `preview(player)` erzeugt intern autorisierte Portal-Capability; `verify(capability,player)`, `applyOrdinary(capability,player)`, `consumeForHatch(capability,player)`; kein `validated:true` oder vom Caller erfundener Event-Token zulässig. Route-1-Hatch benötigt echtes `tr-village-route1` auf `mu-start-village` nach `mu-route-1` und `route1-village-entry`. Der Hatch-Vertrag enthält eine **Ziel-Location**, mutiert aber keine Welt vor dem Gesamtcommit.
- `new StoryEngineCoordinator({gate,lease,tickets,portal,battleLock,bindings})`: `hatch({player,makeCandidate})`, `switchSlot(slotId)`, `recover()`, `fault`. `makeCandidate(event,leaseTicket)` liefert `{status:'ready',snapshot}` aus den **echten** StoryController-/StarterDomain-Guards; StorySaveSystem prüft den Gesamt-Snapshot beim `lease.commit`. Ein `not-committed` bindet niemals live; `uncertain`, verlorene Sitzung oder Rebindfehler behalten Recovery-Sperre.

## Rebind-Adapter für Chat 10

`bindings` muss alle drei synchronen Funktionen `prepare(snapshot)`, `apply(prepared)`, `restore(backup)` bereitstellen; `capture()` ist für Rollback empfohlen. `prepare` muss vor Mutation validiertes Team via `restoreTeam` und `bindTeamBattleLock`, Storykontext, Location über reale G4a-Registry, Slot-/Revision-/Commit-ID-Kontext, Menü-/BattleView-/NPC-/Centerreferenzen und Kamera bereithalten. `apply` aktualisiert **alle** Referenzen synchron, ohne `onTeamChanged`-Autosave; `restore` stellt bei Ausnahme den alten Livezustand wieder her. Bei Rebindfehler bleibt die Engine in Recovery. Der Coordinator ersetzt diese echten Abhängigkeiten absichtlich nicht durch Test-Validatoren.

## Zustandsfolge

`ready + gültige Portal-Capability → transition+story-commit Gate → Kandidat isoliert vorbereiten → StorySessionLease.commit → (not-committed: unverändert; uncertain: Recovery) → committed → Ticket/Rebind prüfen → synchron apply → confirmRebind → Input.clear/Gate freigeben`.

`ready → slot-switch Gate → Lease.switchSlot(prepared snapshot, synchroner rebind) → Generation invalidieren → Gate freigeben`. Während Dialog, Cutscene, Transition, Commit, Recovery und Kampf kein Slotwechsel.

**Integrationseinschränkung:** Die vorhandene `StorySessionLease.switchSlot`-API behandelt einen misslungenen Rebind als `REBIND_FAILED`, während der Coordinator zusätzlich Recovery sperrt. Der Rollback muss in Chat 10 mit echten Liveobjekten nachgewiesen werden. Ein fremder DOM-Callback darf den Coordinator nicht umgehen. `Game.update` und Dialog-/Welt-Eventrouting sind noch nicht verdrahtet; Chat 10 muss Gate-Guards vor Input-/Interaktionsverbrauch aufrufen. Der vorhandene `MuStorySession`-Adapter bleibt Eigentum Chat 02. Keine synthetischen Portalereignisse bei Reload oder Teleport.

## DEV-Isolation

Die 033-Dateien `src/main.js`, `src/core/Game.js`, `src/core/Input.js`, `src/world/WorldSession.js`, `src/battle/BattleLock.js`, `index.html` sowie Build-/Entry-Dateien sind unverändert. Die neuen Adapter werden vom DEV-Entry nicht importiert. Getrennte Story-/DEV-Builds und die konkrete Story-Registry-Auswahl implementiert allein Chat 10.

## Tests

`node --test tests/engine-g4b-034.test.js`: 12/12 bestanden. `node --test tests/*.test.js`: 304/304 bestanden. Node-Tests verwenden kontrollierte Adapter/Fakes für Commit- und Rebind-Szenarien; sie sind **kein** Browser-Web-Locks-, Desktop-E2E- oder iPhone-Nachweis. Die angegebene Zahl 255/255 für das Chat-09-Paket stammt aus dessen Lieferung; die 304er-Zahl bezieht sich auf den hier zusammengestellten Prüfbaum mit G3/G4a/G4b.

## Noch zu klären

1. Chat 10 muss die echten synchronen `bindings` inklusive Team-/Story-/Welt-/Kamera-/Menü-/BattleLock-Rebind liefern und Browser-E2E testen.
2. StoryController-/StarterDomain-Kandidaten müssen echte Guards und freigegebene Species-/Starterparameter verwenden; keine produktive Hatch-Freigabe durch diesen Adapter.
3. Bei `uncertain` muss Recovery die bestätigte Revision nach `StorySessionLease.recover()` neu binden; nicht automatisch neu vergeben.
4. Portal-Returnstack und Route-1-Rückweg mit Chat 02/10 bei echter Weltintegration abnehmen.
5. Session-Lease-Verlust und Browser-Mehrtab-Verhalten im Zielbrowser prüfen; Node-Mocks sind kein Web-Locks-Nachweis.
