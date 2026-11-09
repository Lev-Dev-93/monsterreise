/** Temporary integration scene, not the canonical introductory excursion. */
export class ProfessorEncounter {
  constructor({team,openStarterSelection}) {
    if (!team || typeof openStarterSelection !== 'function') throw new TypeError('Professor dependencies missing');
    this.team=team;
    this.openStarterSelection=openStarterSelection;
  }
  handle(event) {
    if(event?.type!=='dialog'||event.npcId!=='professor-test')return event;
    if(this.team.starterAssigned)return {...event,lines:['Ah, da bist du wieder! Kümmere dich gut um dein Pokémon.'],onComplete:undefined};
    return {...event,lines:['Oh! Meine Notizen sind schon wieder verschwunden ...','Für diesen Test kannst du jetzt dein erstes Pokémon auswählen.'],onComplete:()=>{
      if(!this.team.starterAssigned)this.openStarterSelection();
    }};
  }
}
