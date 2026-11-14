# Monsterreise 034 – G2a: StorySaveSystem

**Stand:** 2026-11-14. **Status:** isoliertes Speicherfundament implementiert, nicht in Engine eingebunden. Grundlage: `MONSTERREISE_034_G1_FINALER_STORY_SPEICHERVERTRAG_CHAT09.md`.

## Dateien

- `src/save/StorySaveSystem.js`: reine, injizierbare Save-API, Web-Locks-Adapter, Revisionen, Commit-/Readback-/Recovery-Protokoll.
- `src/save/StorySaveValidation.js`: Schema-v2-Struktur, Storyflag-/Ei-Grundinvarianten, monotone Übergangsregeln.
- `tests/story-save-034.test.js`: 24 neue isolierte Speichertests.
- `docs/STORY_SAVE_G2A_034.md`: diese Schnittstellen- und Integrationsdokumentation.

**Unverändert:** `src/save/SaveSystem.js`, `src/main.js`, alle Legacy-Slots und alle bestehenden Tests. Kein Starter-Hatch, keine Karten, kein Engine-Rebind.

## Konstruktion und Adapter

```js
import {StorySaveSystem,createWebLockAdapter} from './src/save/StorySaveSystem.js';
const save = new StorySaveSystem({
  storage: window.localStorage,
  locks: createWebLockAdapter(navigator.locks),
  clock: () => new Date().toISOString(),
  ids: () => crypto.randomUUID(),
  sessionEpoch: () => activeSessionEpoch,
  validators: {
    team: async snapshot => /* Chat 03: real restoreTeam, BattleSync, IDs */ true,
    story: async snapshot => /* Chat 06: mapping and story invariants */ true,
    location: async snapshot => /* Chat 01/02: real story registry */ true,
    transition: async (before,after,reason) => /* domain transition guards */ true
  }
});
```

**Achtung:** `true` in diesem Beispiel ist nur ein Platzhalter und **darf nicht produktiv übernommen werden**. Alle vier Validatoren sind verpflichtend und müssen bei realer Integration vollständige Domänenprüfungen durchführen. Rückgabe muss strikt `true` sein; Exceptions oder andere Rückgaben lehnen ab. Validatoren erhalten geklonte Daten, dürfen keine externen Seiteneffekte auslösen. Die strukturelle Prüfung ersetzt diese Adapter nicht.

## API

- `key(slotId)` – nur 1, 2, 3; Schlüssel `monsterreise.story.v1.slot.N`.
- `create(slotId, initial)` – exklusiver Slotlock, Slot muss leer sein, vollständige Validierung, Revision 0, frische Commit-ID und UTC-Zeit, ein Key-Write plus Readback.
- `load(slotId)` – liest und validiert, `{status:'ok',snapshot}` / `{status:'empty'}` / `{status:'error',reason}`; keine Mutation.
- `listSlots()` – drei Slotzusammenfassungen, inklusive Fehlerstatus bei korruptem Slot.
- `commit({slotId,expectedRevision,expectedCommitId,sessionEpoch,next,reason})` – `reason` in `story-event|hatch|manual-save`; unter exklusivem Lock erneut lesen, Revision und Commit-ID vergleichen, Snapshot- und Übergangsvalidierung, Revision +1, Readback.
- `recover(slotId)` – nur nach lokalem unklarem Commit, unter Lock gegen den unveränderten vorherigen oder exakt erwarteten neuen Payload prüfen. Bei fremder Version bleibt der Slot blockiert.
- `validateSnapshot(snapshot[,slotId])`, `validateTransition(before,after,reason)` – asynchrone Prüfungen.

**Resultate:** `committed` mit vollständigem Snapshot, `not-committed` mit `reason`, oder `uncertain` mit `reason`. `uncertain` sperrt weitere Writes des betroffenen Slots in der aktuellen SaveSystem-Instanz bis erfolgreicher Recovery. Andere Tabs müssen eigene Konflikte per Revision erkennen.

## Garantien und Grenzen

