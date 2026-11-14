# Auftrag 029 – Zentrale Kampfsperre

## Bestandsaufnahme 028
- `BattleView.isOpen()` und `game.setMenuOpen(true)` sperrten bereits die Bewegung und mehrere UI-Schaltflächen.
- `Game.update` stoppte bei `menuOpen`; `Input.clear` unterdrückt gehaltene Tasten bis zum Loslassen.
- `centerWorldEvent` nutzte `canHeal`, aber die direkte öffentliche Heilfunktion konnte mit `canHeal:()=>true` aufgerufen werden.
- `WorldSession` hatte keine eigene Sperrprüfung für Portal- und NPC-Aufrufe.

## Architektur und Schnittstellen
- Neu `src/battle/BattleLock.js`: `new BattleLock()`, `isBattleActive()`, `acquire(owner)`, `release(owner)`; ein eindeutiger Besitzer, keine parallelen Kämpfe.
- `bindTeamBattleLock(team,lock)` bindet die tatsächliche Teaminstanz über eine private WeakMap. `isTeamBattleLocked(team)` prüft den aktiven Kampf ohne Änderung des Speicherformats.
- `src/main.js` erzeugt eine Sperre, bindet neue Teaminstanzen nach Laden und injiziert sie in `Game`, `WorldSession` und `BattleView`.
- `Game.isBattleActive()` schützt Welt-Update, Interaktion, Welt-Events und Wiederherstellung der Weltposition. `WorldSession.interact/updatePosition` schützen auch direkte Aufrufe.
- `BattleView` erwirbt den Lock beim Start und gibt ihn nach erfolgreicher Team-Synchronisation und Schließen frei. Fehlgeschlagene Initialisierung räumt auf; fehlerhafte Ergebnisübernahme lässt den Kampf gesperrt.
- `healAtPokemonCenter` prüft den Team-Lock selbst bei `canHeal:()=>true`. Bestehende Heilfunktion `team.healAll` bleibt unverändert.
- `Input.clear` wird vor der Freigabe aufgerufen; gehaltene Tasten bleiben unterdrückt.

## Unverändert / offen
Kampfberechnungen, AP, KI, Verzweifler, Save-Format, Testspielstände und Center-Heilung bleiben unverändert. Speichern während Kampf bleibt wie in 028 gesperrt; weitergehende Regel nur nach Chat-00-Entscheidung. Kein transaktionales Rollback nach Fehler in einer Kampfrunde. Direkte interne `Team.healAll()`-Aufrufe sind nicht die öffentliche Center-Schnittstelle und werden nicht vom Lock abgefangen.

## Desktop-Testanleitung (erst nach Paket 029–033)
1. Testtrainer ansprechen, Kampf starten; Pfeile/WASD/Enter, Portal, NPC, Center, Speichern, Team und Testspielstand während Kampf prüfen.
2. Normale Attacken, AP und Verzweifler prüfen; nach Sieg/Niederlage/Unentschieden schließen und KP/AP prüfen.
3. Richtungstaste beim Schließen gedrückt halten: keine unmittelbare Bewegung; erst nach Loslassen und erneutem Drücken bewegen.
4. Nach Kampf Center-Heilung, Portale, Speichern/Laden und Testspielstände prüfen.
5. Fehlerhafte Ergebnisübernahme isoliert simulieren: Kampf bleibt gesperrt, bis Übernahme erfolgreich ist.
