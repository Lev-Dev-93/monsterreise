# Monsterreise 034 – G3b StarterDomain / Übergabe an Chat 00

**Stand:** 2026-11-14. **Status:** isoliert implementiert, nicht produktiv integriert.
**Basis:** G2a StorySave-Fundament, dessen bestehende Dateien gegenüber dem bereitgestellten Paket nicht geändert wurden; 033 Team/Pokemon.

## Verbindlich [F]

- Direkte Wahl einer kanonischen zulässigen Basisart aus Generation 1–4 über **`onEggWishSelected(speciesId)`** (öffentliche Story-API, Eigentümer Chat 06).
- `birthday.wishId` enthält dieselbe Art-ID wie `starterEgg.speciesId` nach Geschenk; das Ei ist kein Teammitglied.
- Ei von Adoptiveltern; Professor vergibt keinen Starter; Hatch ausschließlich nach validiertem `story.prologue.route1.first-entry` durch Chat 06/09/10.
- Ein bestätigter Schema-v2-Gesamtsnapshot und Rebind sind Voraussetzung für eine tatsächliche Vergabe. DEV/Legacy unverändert.

## Implementiert [I]

`src/pokemon/StarterDomain.js` exportiert:

- `resolveCanonicalSpeciesId(speciesId, registry)` – exakte ID, keine Namens- oder Dex-Alias-Konvertierung.
- `validateStarterSpecies(speciesId, {registry,policy})` – Gen 1–4, `isBaseSpecies`, `isExcluded`, `approved`, bestehendes `starterEligible` des 033-Registers; fail closed ohne freigegebene Policy.
- `reserveStarterIds({generateId,ownedIds,eggIds,maxAttempts})` – reserviert unterschiedliche IDs; Kollisionswiederholung, danach Fehler. `generateId` muss vom Integrator kryptographisch sicher und nichtdeterministisch bereitgestellt werden; Testgenerator nur in Tests. Alle weiteren Besitzbestände müssen in `ownedIds`/`eggIds` einfließen.
- `createStarterEgg({speciesId,registry,policy,ids})` – ungeschlüpftes G2a-Ei mit beiden stabilen IDs, Besitz und Geschenk-Event.
- `validateStarterEgg({egg,wishId,registry,policy,ownedIds,eggIds})` – reiner Validator für nicht empfangenes/ungeschlüpftes/geschlüpftes Ei; `wishId === speciesId` bei Besitz. Bei geschlüpftem Starter die eigene Pokémon-ID **nicht** als fremde Kollision übergeben.
- `validateStoryTeam(teamSave,registry,{ownedIds})` – Teamlimit, eindeutige IDs, Pflichtfeld `battleSync`, 033-Roundtrip ohne Verlust.
- `prepareStarterAssignment({teamSave,egg,wishId,registry,policy,ownedIds,eggIds,starterParameters})` – validiert, klont über `restoreTeam`, ruft `assignStarter` nur auf dem Klon auf, erzeugt Team-/Ei-Kandidat; `already-hatched` nur bei konsistentem Teamhistorienflag; kein Storage und kein Live-Rebind.

### Rückgabe

`{status:'prepared', teamSave, pokemon, egg}` bzw. `{status:'already-hatched',teamSave,egg}`. Alle Felder sind **unbestätigte isolierte Kandidaten**. Die neue Ei-Kopie hat nur im Kandidaten `hatchStatus:'hatched'`. `StorySaveSystem.commit` und Chat-06-Storyflags müssen separat in einem einzigen Schema-v2-Snapshot zusammengeführt und bestätigt werden. `not-committed` oder `uncertain` bedeutet **keine Live-Übernahme**.

### Parametrisierung / bewusst nicht produktiv

`policy.approved === true` und `starterParameters.explicitTestOrApproved === true` sind explizite Integrationsgates; der Integrator muss die Freigabe durch Chat 00 nachweisen. Kein vorgegebener Level, kein Shiny-Zufall, keine kanonische Attackenliste, keine HP-Formel. Für isolierte Tests werden `level:5`, `shiny:false`, `calculateMaxHp:()=>22`, `acceptLegacyMovesForTest:true` verwendet – **ausschließlich Testwerte**.