- Ein einzelner JSON-Snapshot enthält Schema, Modus, Slot, Revision, Commit-ID, UTC-Zeit, `team` einschließlich `battleSync`, `location` einschließlich Pixelposition und Rückkehrstapel sowie sämtliche Chat-06-Flags und Ei-IDs.
- Strikte Top-Level-/Story-/Location-Felder, keine stillen Defaults, keine Migration und keine automatische Reparatur. Teammitglieder bleiben verlustfrei als vollständige JSON-Objekte erhalten; ihre **inhaltliche** Validierung ist Aufgabe des injizierten Chat-03-Adapters.
- Schreibfehler werden durch Readback klassifiziert: exakt neuer gültiger Payload = `committed`, exakt alter Payload = `not-committed`, sonst `uncertain`.
- Exklusive Web Locks für jede Schreiboperation; fehlt der Lock, wird nicht geschrieben. Revision/Commit-ID schützen gegen veraltete Sitzungen. Der Adapter **hält keinen dauerhaften Sitzungslok**: gleichzeitige offene Tabs dürfen keine nicht persistierten Änderungen als sicher betrachten; die Engine muss bei fremder Revision neu laden und alte Session-Callbacks verwerfen. Für dauerhaft exklusiven Live-Slotbesitz ist ein zusätzlicher, von Chat 01/10 verwalteter Session-Lock vor Storyintegration erforderlich.
- Ein Readback ist keine Garantie gegen Browser-Crash, Eviction oder physischen Stromverlust. Ein bereits bestätigter Write kann außerhalb der Kontrolle des Systems verloren gehen.
- Das `recover`-Journal liegt nur im Speicher der aktuellen Instanz. Nach einem vollständigen Browser-Neustart wird der Slot normal validiert geladen; ohne persistierten Vorgängerbeleg ist eine historische Commit-Unterscheidung nicht möglich. **Kein** zusätzlicher Journal-Key, um die Ein-Snapshot-Transaktion nicht zu verletzen.
- Es gibt noch keine echten Storykarten oder freigegebenen Pokémon-Domänenvalidatoren in dieser Lieferung. `create` erzeugt keinen erfundenen Spawn; der Aufrufer liefert den initialen validierten Snapshot.
- `StorySaveSystem` berührt weder `Game`, DOM, UI noch `src/main.js`.

## Tests

`npm test` im Projektverzeichnis: **244/244 bestanden**, davon **220 unveränderte Bestandstests** und **24 neue isolierte G2a-Tests**. Protokoll `G2A_TESTPROTOKOLL.md` im Paket. Die 38 G1-Speicherfälle sind **nicht alle als End-to-End-Tests umgesetzt**: Hatch, Cutscenes, BattleLock, echte Mapkollisionen, reales Engine-Rebind und Mehrtab-Browser-E2E bleiben Integrationstests für G3–G7.

## Freigabeblocker vor Integration

1. Chat 03: realer `restoreTeam`-/Pokémon-/BattleSync-/Ei-ID-Validator; Besitzbestände und Story-Species-Whitelist.
2. Chat 06: realer Story-/Transitionsvalidator, freigegebenes Wunschmapping und Eventguards.
3. Chat 01/02: reale Story-Registry, Startspawn, Position-/Return-Stack-Validator und Route-1-Gate-Recovery.
4. Chat 01/10: Session-Lock-Lebenszyklus, aktiver `sessionEpoch`-Kontext, vollständiger Engine-Rebind, Sperren während Kampf/Dialog/Transition.
5. Chat 10: gemeinsamer Merge, reale Web-Locks-Browserprüfung, weitere G1-Testfälle, Desktop-End-to-End.

## Übergabe Chat 00

**Implementiert:** neues isoliertes Schema-/Save-/Readback-/Recovery-Fundament. **Getestet:** 24 neue Tests und 220 Legacy-Regressionen bestanden. **Offen:** reale Domänenadapter und Browser-/Mehrtab-Integration. **Nicht integriert:** Startervergabe, StoryController, Welt, Game, UI, main.js. **Empfehlung:** G2a als isolierte technische Lieferung abnehmen; keine Freigabe für produktive Story-Schreibvorgänge oder Hatch vor Abschluss der Integrationsblocker.
