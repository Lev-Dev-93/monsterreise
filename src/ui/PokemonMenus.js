/** UI adapter for the existing Pokémon registry and Team module. No game rules live here. */
export class PokemonMenus {
  constructor({root, registry, team, onOpenChange = () => {}, onTeamChanged = () => {}}) {
    this.root = root; this.registry = registry; this.team = team; this.onOpenChange = onOpenChange; this.onTeamChanged = onTeamChanged;
    this.panel = root.querySelector('#pokemon-panel');
    this.content = root.querySelector('#pokemon-panel-content');
    this.title = root.querySelector('#pokemon-panel-title');
    this.teamButton = root.querySelector('#team-toggle');
    this.closeButton = root.querySelector('#pokemon-panel-close');
    this.teamButton.addEventListener('click', () => this.openTeam());
    this.closeButton.addEventListener('click', () => this.close());
    this.onKey = e => {if (this.isOpen() && e.key === 'Escape') {e.preventDefault(); this.close();}};
    document.addEventListener('keydown', this.onKey);
    this.mode = null;
  }
  isOpen() {return !this.panel.hidden;}
  open(mode) {this.mode = mode; this.panel.hidden = false; this.onOpenChange(true); this.render(); this.closeButton.focus();}
  openTeam() {this.open('team');}
  /** Reserved for professor event, not automatically invoked on game start. */
  openStarterSelection() {
    if (this.team.starterAssigned) return false;
    this.open('starter'); return true;
  }
  close() {if (!this.isOpen()) return; this.panel.hidden = true; this.mode = null; this.onOpenChange(false); this.teamButton.focus();}
  render() {
    this.content.replaceChildren();
    if (this.mode === 'team') {
      this.title.textContent = 'Pokémon-Team';
      const members = this.team.getMembers();
      if (!members.length) this.addText('Noch keine Pokémon im Team.');
      for (const pokemon of members) {
        const species = this.registry.get(pokemon.speciesId);
        const card = document.createElement('article'); card.className = 'pokemon-card';
        const sprite = document.createElement('span'); sprite.className = 'pokemon-sprite'; sprite.textContent = '?'; sprite.setAttribute('aria-label', 'Sprite-Platzhalter');
        const info = document.createElement('div');
        const name = document.createElement('strong'); name.textContent = `${pokemon.nickname || species?.name || pokemon.speciesId} · Lv. ${pokemon.level}`;
        const types = document.createElement('p'); types.textContent = `Typ: ${species?.types.join(' / ') || 'Unbekannt'}`;
        const status = document.createElement('p'); status.textContent = `Status: ${pokemon.status ?? 'Keiner'}${pokemon.currentHp === null ? '' : ` · KP: ${pokemon.currentHp}/${pokemon.maxHp??'?'}`}${pokemon.movePp ? ' · AP: '+pokemon.moveIds.map(id=>`${id} ${pokemon.movePp[id]?.current??'?'}/${pokemon.movePp[id]?.max??'?'}`).join(', ') : ''}`;
        info.append(name, types, status); card.append(sprite, info); this.content.append(card);
      }
    } else if (this.mode === 'starter') {
      this.title.textContent = 'Starter wählen';
      this.addText('Wähle dein erstes Pokémon. Diese Auswahl ist einmalig.');
      for (const species of this.registry.starterOptions()) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'starter-option';
        button.textContent = `${species.name} · ${species.types.join(' / ')} · Nr. ${species.dexNumber}`;
        button.addEventListener('click', () => this.chooseStarter(species.speciesId)); this.content.append(button);
      }
    }
  }
  addText(value) {const p = document.createElement('p'); p.textContent = value; this.content.append(p);}
  chooseStarter(speciesId) {
    if (this.mode !== 'starter' || this.team.starterAssigned || !this.registry.starterOptions().some(s => s.speciesId === speciesId)) return false;
    const instanceId = `starter-${speciesId}`;
    try {this.team.assignStarter({speciesId, instanceId, level:5});}
    catch (error) {this.content.replaceChildren(); this.addText(`Starter konnte nicht vergeben werden: ${error.message}`); return false;}
    this.onTeamChanged(); this.openTeam(); return true;
  }
  destroy() {document.removeEventListener('keydown', this.onKey);}
}
