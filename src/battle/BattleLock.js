/** Runtime-only battle gate. Never serialized. One owner per active battle. */
const teamLocks = new WeakMap();
export class BattleLock {
  constructor(){this.owner=null;}
  isBattleActive(){return this.owner!==null;}
  acquire(owner){if(owner==null||this.owner!==null)return false;this.owner=owner;return true;}
  release(owner){if(this.owner!==owner||owner==null)return false;this.owner=null;return true;}
}
export function bindTeamBattleLock(team,lock){if(!team||!lock||typeof lock.isBattleActive!=='function')throw new TypeError('Team/BattleLock required');teamLocks.set(team,lock);}
export function isTeamBattleLocked(team){return teamLocks.get(team)?.isBattleActive()===true;}
