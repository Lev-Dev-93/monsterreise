# Auftrag 030 – Starter-Attacken und Datengrundlage

## Bestand (Basis 029)
- Artenregister `src/pokemon/sampleData.js`: 6 Arten: #004 Glumanda, #010 Raupy, #133 Evoli, #150 Mewtu, #447 Riolu, #448 Lucario. Starterberechtigt: Glumanda, Raupy, Evoli, Riolu. Lucario und Mewtu nicht berechtigt.
- Attackenregister vor Auftrag 030: Tackle (35 AP), Kratzer (35 AP), Glut (25 AP), Heuler (40 AP, nicht unterstützter Status-Effekt). Verzweifler ist eine automatische Ersatzaktion, **kein** Registry-/Moveset-Eintrag.
- `starterMoves.js` war ausdrücklich vorläufig; Riolu hatte keine reguläre Attacke.
- Team vergibt Starter einmalig, initialisiert AP über `initializeMovePp`; `restoreTeam` stellt gespeicherte Attacken/AP wieder her. Battle prüft Besitz, AP und Effekte; Priorität ist unterstützt. Maximal vier Attacken ist in `getStarterMoveIds` geprüft, nicht als generelle `createPokemon`-Invariante.
- Die beiden Testspielstände aus Auftrag 024 behalten ausschließlich Tackle (35 bzw. 0 AP). Die zentrale Kampfsperre aus Auftrag 029 wurde nicht verändert.

## Technisch verfügbare Starter-Movesets – Vorschläge, keine Freigabe
| Nr. | Art | Starter | Level 5: technisch vorgeschlagen | AP | Datenstatus |
|---|---|---|---|---|---|
| 004 | Glumanda | ja | Kratzer, Glut | 35, 25 | Bestand 025, vorläufig; Glut auf Level 5 ist **nicht** als Gen-IV-Lernliste bestätigt |
| 010 | Raupy | ja | Tackle | 35 | Bestand 025, vorläufig |
| 133 | Evoli | ja | Tackle | 35 | Bestand 025, vorläufig |
| 150 | Mewtu | nein | – | – | Nicht starterberechtigt |
| 447 | Riolu | ja | Ruckzuckhieb | 30 | Neu 030, vorläufig, technisch unterstützt |
| 448 | Lucario | nein | – | – | Entwickelte Form |

## Attackenbestand nach Auftrag 030
`tackle`, `scratch`, `ember`, `growl`, `quick-attack`. Ruckzuckhieb ist eine physische Normal-Attacke, Stärke 40, Genauigkeit 100, 30 AP, Priorität +1, ohne zusätzlichen Effekt. Die Werte sind **vorläufige Testdaten** und keine beschlossenen Balancing-Werte. Heulers Status-Effekt ist weiterhin nicht spielbar.

## Referenz- und Quellenstatus
- Verbindlich: MONSTERREISE Projekthandbuch Master 1.0, Kapitel 13–18; Architektur und STATUS aus Projektdateien; bestehende Implementierung 029.
- **Empfehlung, nicht freigegeben:** Generation IV, bevorzugt Pokémon Platin, als konsistente Referenz für spätere Level-5-Lernlisten. Die vorliegenden vier technischen Movesets sind **keine vollständig gegen Pokémon Platin verifizierten Level-5-Lernlisten**. Vor verbindlicher Übernahme sind Editionsdaten aus einer nachprüfbaren Lernlistenquelle (z. B. Bulbapedia, Serebii oder PokéAPI mit Editionsbezug) einzeln abzugleichen.
- Für sämtliche übrigen geeigneten Basisformen der Generationen 1–4 fehlt derzeit ein vollständiges, verifiziertes Artenverzeichnis samt Level-5-Lernlisten. Es werden weder erfundene Namen noch Attacken/Lernlevel eingetragen. Das verbindliche Starter-Zulassungsprinzip bleibt unverändert; die aktuelle Registry ist nur ein Testausschnitt.

## Schnittstellen
- `STARTER_MOVE_PROPOSALS`: `speciesId -> readonly moveId[]` (höchstens vier; vorläufig).
- `getStarterMoveIds(speciesId, moveRegistry)`: liefert Kopie gültiger IDs; unbekannte Art -> `[]`; fehlendes Register oder ungültige/nicht unterstützte bekannte Attacke -> `TypeError`.
- `sampleMoveRegistry.get('quick-attack')`: neuer Testdatensatz, `pp:30`, `priority:1`.
- `createTeam({registry,moveRegistry}).assignStarter({speciesId,instanceId,level})`: bestehende API unverändert, übernimmt Moveset und initialisiert AP.
- `restoreTeam(saved,registry)` und `serializePokemon`: unverändert. Vorhandene Pokémon und verbrauchte AP werden **nicht** durch neue Vorschläge überschrieben.
- `Battle`: unverändert; besitzt Attackenprüfung, AP-Verbrauch, Priorität und automatischen Verzweifler.

## Grenzen
Keine vollständige Artenliste, keine vollständigen Lernlisten, keine neuen Status-Effekte, keine Migration alter Pokémon-Movesets, keine allgemeine Vier-Move-Validierung außerhalb des Starterpfades, keine Änderung der Kampfsperre.
