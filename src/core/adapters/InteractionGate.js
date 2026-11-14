export const GATE_REASONS=Object.freeze(['dialog','cutscene','transition','story-commit','slot-switch','recovery']);
export class InteractionGate {
 #tokens=new Map();#input;#sequence=0;
 constructor({input}={}){if(typeof input?.clear!=='function')throw TypeError('Input.clear required');this.#input=input;}
 acquire(reason){if(!GATE_REASONS.includes(reason))throw RangeError('Unknown gate reason');const token=Object.freeze({id:++this.#sequence,reason});this.#tokens.set(token.id,token);this.#input.clear();return token;}
 release(token){if(!token||this.#tokens.get(token.id)!==token)return false;this.#tokens.delete(token.id);this.#input.clear();return true;}
 isBlocked(){return this.#tokens.size>0;}
 has(reason){return [...this.#tokens.values()].some(t=>t.reason===reason);}
 get reasons(){return [...this.#tokens.values()].map(t=>t.reason);}
 canWorldAction(battleLock){return !this.isBlocked() && battleLock?.isBattleActive?.()!==true;}
}
