# Auftrag 027 – vorläufiges, betretbares Pokémon-Center

## Grundlage / Freigabe
Aufbauend auf geliefertem Integrationskandidaten 026. Die Kartenanordnung ist ein technischer Platzhalter, keine Festlegung der endgültigen Dorfplanung. `docs/STATUS.md` ist im gelieferten ZIP nicht enthalten; es wurde keine Statusdatei erfunden oder überschrieben.

## Standort und Ablauf
- Bestehende Karte `start-village` (32 × 24, Tilegröße 48); bisher ungenutztes nordöstliches Platzhaltergebäude x=22–27, y=6–9 wird als Center gekennzeichnet. Vorhandenes Testhaus x=5–10 und alle drei bisherigen NPCs bleiben unverändert.
- Tür `village-center-door` auf (24,9), von (24,10) begehbar; automatische Portalaktivierung beim Betreten der Kachel.
- Innenraum `pokemon-center` (12 × 12), Spawn (5,8), Ausgang (5,10). Die Rückkehrposition ist (24,10) im Dorf, nicht die Eingangsportal-Kachel. `WorldSession.returnPositions` erhält die Position auch bei Save/Load.
- Heilungsstation: blockierender NPC `center-healing-station` auf (5,4), Interaktion von (5,5) mit Blick nach oben. Darstellung durch vorhandene NPC-Zeichnung und türkisfarbene Kachel; keine neue Grafik-Engine.
- Der Spieler geht von Dorfplatz nach Nordosten, betritt die Tür durch Bewegung, geht im Center zur Station, blickt auf sie und drückt die vorhandene Interaktionstaste. Die Bestätigung wird in der bestehenden Dialogbox angezeigt. Rückweg über die Tür unten.

## Schnittstellen
- `src/world/maps/pokemonCenter.js`: exportiert `pokemonCenter`, gleiches Kartenschema wie andere Karten.
- `src/world/WorldRegistry.js`: `createWorldRegistry()` enthält zusätzlich `pokemon-center`.
- `src/center/CenterWorldInteraction.js`: `centerWorldEvent(event,{team,canHeal,speciesRegistry,moveRegistry?})` verarbeitet ausschließlich `dialog` mit `npcId='center-healing-station'`, alle anderen Ereignisse bleiben unverändert. Liefert ein Dialogereignis mit einer der tatsächlichen Situation entsprechenden Rückmeldung. Ruft nur die bestehende Funktion `healAtPokemonCenter()` auf, keine direkte KP/AP-Manipulation.
- `src/main.js`: Ereigniskette Professor → Testtrainer → Center; nutzt stets die aktuelle `team`-Variable, auch nach Speicherplatzwechsel. `canHeal` verlangt geschlossene BattleView, geschlossenen TestSaveMode, geschlossenes Menü und keinen bereits offenen Dialog. `team.healAll` blockiert zusätzlich bei aktivem Team-BattleSync. Keine Heilung bei Kartenwechsel, Save, Load oder Kampfende.
- `src/renderer/Renderer.js`: ausschließlich zusätzliche Platzhalterfarben für neue Terrainkennungen. Kamera und Input unverändert.

## Grenzen und Risiken
- Kein zentraler, unabhängig von `BattleView` sichtbarer globaler Kampfstatus vorhanden. Die Freigabe kombiniert tatsächliche `BattleView.isOpen()`-Sperre mit der bestehenden Team-Synchronisationssperre; Chat 00/04 sollte den globalen Statusvertrag später festlegen. Es wird kein vermeintliches Game-Battle-Flag erfunden.
- Die Interaktion heilt unmittelbar beim Betätigen der Interaktionstaste; das anschließende Dialogfenster bestätigt das Ergebnis. Es gibt keine zusätzliche Ja/Nein-Abfrage.
- Die Center-Heilung aus Auftrag 026 verändert laut deren Vertrag den bestehenden Pokémon-`status` nicht; die ausdrücklich geforderten KP/AP und Kampffähigkeit bei 0 KP werden wiederhergestellt.
- Alte Spielstände behalten unveränderte Map-IDs, Save-Version und Speicherpräfixe. Die neue Map-ID wird zusätzlich akzeptiert. Alte, ungültige Positionen behandelt das bestehende SaveSystem wie zuvor.
- Kein automatisches Speichern; vorhandene manuelle Save-Funktion arbeitet im Innenraum. Keine PC-/Lagerfunktion.
- Desktop-Browserablauf wurde nicht manuell getestet; Tests prüfen Weltlogik, Game-Kamera, Interaktionsadapter, Heilung und Save-Roundtrip automatisiert.

## Tests
`npm test`: **184/184 bestanden, 0 fehlgeschlagen** (175 bisherige Fälle einschließlich eines an die neue Kartenanzahl angepassten Bestandsasserts, 9 neue Tests). Protokoll `docs/TESTRESULT_027.txt`. Ein Bestandsassert in `tests/world-v02.test.js` wurde von zwei auf drei gültige Karten aktualisiert; keine Produktionslogik für bestehende Karten entfernt.

## Integrationspunkte
- Chat 05: optional deutlichere Center-Beschilderung/Stationsgrafik und Feedbackgestaltung; aktuell spielbarer Platzhalter mit vorhandener Dialogbox.
- Chat 10: Desktop-Praxistest inklusive tatsächlicher Tastaturbedienung, Kameradarstellung, Altspielstand und Save im Innenraum; spätere iPhone-Tests separat.
- Chat 00/04: späteren zentralen Kampfzustandsvertrag abstimmen.
