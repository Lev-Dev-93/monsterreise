# Auftrag 018 – dauerhafte KP und AP

## Grundlage
Projekt-Handbuch Master 1.0; bestehende Module aus Integrationskandidat 017. Keine neuen endgültigen Formeln, Heilregeln oder Attackenlisten festgelegt.

## Datenmodell (Pokemon.js)
- `currentHp: number|null`, `maxHp: number|null`: `null` bedeutet noch nicht berechnet; bei Initialisierung werden beide auf das berechnete Maximum gesetzt, sofern aktuelle KP fehlen.
- `moveIds: string[]`: bestehende Attacken-IDs bleiben erhalten.
- `movePp: null|Record<moveId,{current:number,max:number}>`: individuell verbrauchte und maximale AP. `null` bedeutet uninitialisiert. AP-Werte sind an die erlernten Attacken gebunden.
- `serializePokemon` und `deserializePokemon` übernehmen die neuen Felder; ältere Spielstände ohne Felder bleiben lesbar. Das bestehende SaveSystem und sein Versionsformat bleiben unverändert.

## API
- `initializeHp(pokemon, calculateMaxHp)` initialisiert mit explizit injizierter Funktion. Setzt niemals bereits verbrauchte KP zurück.
- `initializeMovePp(pokemon, moveRegistry)` ergänzt fehlende AP aus Stammdaten und bewahrt vorhandene AP.
- `applyHpLoss(pokemon, amount)` begrenzt bei 0.
- `healHp(pokemon, amount=Infinity)` begrenzt beim gespeicherten Maximum.
- `consumePp(pokemon, moveId, amount=1)` verweigert Überverbrauch.
- `restorePp(pokemon, moveId, amount=Infinity)` begrenzt beim individuellen AP-Maximum.
- `Battle` verwendet bestehende Pokémon-Instanzen, initialisiert AP bei vorhandenem Register und zieht AP unmittelbar von den Instanzen ab. Kampf-KP werden ebenfalls direkt an den übergebenen Instanzen verändert.

## Integrationsvertrag Chat 04/07/09
`createTeam().getMembers()` liefert **Kopien**. Ein Kampf mit diesen Kopien verändert nicht automatisch das interne Team. Die Übernahme der aktualisierten Instanzdaten in die Teamverwaltung muss in einem gesonderten Auftrag erfolgen; keine automatische Kampfheilung oder stillschweigende Synchronisation. Für den SaveSystem-Pfad werden die Werte bei Speicherung einer aktualisierten Teaminstanz mitserialisiert; SaveSystem selbst wurde nicht geändert.

## Offene Entscheidungen
- Statuswertformel und damit KP-Maximum; bestehender Adapter benötigt injizierte Formel.
- Behandlung eines geänderten KP-Maximums bei Levelaufstieg/Entwicklung; nicht implementiert.
- AP-Erhöhungen, mehrfach erlernte identische Attacken, PP-Maximum durch Items; aktuell AP nach Attacken-ID.
- Regel für die Übernahme von Kampfergebnissen in das Team, Speichern während laufender Kämpfe und etwaige Synchronisationskonflikte.
- Ausführliche Heilregeln und Verbrauch bei Sonderaktionen/Statusattacken.

## Tests
`npm test`: 116 bestanden, 0 fehlgeschlagen, davon 9 neue Tests in `tests/pokemon-018.test.js`. Keine manuelle Browserprüfung.
