/** World/dialog adapter. The caller must explicitly authorize a completed center interaction. */
export function healAtPokemonCenter({team, canHeal, calculateMaxHp, moveRegistry} = {}) {
  if (!team || typeof team.healAll !== 'function' || typeof canHeal !== 'function')
    throw new TypeError('Team und Interaktionsfreigabe erforderlich');
  if (canHeal() !== true) throw new Error('Pokémon-Center-Heilung nicht freigegeben (z.B. laufender Kampf)');
  return team.healAll({calculateMaxHp, moveRegistry});
}
