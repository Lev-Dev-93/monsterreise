/** Auftrag 025: vorläufige, technisch unterstützte Anfangsattacken.
 * Keine vollständigen Lernlisten und keine Freigabe aller Spielwerte.
 * Nur Schadensattacken ohne Effekt-ID sind in der aktuellen Battle-Engine einsetzbar.
 */
export const STARTER_MOVE_PROPOSALS = Object.freeze({
  charmander: Object.freeze(['scratch','ember']),
  eevee: Object.freeze(['tackle']),
  caterpie: Object.freeze(['tackle']),
  riolu: Object.freeze([]) // Riolus typische Anfangsattacken sind noch nicht implementiert.
});
export function getStarterMoveIds(speciesId, moveRegistry) {
  if (!moveRegistry || typeof moveRegistry.get !== 'function') throw new TypeError('Attackenregister fehlt');
  const ids=STARTER_MOVE_PROPOSALS[speciesId];
  if (!ids) return []; // Noch keine geprüften Daten für diese Art.
  if (ids.length>4 || new Set(ids).size!==ids.length) throw new TypeError('Ungültiges Starter-Moveset');
  for (const id of ids) {
    const move=moveRegistry.get(id);
    if (!move || move.category==='status' || move.effectId!==null || !(move.power>0)) throw new TypeError(`Nicht unterstützte Starterattacke: ${id}`);
  }
  return [...ids];
}
