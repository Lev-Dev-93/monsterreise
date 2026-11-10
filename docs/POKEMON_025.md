# Auftrag 025 – Starter-Attacken und Anfangs-Movesets

## Grundlage und Bestand
Basis: vom Nutzer hochgeladener Integrationskandidat 024 v0.4. Verbindlich: Projekthandbuch Master 1.0, insbesondere Kapitel 13–15 und 18, sowie docs/ARCHITECTURE.md. Das Handbuch bestimmt keine konkreten Anfangsattacken je Art. Die aktuelle Test-Registry umfasst Glumanda, Evoli, Riolu, Lucario, Mewtu und Raupy; vier davon sind starterberechtigt. Das ist **nicht** die endgültige Gen-1–4-Datenbank. `sampleMoves.js` enthält Tackle, Kratzer, Glut und Heuler; nur Schadensattacken ohne effectId sind in Battle aktuell nutzbar. Verzweifler ist eine automatische Ersatzaktion, kein gespeicherter Move.

## Vorläufige Vorschläge (nicht freigegebene Spieldaten)
| Art | Moves | Technisch nutzbar | Herkunft der Entscheidung |
|---|---|---|---|
| Glumanda | scratch, ember | ja | technisch kompatibler Vorschlag aus bestehender Test-Registry |
| Evoli | tackle | ja | technisch kompatibler Vorschlag aus bestehender Test-Registry |
| Raupy | tackle | ja | technisch kompatibler Vorschlag aus bestehender Test-Registry |
| Riolu | (leer) | nein, kein normaler Angriff | passende Anfangsattacken sind im vorhandenen Move-Register nicht verfügbar |

**Quellenlage:** Die konkrete Kombination der Anfangsattacken wurde nicht aus einer freigegebenen generationsspezifischen Pokémon-Lernliste übernommen. Es handelt sich um interne technische Vorschläge, gestützt auf die bereits vorhandenen Testattacken. Eine Generation/Regelversion für endgültige Lernsets ist **nicht entschieden**; diese Daten sind vor einer Freigabe mit einer festgelegten Referenzgeneration abzugleichen. Nicht unterstützter Status-Effekt: `growl`/Heuler (`lower-attack`). Riolu benötigt gesonderte Datenauswahl und gegebenenfalls neue Attacken-/Kampfeffekte.

## Implementierung / Schnittstellen
- `src/pokemon/starterMoves.js`: `STARTER_MOVE_PROPOSALS`, `getStarterMoveIds(speciesId, moveRegistry)`; validiert IDs, Einzigartigkeit, maximal vier Moves und technische Battle-Unterstützung. Fehlende Artzuordnung liefert leere Liste, keine erfundenen Moves.
- `src/pokemon/Team.js`: `createTeam({registry,members,starterAssigned,moveRegistry=sampleMoveRegistry})` erweitert; `assignStarter({speciesId,instanceId,level})` nutzt vorhandene `createPokemon`-Instanz und `initializeMovePp`. Team-/Save-Datenformat unverändert; bereits geladene Mitglieder werden nicht mit neuen Moves überschrieben. Starter einmalig, IVs perfekt wie bisher.
- `src/battle/TrainerBattle.js` und `src/ui/BattleView.js`: temporäre Testkampfkopien, die absichtlich auf `tackle,scratch` umstellen, setzen vorher `movePp:null`, damit alte, nicht passende AP-Schlüssel nicht fälschlich mitgeschleppt werden. Kein Umbau der regulären Kampf- oder Speicherschnittstelle.
- `src/ui/TestSaveMode.js` bleibt unverändert: normal Tackle 35/35, struggle Tackle 0/35.

## Offene Freigaben an Chat 00
1. Festlegung der generationsspezifischen Lernlisten-/Regelversion und Datenquelle.
2. Freigabe oder Änderung der drei vorläufigen Movesets; Glut für Glumanda auf Level 5 ist insbesondere generationsabhängig zu prüfen.
3. Riolu: konkrete Startattacken und erforderliche Attackenimplementierungen.
4. Ausbau der Pokémon- und Attackenregister auf alle zulässigen Basisformen.
5. Ob vier Attacken als **harte allgemeine Instanzgrenze** eingeführt werden sollen; hier nur Starter-Movesets auf vier begrenzt, um bestehende Daten nicht zu brechen.
6. Verhalten eines Starters ohne nutzbare Attacke (Riolu): bisherige Battle-Engine kann Verzweifler als Ersatz nutzen, aber eine endgültige Startlösung ist offen.

## Testumfang
`npm test`: 168/168 bestanden, davon 9 neue Tests in `tests/starter-moves-025.test.js`. Kein praktischer Desktop-Test und kein GitHub-Release, wie beauftragt.
