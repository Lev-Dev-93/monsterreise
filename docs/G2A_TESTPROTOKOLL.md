# G2a – Testprotokoll

Datum: 2026-11-14

Basis: `Monsterreise_033_Integrationskandidat_v0.4.zip` SHA-256 `8e1c8ca35bafe6a3f049b8e0bbc02826f24aa1ed9087370b05c1bbcc70368da1`.

Ausgeführt: `npm test` (`node --test tests/*.test.js`) auf einer entpackten Kopie.

Ergebnis: **244 Tests, 244 bestanden, 0 fehlgeschlagen, 0 übersprungen**.

Davon 220 bestehende 033-Tests, 24 neue `story-save-034.test.js`-Tests. Testschwerpunkte: Storyslot-/Legacy-Isolation, Save/Load, Revisionen, Sessionepoch, beschädigte JSON-/Versionsdaten, fehlende Validatoren, Ei-/Flaginkonsistenz, Stacklimit, Lockverweigerung, `setItem`-Ausnahme vor/nach Write, unklarer Readback, Recovery und Fremd-Commit, monotone Flags, fehlende Locks, konkurrierende Revisionsstände.

Nicht ausgeführt: Browser-Web-Locks-E2E, reale Storykarten-/Pokémon-/Story-Domänenintegration, Schlüpfen, Engine-Rebind, iPhone/Desktop-Spieltest. G1-Gesamtkatalog mit 38 Fällen ist noch nicht vollständig abgedeckt.

Vollständige Node-Ausgabe: `G2A_FULL_TEST.log` im Paket.
