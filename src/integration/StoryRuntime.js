/** Opt-in integration factory. Fails closed until a real, approved species policy is injected. */
import {StorySaveSystem,createWebLockAdapter} from '../save/StorySaveSystem.js';
import {StorySessionLease,createWebSessionLeaseAdapter} from '../save/StorySessionLease.js';
import {StoryEngineCoordinator} from '../core/adapters/StoryEngineCoordinator.js';
import {SessionTickets} from '../core/adapters/SessionTickets.js';
import {InteractionGate} from '../core/adapters/InteractionGate.js';
import {TrustedPortalAdapter} from '../core/adapters/TrustedPortalAdapter.js';
import {validateStoryState,validateStoryTransition} from '../story/StoryController.js';
import {validateStoryTeam} from '../pokemon/StarterDomain.js';
import {MuStorySession} from '../world/MuStoryWorld.js';
import {prepareStoryRebind,applyStoryRebind} from './StoryRebind.js';
export function createStoryRuntime({storage,webLocks,registry,worldRegistry,policy,clock,ids,epochIds,operationIds,game,battleLock,storyState,pokemonMenus,battleView,storyController}={}){
 if(policy?.approved!==true||typeof policy.isBaseSpecies!=='function'||typeof policy.isExcluded!=='function')throw Error('STARTER_POLICY_NOT_APPROVED');
 if(!storage||!webLocks||!registry||!worldRegistry||!game||!battleLock||!storyState||typeof clock!=='function'||typeof ids!=='function'||typeof epochIds!=='function')throw Error('INTEGRATION_DEPENDENCY_MISSING');
 const locationValidator=new MuStorySession({registry:worldRegistry});
 const deps={registry,policy};
 const validators={
  team:s=>validateStoryTeam(s.team,registry),
  story:s=>validateStoryState(s,deps),
  location:s=>locationValidator.validateLocation(s.location,game.player.width,game.player.height),
  transition:(before,after)=>validateStoryTransition(before,after,deps)
 };
 let lease;
 const save=new StorySaveSystem({storage,locks:createWebLockAdapter(webLocks),clock,ids,validators,sessionEpoch:()=>lease?.state?.epoch??null});
 lease=new StorySessionLease({save,leaseAdapter:createWebSessionLeaseAdapter(webLocks),epochIds,operationIds});
 const gate=new InteractionGate({input:game.input});
 const tickets=new SessionTickets({lease});
 const liveSession={get registry(){return game.session.registry;},previewTransition:player=>game.session.previewTransition(player),updatePosition:(player,opts)=>game.session.updatePosition(player,opts),get returnPositions(){return game.session.returnPositions;}};
 const portal=new TrustedPortalAdapter({session:liveSession,gate,battleLock});
 const bindings={
  prepare:s=>prepareStoryRebind(s,{registry,worldRegistry,policy,validateStoryState,validateStoryTeam}),
  capture:()=>({snapshot:storyState.snapshot,team:storyState.team,story:storyState.story,session:game.session,world:game.world,x:game.player.x,y:game.player.y,facing:game.player.facing}),
  apply:p=>applyStoryRebind(p,{game,battleLock,storyState,pokemonMenus,battleView,storyController}),
  restore:b=>{if(!b)return;const p=prepareStoryRebind(b.snapshot,{registry,worldRegistry,policy,validateStoryState,validateStoryTeam});applyStoryRebind(p,{game,battleLock,storyState,pokemonMenus,battleView,storyController});}
 };
 const coordinator=new StoryEngineCoordinator({gate,lease,tickets,portal,battleLock,bindings});
 return {save,lease,gate,tickets,portal,coordinator,validators,bindings};
}
