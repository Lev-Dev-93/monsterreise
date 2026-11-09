# Entwicklungsauftrag 008 – Pokémon-Teamverwaltung

## Verbindliche Grundlagen
Projekthandbuch Master 1.0, Kapitel 14 und 18: maximal sechs aktive Pokémon; PC für weitere Pokémon; Wechsel außerhalb von Kämpfen; Teammenü mit Sprite, Name, Level, Typ, Status. Starter sind berechtigte Basisformen und haben sechs perfekte IVs. Die sichtbare Auswahl ist nicht Teil dieses Auftrags.

## Dateien und Schnittstellen
- `src/pokemon/Team.js` importiert `createPokemon`, `serializePokemon`, `deserializePokemon` aus `src/pokemon/Pokemon.js` (Auftrag 007). Keine zweite Instanzklasse.
- `MAX_TEAM_SIZE` = 6.
- `createTeam({registry, members?, starterAssigned?})`: Teamzustand erzeugen, optional aus validierten Instanzen. `members` sind Pokémon-Instanzen oder serialisierte Instanzen.
- `team.assignStarter({speciesId, instanceId, level})`: genau einmal pro Spielstand; validiert Starterberechtigung über Pokemon.js; erzeugt perfekte IVs; keine automatische Levelwahl.
- `team.addMember(pokemon)`: bestehende Nicht-Starter-Instanz hinzufügen, wenn Platz und ID eindeutig.
- `team.getMembers()`, `team.getMember(instanceId)`: defensive JSON-Kopien, keine direkten internen Referenzen.
- `team.moveMember(instanceId, targetIndex)`: Reihenfolge ändern (Index 0-basiert).
- `team.removeMember(instanceId)`: Instanz entfernen und zurückgeben oder `null` (für spätere PC-Übergabe). **Keine PC-Lagerung implementiert.**
- `team.size`, `team.starterAssigned`: schreibgeschützte Abfragen.
- `team.toSaveData()` und `restoreTeam(saved, registry)`: JSON-kompatibler Teamzustand einschließlich dauerhaftem Startervergabe-Flag. Speichern selbst erfolgt später durch SaveSystem.

## Grenzen / offene Integration
`instanceId` muss der Aufrufer spielstandweit eindeutig vergeben. Das Team prüft Eindeutigkeit nur innerhalb des Teams; spätere PC-Integration muss teamübergreifende Duplikate verhindern. `removeMember` ist eine technische Operation und keine Entscheidung über PC-Transfers oder Mindestteamgröße. Das Handbuch legt keine Mindestteamgröße, kein Startlevel und keine genaue Sortier-/Filtersemantik fest. Daher keine zusätzlichen Einschränkungen, automatischen PC-Transfers oder Starterlevel-Vorgaben. Einmal vergebene Starter bleiben auch nach Entfernen/Save als vergeben markiert. Der UI-Aufrufer muss Änderungen außerhalb von Kämpfen koordinieren; Team.js kennt keinen Kampfzustand.

## Tests
`npm test`: bestehende Tests plus `tests/team-008.test.js`. Keine Änderungen an Engine, Welt, Bewegung, UI oder Kampf.
