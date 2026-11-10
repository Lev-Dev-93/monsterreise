/** Auftrag 030: technische Vorschläge, KEINE freigegebenen Lernlisten.
 * Referenzvorschlag: Generation IV (Diamant/Perl/Platin); Details vor Freigabe prüfen.
 * Nur aktuell im Battle unterstützte Schadensattacken ohne Effekt-ID.
 */
export const STARTER_MOVE_PROPOSALS = Object.freeze({
  charmander: Object.freeze(['scratch','ember']),
  eevee: Object.freeze(['tackle']),
  caterpie: Object.freeze(['tackle']),
  riolu: Object.freeze(['quick-attack'])
});
/** Unbekannte Arten: kontrolliert leere Liste. Bekannte ungültige Einträge: Fehler. */
export function getStarterMoveIds(speciesId, moveRegistry) {
  if (!moveRegistry || typeof moveRegistry.get !== 'function') throw new TypeError('Attackenregister fehlt');
  const ids = STARTER_MOVE_PROPOSALS[speciesId];
  if (!ids) return [];
  if (ids.length > 4 || new Set(ids).size !== ids.length || ids.includes('struggle')) throw new TypeError('Ungültiges Starter-Moveset');
  for (const id of ids) {
    const move = moveRegistry.get(id);
    if (!move || move.category === 'status' || move.effectId !== null || !(move.power > 0)) throw new TypeError(`Nicht unterstützte Starterattacke: ${id}`);
  }
  return [...ids];
}
