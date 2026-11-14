import test from 'node:test';
import assert from 'node:assert/strict';
import {createMuStoryRegistry,MuStorySession,MU_STORY_MAPS} from '../src/world/MuStoryWorld.js';
import {TrustedPortalAdapter} from '../src/core/adapters/TrustedPortalAdapter.js';
import {InteractionGate} from '../src/core/adapters/InteractionGate.js';
import {createStoryRuntime} from '../src/integration/StoryRuntime.js';
import {prepareStoryRebind} from '../src/integration/StoryRebind.js';
import {readFileSync} from 'node:fs';
const registry=createMuStoryRegistry();
test('five story maps registered and eight unique transitions',()=>{
 assert.equal(MU_STORY_MAPS.length,5);
 const ids=MU_STORY_MAPS.flatMap(m=>m.portals.map(p=>p.transitionId));
 assert.equal(ids.length,8);assert.equal(new Set(ids).size,8);
});
test('story start spawn is walkable',()=>{
 const session=new MuStorySession({registry});const p=session.spawn('house-start');
 assert.equal(session.world.collidesRect(p.x,p.y,26,30),false);
});
test('trusted portal adapter refuses fabricated transition capability',()=>{
 const session=new MuStorySession({registry});const gate=new InteractionGate({input:{clear(){}}});
 const portal=new TrustedPortalAdapter({session,gate,battleLock:{isBattleActive:()=>false}});
 assert.equal(portal.verify({route1:true}, {x:0,y:0,width:26,height:30}),false);
 assert.throws(()=>portal.consumeForHatch({route1:true},{x:0,y:0,width:26,height:30}),/INVALID_ROUTE1_CAPABILITY/);
});
test('runtime refuses missing approved species policy before storage or UI binding',()=>{
 assert.throws(()=>createStoryRuntime({}),/STARTER_POLICY_NOT_APPROVED/);
});
test('rebind refuses missing domain validators',()=>{
 assert.throws(()=>prepareStoryRebind({mode:'story',schemaVersion:2},{registry:{},worldRegistry:registry}),/INVALID_BINDINGS/);
});
test('story map entry has no starter grant, story save or DEV professor',()=>{
 const source=readFileSync(new URL('../src/story-test.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/assignStarter|new ProfessorEncounter|\.commit\(/);
 assert.match(source,/portal\.applyOrdinary/);
 assert.match(source,/gate\.acquire\('recovery'\)/);
});
test('033 DEV main entry preserved',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const story=readFileSync(new URL('../story-test.html',import.meta.url),'utf8');
 assert.match(html,/src\/main\.js/);assert.match(story,/src\/story-test\.js/);
});
