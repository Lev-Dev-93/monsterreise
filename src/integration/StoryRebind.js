/** 034 integration: prepare all domain objects before mutating the live game. */
import {restoreTeam} from '../pokemon/Team.js';
import {bindTeamBattleLock} from '../battle/BattleLock.js';
import {MuStorySession} from '../world/MuStoryWorld.js';
export function prepareStoryRebind(snapshot,{registry,worldRegistry,policy,validateStoryState,validateStoryTeam}){
 if(snapshot?.mode!=='story'||snapshot.schemaVersion!==2||!worldRegistry||!registry||typeof validateStoryState!=='function'||typeof validateStoryTeam!=='function')throw Error('INVALID_BINDINGS');
 if(validateStoryState(snapshot,{registry,policy})!==true||validateStoryTeam(snapshot.team,registry)!==true)throw Error('INVALID_STORY');
 const team=restoreTeam(structuredClone(snapshot.team),registry);
 const session=new MuStorySession({registry:worldRegistry});
 const position=session.restoreLocation(snapshot.location);
 return {team,session,position,story:structuredClone(snapshot.story),snapshot:structuredClone(snapshot)};
}
/** All references updated synchronously. On any failure the host must remain blocked. */
export function applyStoryRebind(prepared,{game,battleLock,pokemonMenus,battleView,storyController,storyState}){
 if(!prepared||!game||!battleLock||!storyState)throw Error('INVALID_BINDINGS');
 const backup={team:storyState.team,story:storyState.story,snapshot:storyState.snapshot,session:game.session,world:game.world,x:game.player.x,y:game.player.y,facing:game.player.facing,menuTeam:pokemonMenus?.team,battleTeam:battleView?.team};
 try{
  bindTeamBattleLock(prepared.team,battleLock);
  game.session=prepared.session;game.world=prepared.session.world;
  game.player.x=prepared.position.x;game.player.y=prepared.position.y;game.player.facing=prepared.position.facing;
  storyState.team=prepared.team;storyState.story=prepared.story;storyState.snapshot=prepared.snapshot;
  if(pokemonMenus)pokemonMenus.team=prepared.team;
  if(battleView)battleView.team=prepared.team;
  if(storyController&&typeof storyController.bindSession==='function')storyController.bindSession(prepared.snapshot);
  game.input.clear();game.updateCamera();game.ui.setStatus(game.world.label);
 }catch(error){
  game.session=backup.session;game.world=backup.world;game.player.x=backup.x;game.player.y=backup.y;game.player.facing=backup.facing;
  storyState.team=backup.team;storyState.story=backup.story;storyState.snapshot=backup.snapshot;
  if(pokemonMenus)pokemonMenus.team=backup.menuTeam;
  if(battleView)battleView.team=backup.battleTeam;
  if(backup.team)bindTeamBattleLock(backup.team,battleLock);
  try{game.input.clear();game.updateCamera();game.ui.setStatus(game.world.label);}catch{}
  throw error;
 }
}