**033-Einschränkung:** `Team.assignStarter()` wählt Attacken aus `starterMoves.js`, setzt `shiny:false` und perfekte IVs. Diese API kann kein frei injiziertes Moveset oder `shiny:true` vergeben. Der G3b-Adapter prüft gewünschte Moves gegen das tatsächliche 033-Ergebnis und verweigert `shiny:true`. Vor produktivem Hatch ist entweder die Freigabe der 033-Attacken und Shiny-Regel oder eine kompatible Erweiterung von `Team.assignStarter` durch Chat 03 nach Chat-00-Entscheid erforderlich. HP werden ausschließlich im isolierten serialisierten Kandidaten ergänzt und erneut per 033-Roundtrip geprüft.

### Entscheidungsbedarf Chat 00 [O]

| Thema | Optionen / Empfehlung | Folge |
|---|---|---|
| Ausschlussliste | **Empfehlung:** Gen 1–4, nur erste Entwicklungsstufen; ausschließen: legendär, mysteriös, Baby-/Sonderarten **nur nach expliziter Entscheidung**, Spezial-/Eventformen und nicht spielbare Arten; für Arten ohne Evolution (z. B. Ein-Stufen-Pokémon) Basisstatus ausdrücklich definieren. Keine vollständige Liste ohne kanonischen Katalog behaupten. | `policy.isBaseSpecies`, `policy.isExcluded` gegen freigegebenen Species-Katalog implementieren; `starterEligible` in 033 ist nur Testdatenindikator. |
| Startlevel | Level 1 (Ei-Logik), 5 (klassischer Starter), anderes | Vor produktivem Hatch festlegen. |
| Attacken | Artabhängige kanonische Level-1-Attacken, freigegebene 033-Testattacken, oder eigene Startersets | 033 hat bisher nur technische Testvorschläge; ggf. `assignStarter` kompatibel erweitern. |
| KP | offizielle Gen-IV-Formel mit Level/IV/EV oder freigegebene eigene Regel; aktuelle/maximale KP beim Hatch | Reine `calculateMaxHp`-Funktion festlegen; aktuelle KP initial = max. |
| Shiny | nie, Zufallschance, deterministisch bei Ei-Reservierung | Zufallsentscheid **einmal beim Geschenk** persistent machen oder Schema v2 erweitern; 033-API kann `shiny:true` nicht direkt vergeben. |
| ID-Pool | alle Team-/PC-/Zucht-/Ei-IDs übergeben, inklusive bereits abgelegter Starter | Eindeutigkeit über vollständige Besitzbestände und persistierten Slot sicherstellen. |

**Wichtiger Konflikt:** Das G2a-Eischema besitzt kein Shiny-Attribut. Eine Shiny-Entscheidung beim Geschenk braucht eine explizite Schemaentscheidung oder eine erst beim Hatch getroffene, danach persistierte Entscheidung. Keine heimliche Änderung des Schema v2.

## Tests

`node --test tests/starter-domain-034.test.js` – 14 isolierte Tests, einschließlich Team 0/5/6, Idempotenz, ungültiger Art, Ei-/ID-Kollisionen, BattleSync und fehlenden Starterparametern. `npm test` führt zusätzlich die vorhandene G2a/033-Suite aus. Kein Desktop-/Browser-E2E.

## Übergabe Chat 00 / 06 / 09 / 10

**Geändert/neu:** `src/pokemon/StarterDomain.js`, `tests/starter-domain-034.test.js`, `docs/STARTER_DOMAIN_G3B_034.md`; bestehende Dateien unverändert. **Keine Änderungen** an `src/main.js`, Entry, UI, produktivem Save oder `Team.js`.

**Chat 06:** Auswahlcallback nutzt `validateStarterSpecies`, speichert `birthday.wishId`; Geschenkcommit reserviert IDs und setzt `starterEgg.speciesId` identisch. Eventguards bleiben bei 06.
**Chat 09:** G2a Validator-Injektion: `validators.team` kann `validateStoryTeam`, Ei-/Story-Verknüpfung erfordert `validateStarterEgg` plus Chat-06-Storyvalidator. Die bestehende G2a-Signatur ist zu adaptieren, nicht blind als austauschbar anzunehmen. Savefehler/Readback und `uncertain` liegen bei 09.
**Chat 10:** Erst nach bestätigtem Gesamtcommit Team-/UI-/Battle-Rebind; keine automatische Hatch-Verdrahtung. Session-Lease und Transaktionslock bleiben Integrationsthemen.
