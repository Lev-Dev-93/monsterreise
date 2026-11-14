export const ROUTE1_TRANSITION='tr-village-route1';
const ROUTE1_EVENT='story.prologue.route1.first-entry';
/** A branded capability is created only from the real MuStorySession preview and exact registry portal identity. */
export class TrustedPortalAdapter {
 #session;#gate;#battleLock;#capabilities=new WeakSet();
 constructor({session,gate,battleLock}){if(typeof session?.previewTransition!=='function'||typeof session?.updatePosition!=='function'||!session.registry)throw TypeError('MuStorySession required');this.#session=session;this.#gate=gate;this.#battleLock=battleLock;}
 preview(player){
  if(!this.#gate.canWorldAction(this.#battleLock))return {status:'blocked',reason:'interaction-locked'};
  const plan=this.#session.previewTransition(player);
  if(plan.status!=='ready')return plan;
  const {portal,source,target}=plan;
  const sourceMap=this.#session.registry.get(source.mapId);
  if(!sourceMap||!sourceMap.portals.includes(portal)||portal.targetMap!==target.mapId||!this.#session.registry.has(target.mapId))return {status:'blocked',reason:'untrusted-portal'};
  const destination=this.#session.registry.get(target.mapId);
  const spawn=destination.spawns?.[portal.spawnId];
  if(!spawn||target.x!==spawn.x*destination.tileSize||target.y!==spawn.y*destination.tileSize||destination.collidesRect(target.x,target.y,player.width,player.height))return {status:'blocked',reason:'invalid-spawn'};
  const route1=portal.transitionId===ROUTE1_TRANSITION;
  if(route1 && (source.mapId!=='mu-start-village'||target.mapId!=='mu-route-1'||portal.spawnId!=='route1-village-entry'))return {status:'blocked',reason:'invalid-route1'};
  const capability=Object.freeze({source:{...source},target:{...target},portal,planKey:plan.key,route1,eventId:route1?ROUTE1_EVENT:null});
  this.#capabilities.add(capability);
  return {status:'ready',capability};
 }
 verify(capability,player,{duringTransition=false}={}){
  if(!this.#capabilities.has(capability)||(duringTransition ? (!this.#gate.has('transition')||this.#battleLock?.isBattleActive?.()===true) : !this.#gate.canWorldAction(this.#battleLock)))return false;
  const now=this.#session.previewTransition(player);
  return now.status==='ready'&&now.portal===capability.portal&&now.key===capability.planKey&&now.source.mapId===capability.source.mapId&&now.source.x===capability.source.x&&now.source.y===capability.source.y&&now.target.mapId===capability.target.mapId&&now.target.x===capability.target.x&&now.target.y===capability.target.y;
 }
 /** For ordinary transitions only. Hatch uses target location in one committed snapshot, then rebinds; never pre-mutates the world. */
 applyOrdinary(capability,player){
  if(!this.verify(capability,player)||capability.route1)throw Error('INVALID_PORTAL_CAPABILITY');
  this.#capabilities.delete(capability);
  const event=this.#session.updatePosition(player,{canTransition:request=>request.transitionId===capability.portal.transitionId&&request.portalId===capability.portal.id&&request.fromMapId===capability.source.mapId&&request.mapId===capability.target.mapId});
  if(event?.type!=='transition')throw Error('TRANSITION_REJECTED');
  return event;
 }
 /** Explicitly consumes a real preflight; caller must hold gate and perform verified StorySave commit. */
 consumeForHatch(capability,player){if(!capability?.route1||!this.verify(capability,player,{duringTransition:true}))throw Error('INVALID_ROUTE1_CAPABILITY');this.#capabilities.delete(capability);return Object.freeze({eventId:ROUTE1_EVENT,fromMapId:capability.source.mapId,mapId:capability.target.mapId,transitionId:ROUTE1_TRANSITION,spawnId:capability.portal.spawnId,portalId:capability.portal.id,location:Object.freeze({mapId:capability.target.mapId,x:capability.target.x,y:capability.target.y,facing:capability.target.facing,returnPositions:this.#session.returnPositions.map(p=>({...p}))})});}
}
