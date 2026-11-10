import {initializeMovePp, consumePp} from '../pokemon/Pokemon.js';
/** Auftrag 013: UI-unabhängige Kampfsitzung; Regelberechnungen werden injiziert. */
const validInt = (n,min=0) => Number.isSafeInteger(n) && n>=min;
function assert(ok,message){if(!ok) throw new TypeError(message);}
function sideOf(side){assert(side==='player'||side==='opponent','Ungültige Kampfseite');return side;}
const other = side => side==='player'?'opponent':'player';
/**
 * @param {object} options
 * @param {object} options.playerPokemon Instanz aus pokemon/Pokemon.js
 * @param {object} options.opponentPokemon Instanz aus pokemon/Pokemon.js
 * @param {(pokemon:object)=>number} options.maxHp Maximale KP; projektspezifische Formel noch offen
 * @param {(pokemon:object)=>number} options.speed Initiative; projektspezifische Formel noch offen
 * @param {(context:object)=>number} options.damage Schaden inklusive Typen etc.; Formel noch offen
 * @param {(context:object)=>string} [options.tieBreaker] 'player' oder 'opponent'; Gleichstandsregel offen
 */
export class Battle {
  constructor({playerPokemon,opponentPokemon,maxHp,speed,damage,tieBreaker,moveRegistry=null,rng=Math.random}={}){
    for(const [name,fn] of Object.entries({maxHp,speed,damage})) assert(typeof fn==='function',`${name} muss eine Funktion sein`);
    assert(playerPokemon && opponentPokemon && playerPokemon!==opponentPokemon,'Zwei unterschiedliche Pokémon-Instanzen erforderlich');
    assert(playerPokemon.instanceId!==opponentPokemon.instanceId,'Instanz-IDs müssen verschieden sein');
    this.pokemon={player:playerPokemon,opponent:opponentPokemon};
    this.rules={maxHp,speed,damage,tieBreaker,moveRegistry,rng};
    this.remainingPp={player:{},opponent:{}};
    if(moveRegistry){
      assert(typeof moveRegistry.get==='function','Ungültiges Attackenregister');
      for(const side of ['player','opponent']){
        initializeMovePp(this.pokemon[side],moveRegistry);
        for(const id of this.pokemon[side].moveIds)this.remainingPp[side][id]=this.pokemon[side].movePp[id].current;
      }
    }
    this.maxHp={};
    for(const side of ['player','opponent']){
      const p=this.pokemon[side];
      assert(typeof p.instanceId==='string'&&Array.isArray(p.moveIds),'Ungültige Pokémon-Instanz');
      const hp=maxHp(p);assert(validInt(hp,1),'maxHp muss eine positive ganze Zahl liefern');
      this.maxHp[side]=hp;
      if(p.maxHp===null||p.maxHp===undefined)p.maxHp=hp;
      assert(p.maxHp===hp,'Gespeicherte maximale KP weichen von der Kampfberechnung ab');
      if(p.currentHp===null) p.currentHp=hp;
      assert(validInt(p.currentHp)&&p.currentHp<=hp,'Aktuelle KP außerhalb des gültigen Bereichs');
    }
    this.round=0;this.pending={};this.events=[];
    this.result=this._result();
    this.events.push({type:'battle-start',result:this.result});
  }
  _result(){
    const a=this.pokemon.player.currentHp,b=this.pokemon.opponent.currentHp;
    if(a===0&&b===0)return 'draw';
    if(a===0)return 'opponent';
    if(b===0)return 'player';
    return null;
  }
  get finished(){return this.result!==null;}
  getState(){return {round:this.round,result:this.result,finished:this.finished,pendingSides:Object.keys(this.pending),playerHp:this.pokemon.player.currentHp,opponentHp:this.pokemon.opponent.currentHp,events:this.events.map(e=>({...e})),remainingPp:{player:{...this.remainingPp.player},opponent:{...this.remainingPp.opponent}}};}
  /** Eine Attacke pro Seite einreichen. Nach der zweiten Aktion wird die Runde automatisch abgewickelt. */
  submitAction(side,action){
    sideOf(side);
    assert(!this.finished,'Kampf ist bereits beendet');
    assert(!this.pending[side],'Aktion für diese Seite bereits eingereicht');
    assert(action&&action.type==='move'&&typeof action.moveId==='string','Nur gültige Attackenaktionen unterstützt');
    assert(this.pokemon[side].moveIds.includes(action.moveId),'Attacke gehört nicht zum Pokémon');
    if(this.rules.moveRegistry){
      const move=this.rules.moveRegistry.get(action.moveId);
      assert(move&&move.category!=='status'&&move.effectId===null&&move.power>0,'Attackeneffekt noch nicht unterstützt');
      assert(this.remainingPp[side][action.moveId]>0,'Keine AP mehr');
    }
    this.pending[side]={type:'move',moveId:action.moveId};
    if(Object.keys(this.pending).length===2)return this._resolveRound();
    return this.getState();
  }
  _resolveRound(){
    const speeds={};
    for(const side of ['player','opponent']){
      speeds[side]=this.rules.speed(this.pokemon[side]);
      assert(validInt(speeds[side]),'Initiative muss eine nichtnegative ganze Zahl sein');
    }
    const priorities={player:0,opponent:0};
    if(this.rules.moveRegistry)for(const side of ['player','opponent'])priorities[side]=this.rules.moveRegistry.get(this.pending[side].moveId).priority;
    let first;
    if(priorities.player!==priorities.opponent)first=priorities.player>priorities.opponent?'player':'opponent';
    else if(speeds.player===speeds.opponent){
      assert(typeof this.rules.tieBreaker==='function','Initiativegleichstand: tieBreaker-Regel fehlt');
      first=this.rules.tieBreaker({pokemon:this.pokemon,round:this.round+1});sideOf(first);
    }else first=speeds.player>speeds.opponent?'player':'opponent';
    const actions=this.pending;
    this.pending={};this.round++;
    this.events.push({type:'round-start',round:this.round,first});
    for(const side of [first,other(first)]){
      if(this.finished)break;
      const attacker=this.pokemon[side],defender=this.pokemon[other(side)];
      if(attacker.currentHp===0||defender.currentHp===0)continue;
      const move=this.rules.moveRegistry?.get(actions[side].moveId);
      if(move){consumePp(attacker,actions[side].moveId);this.remainingPp[side][actions[side].moveId]=attacker.movePp[actions[side].moveId].current;}
      if(move&&move.accuracy!==null){
        const roll=this.rules.rng();
        assert(typeof roll==='number'&&Number.isFinite(roll)&&roll>=0&&roll<1,'rng muss [0,1) liefern');
        if(roll*100>=move.accuracy){this.events.push({type:'move-miss',round:this.round,side,moveId:actions[side].moveId});continue;}
      }
      const amount=this.rules.damage({attacker,defender,moveId:actions[side].moveId,round:this.round,side});
      assert(validInt(amount),'Schaden muss eine nichtnegative ganze Zahl sein');
      const applied=Math.min(amount,defender.currentHp);
      defender.currentHp-=applied;
      this.events.push({type:'move',round:this.round,side,moveId:actions[side].moveId,damage:applied,targetHp:defender.currentHp});
      this.result=this._result();
    }
    if(this.finished)this.events.push({type:'battle-end',round:this.round,result:this.result});
    else this.events.push({type:'round-end',round:this.round});
    return this.getState();
  }
}
export function createBattle(options){return new Battle(options);}
