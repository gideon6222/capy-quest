// CAPY QUEST — Zelda-like RPG starring a Capybara
// three.js 0.166.0 · Web Audio API · localStorage · no build step
import * as THREE from 'three';

// ─── Error overlay ──────────────────────────────────────────────────────────
function showErr(m) {
  const el = document.getElementById('err');
  el.classList.remove('hidden');
  el.textContent += m + '\n\n';
  document.getElementById('boot')?.classList.add('hidden');
}
window.onerror = (msg, src, line) => showErr(`ERROR: ${msg}\n${src}:${line}`);
window.onunhandledrejection = e => showErr('PROMISE: ' + (e.reason?.message ?? e.reason));

// ─── Constants ───────────────────────────────────────────────────────────────
const TILE = 2;
const MAP_W = 28, MAP_H = 28;
const G=0,W=1,P=2,TR=3,K=4,S=5,U=6; // tile types
const PASSABLE = [true,false,true,false,false,true,true];
const TILE_RGB = {
  0:[0.22,0.58,0.18], 1:[0.18,0.45,0.75], 2:[0.62,0.52,0.33],
  3:[0.10,0.35,0.08], 4:[0.48,0.44,0.38], 5:[0.35,0.70,0.82],
  6:[0.55,0.50,0.40]
};

// ─── Map ─────────────────────────────────────────────────────────────────────
const RAW_MAP = [
  [K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K],
  [K,TR,TR,TR,TR,TR,TR,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W,W,W,W,W,TR,K],
  [K,TR,TR,TR,TR,TR,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W,W,W,W,W,G,TR,K],
  [K,TR,TR,TR,TR,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W,W,W,W,W,G,G,G,K],
  [K,TR,TR,TR,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,W,W,W,G,G,G,G,K],
  [K,TR,TR,G,G,G,G,G,G,G,G,G,G,P,P,P,P,G,G,G,G,W,G,G,G,G,G,K],
  [K,TR,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,P,G,G,G,G,G,G,G,G,G,K],
  [K,TR,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,K],
  [K,G,G,U,U,U,G,G,G,G,P,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,K],
  [K,G,U,U,U,U,U,G,G,P,G,G,G,S,S,G,G,G,G,G,P,G,G,G,G,G,G,K],
  [K,G,U,U,P,U,U,G,G,P,G,G,G,S,S,S,G,G,G,G,G,P,G,G,G,G,G,K],
  [K,G,U,P,P,P,U,G,G,P,G,G,G,G,S,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,G,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,P,P,G,G,G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,P,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,P,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,P,G,G,G,P,P,G,G,G,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,P,P,G,P,P,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,G,G,G,G,P,P,P,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,P,P,P,G,G,G,G,G,G,G,G,G,G,P,P,P,G,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,P,P,G,G,G,G,G,G,G,G,G,G,G,P,P,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,G,P,P,G,G,K,K,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,G,G,P,G,G,K,K,K,G,G,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,G,G,G,G,G,G,K,K,G,G,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,K],
  [K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K],
];

// ─── Enemy defs ──────────────────────────────────────────────────────────────
const EDEFS = {
  LIZARD:     {name:'Jungle Lizard',   hp:20,atk:5, def:1,spd:4, xp:12,gold:5, color:0x3aaa2a,special:null},
  PIRANHA:    {name:'River Piranha',   hp:16,atk:8, def:0,spd:8, xp:16,gold:7, color:0x2277cc,special:'DOUBLE'},
  MONKEY:     {name:'Howler Monkey',   hp:24,atk:6, def:2,spd:5, xp:20,gold:9, color:0x7a4010,special:'POISON'},
  JAGUAR:     {name:'Spotted Jaguar',  hp:30,atk:10,def:4,spd:6, xp:30,gold:16,color:0xd07a10,special:null},
  SALAMANDER: {name:'Fire Salamander', hp:26,atk:12,def:3,spd:5, xp:34,gold:18,color:0xdd3311,special:'BURN'},
  CAIMAN:     {name:'Grand Caiman',    hp:90,atk:14,def:6,spd:3, xp:120,gold:60,color:0x1e5c20,special:'CRUSH',boss:true},
};

// Enemy spawns: [col, row, type]
const ENEMY_SPAWNS = [
  [6,5,'LIZARD'],[10,3,'LIZARD'],[20,4,'LIZARD'],[7,9,'LIZARD'],
  [22,8,'PIRANHA'],[24,5,'PIRANHA'],[23,3,'PIRANHA'],
  [3,8,'MONKEY'],[4,10,'MONKEY'],[2,11,'MONKEY'],
  [12,3,'JAGUAR'],[15,2,'JAGUAR'],
  [21,22,'SALAMANDER'],[23,21,'SALAMANDER'],
  [10,11,'CAIMAN'],
];

const NPC_SPAWNS = [
  {col:13,row:14,name:'Elder Capy',dialog:'Welcome, young one. The hot springs will restore your strength. The Grand Caiman to the northwest is ancient and dangerous.'},
  {col:16,row:15,name:'Shop Capy',dialog:'SHOP',isShop:true},
];

const PICKUP_SPAWNS = [
  {col:13,row:9,item:'MANGO'},{col:15,row:10,item:'MANGO'},
  {col:14,row:9,item:'HERB'},{col:8,row:12,item:'MANGO'},
];

// ─── Utils ───────────────────────────────────────────────────────────────────
const ri = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const rc = (a,b)=>Math.random()*(b-a)+a;
const lerp = (a,b,t)=>a+(b-a)*t;
const cl = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));

// ─── Audio ───────────────────────────────────────────────────────────────────
let AC=null, masterGain=null, sfxBus=null, musicBus=null, musicNodes=[];

function initAudio() {
  if (AC) return;
  AC = new AudioContext();
  masterGain = AC.createGain(); masterGain.gain.value = 0.8;
  masterGain.connect(AC.destination);
  const comp = AC.createDynamicsCompressor();
  comp.connect(masterGain);
  sfxBus = AC.createGain(); sfxBus.gain.value = 1.0; sfxBus.connect(comp);
  musicBus = AC.createGain(); musicBus.gain.value = 0.45; musicBus.connect(comp);
}

function mkOsc(freq, type, start, dur, vol) {
  if (!AC) return;
  const g = AC.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start+0.01);
  g.gain.exponentialRampToValueAtTime(0.001, start+dur);
  g.connect(sfxBus);
  const o = AC.createOscillator();
  o.type = type; o.frequency.value = freq;
  o.connect(g); o.start(start); o.stop(start+dur+0.05);
}

function mkNoise(start, dur, vol, lpFreq) {
  if (!AC) return;
  const lf = lpFreq || 800;
  const len = Math.ceil(AC.sampleRate * dur);
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  for (let i=0;i<len;i++) d[i]=Math.random()*2-1;
  const src = AC.createBufferSource(); src.buffer = buf;
  const flt = AC.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=lf;
  const g = AC.createGain();
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start+dur);
  src.connect(flt); flt.connect(g); g.connect(sfxBus);
  src.start(start); src.stop(start+dur+0.05);
}

const SFX = {
  step(){ if(!AC)return; const t=AC.currentTime; mkNoise(t,0.06,0.08,300); },
  hit(){ if(!AC)return; const t=AC.currentTime; mkOsc(180,'sawtooth',t,0.12,0.3); mkNoise(t,0.08,0.2,600); },
  hurt(){ if(!AC)return; const t=AC.currentTime; mkOsc(300,'sawtooth',t,0.05,0.25); mkOsc(220,'sawtooth',t+0.04,0.12,0.2); },
  heal(){ if(!AC)return; const t=AC.currentTime; [523,659,784,880].forEach((f,i)=>mkOsc(f,'sine',t+i*0.06,0.18,0.15)); },
  collect(){ if(!AC)return; const t=AC.currentTime; mkOsc(660,'sine',t,0.09,0.15); mkOsc(990,'sine',t+0.06,0.09,0.12); },
  victory(){ if(!AC)return; const t=AC.currentTime; [523,659,784,1047,1319].forEach((f,i)=>mkOsc(f,'triangle',t+i*0.09,0.25,0.18)); },
  levelup(){ if(!AC)return; const t=AC.currentTime; [392,523,659,784,1047].forEach((f,i)=>mkOsc(f,'sine',t+i*0.07,0.3,0.2)); },
  flee(){ if(!AC)return; const t=AC.currentTime; mkOsc(440,'sawtooth',t,0.05,0.2); mkOsc(330,'sawtooth',t+0.05,0.1,0.15); },
  enemyMove(){ if(!AC)return; const t=AC.currentTime; mkOsc(rc(80,120),'sawtooth',t,0.18,0.2); mkNoise(t,0.1,0.15,400); },
  boss(){ if(!AC)return; const t=AC.currentTime; mkNoise(t,0.25,0.35,200); mkOsc(55,'sawtooth',t,0.3,0.4); mkOsc(82,'sawtooth',t+0.08,0.25,0.3); },
};

let overworldInterval=null, battleInterval=null;

function stopMusic() {
  if (overworldInterval) { clearInterval(overworldInterval); overworldInterval=null; }
  if (battleInterval) { clearInterval(battleInterval); battleInterval=null; }
  musicNodes.forEach(n=>{ try{n.stop();}catch(e){} });
  musicNodes=[];
}

function startOverworldMusic() {
  if (!AC) return;
  stopMusic();
  const pad = AC.createOscillator(); pad.type='sine'; pad.frequency.value=220;
  const padG=AC.createGain(); padG.gain.value=0.04;
  const padLp=AC.createBiquadFilter(); padLp.type='lowpass'; padLp.frequency.value=600;
  pad.connect(padLp); padLp.connect(padG); padG.connect(musicBus); pad.start(); musicNodes.push(pad);
  const pad2=AC.createOscillator(); pad2.type='sine'; pad2.frequency.value=329.6;
  const pad2G=AC.createGain(); pad2G.gain.value=0.025;
  pad2.connect(pad2G); pad2G.connect(musicBus); pad2.start(); musicNodes.push(pad2);
  const PENTA=[261.6,293.7,329.6,392,440,523.3,587.3,659.3];
  let beat=0;
  overworldInterval=setInterval(()=>{
    if(!AC) return;
    const t=AC.currentTime;
    if(beat%8===0){
      const b=AC.createOscillator(); b.type='triangle';
      b.frequency.value=[110,130.8,164.8,196][Math.floor(beat/8)%4];
      const bg=AC.createGain(); bg.gain.setValueAtTime(0.06,t); bg.gain.exponentialRampToValueAtTime(0.001,t+0.6);
      b.connect(bg); bg.connect(musicBus); b.start(t); b.stop(t+0.7); musicNodes.push(b);
    }
    if(beat%2===0 && Math.random()<0.55){
      const f=PENTA[ri(0,PENTA.length-1)];
      const o=AC.createOscillator(); o.type='sine'; o.frequency.value=f;
      const g=AC.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.06,t+0.08);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.55);
      const del=AC.createDelay(); del.delayTime.value=0.3;
      const dg=AC.createGain(); dg.gain.value=0.3;
      o.connect(g); g.connect(musicBus); g.connect(del); del.connect(dg); dg.connect(musicBus);
      o.start(t); o.stop(t+0.6); musicNodes.push(o);
    }
    beat++;
  },300);
}

function startBattleMusic() {
  if(!AC) return;
  stopMusic();
  const MINOR=[220,246.9,261.6,293.7,329.6,349.2,392,440];
  let beat=0;
  battleInterval=setInterval(()=>{
    if(!AC) return;
    const t=AC.currentTime;
    if(beat%4===0){
      mkNoise(t,0.1,0.3,200);
      const o=AC.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(180,t);
      o.frequency.exponentialRampToValueAtTime(40,t+0.12);
      const g=AC.createGain(); g.gain.setValueAtTime(0.35,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15);
      o.connect(g); g.connect(musicBus); o.start(t); o.stop(t+0.2);
    }
    if(beat%4===2) mkNoise(t,0.08,0.25,2000);
    mkNoise(t,0.03,0.08,8000);
    if(beat%2===0){
      const f=MINOR[ri(0,3)]/2;
      const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=f;
      const flt=AC.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=300;
      const g=AC.createGain(); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
      o.connect(flt); flt.connect(g); g.connect(musicBus); o.start(t); o.stop(t+0.3);
    }
    if(beat%8===0 && Math.random()<0.7){
      const seq=[MINOR[ri(4,7)],MINOR[ri(2,5)],MINOR[ri(0,3)]];
      seq.forEach((f,i)=>{
        const o=AC.createOscillator(); o.type='square'; o.frequency.value=f;
        const g=AC.createGain(); g.gain.setValueAtTime(0,t+i*0.12);
        g.gain.linearRampToValueAtTime(0.05,t+i*0.12+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.15);
        o.connect(g); g.connect(musicBus); o.start(t+i*0.12); o.stop(t+i*0.12+0.2);
      });
    }
    beat++;
  },150);
}

// ─── Progression ─────────────────────────────────────────────────────────────
const XP_TABLE=[0,30,70,130,210,320,460,630,830,1060,99999];
const SHOP_ITEMS=[
  {id:'MANGO',name:'Mango',desc:'Restore 30 HP.',cost:12},
  {id:'HERB', name:'Herb', desc:'Cure poison.',  cost:10},
  {id:'SEED', name:'Weird Seed',desc:'Restore 70 HP.',cost:35},
];

function makePlayer(){
  return{level:1,xp:0,hp:40,maxHp:40,atk:8,def:3,spd:5,statPoints:0,gold:20,
    inventory:{MANGO:2,HERB:1,SEED:0},skillsUnlocked:['CHOMP'],
    buffMult:1,buffTurns:0,poisoned:0,burned:0,defDebuff:0,defDebuffTurns:0,name:'Capy'};
}

const SKILL_DEFS={
  CHOMP:{name:'Chomp',desc:'Bite! 150% ATK.',
    use(p,e){const dmg=Math.max(1,Math.floor(p.atk*1.5*p.buffMult)-(e.def+e.defDebuff))+ri(-2,2);
      p.buffMult=1;p.buffTurns=0;e.hp-=dmg;return{msg:`Capy chomps for ${dmg}!`,dmg,type:'hit'};}},
  SOAK:{name:'Hot Soak',desc:'Heal 35% max HP.',
    use(p){const heal=Math.floor(p.maxHp*0.35);p.hp=Math.min(p.maxHp,p.hp+heal);
      return{msg:`Hot soak heals ${heal} HP!`,heal,type:'heal'};}},
  MUD_ROLL:{name:'Mud Roll',desc:'Enemy DEF -3 (3 turns).',
    use(p,e){const dmg=Math.max(1,p.atk-(e.def+e.defDebuff))+ri(-1,1);
      e.hp-=dmg;e.defDebuff+=3;e.defDebuffTurns=3;
      return{msg:`Mud roll! ${dmg} dmg, enemy DEF-3!`,dmg,type:'hit'};}},
  HERD_CALL:{name:'Herd Call',desc:'Next attack x2!',
    use(p){p.buffMult=2;p.buffTurns=1;return{msg:`Herd rallies! Next hit x2!`,type:'buff'};}},
};

function checkLevelUp(player){
  let leveled=false;
  while(player.xp>=XP_TABLE[player.level]&&player.level<10){
    player.level++;player.statPoints+=3;player.maxHp+=8;player.hp=Math.min(player.hp+8,player.maxHp);
    if(player.level===3)player.skillsUnlocked.push('SOAK');
    if(player.level===5)player.skillsUnlocked.push('MUD_ROLL');
    if(player.level===7)player.skillsUnlocked.push('HERD_CALL');
    leveled=true;
  }
  return leveled;
}

// ─── Save/Load ───────────────────────────────────────────────────────────────
const SAVE_KEY='capy-quest-v1';
function saveGame(state){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({player:state.player,px:state.px,py:state.py,
    defeatedEnemies:[...state.defeatedEnemies],pickedItems:[...state.pickedItems]}));}catch(e){}
}
function loadGame(){
  try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(d&&d.player)return d;}catch(e){}
  return null;
}

// ─── Three.js renderer ───────────────────────────────────────────────────────
let renderer,scene,camera,capyMesh,enemyMeshes={},npcMeshes=[],pickupMeshes=[];
let tileGrid=[];

function tileToWorld(col,row){
  return{x:col*TILE-MAP_W*TILE/2+TILE/2, z:row*TILE-MAP_H*TILE/2+TILE/2};
}

function buildTerrain(){
  const geo=new THREE.BufferGeometry();
  const verts=[],colours=[];
  tileGrid=[];
  for(let r=0;r<MAP_H;r++){
    tileGrid[r]=[];
    for(let c=0;c<MAP_W;c++){
      const t=RAW_MAP[r][c]; tileGrid[r][c]=t;
      const{x,z}=tileToWorld(c,r); const h=TILE/2;
      const[br,bg,bb]=TILE_RGB[t];
      const corners=[[x-h,z-h],[x+h,z-h],[x+h,z+h],[x-h,z+h]];
      const yOff=PASSABLE[t]?0:0.25;
      [[0,2,1],[0,3,2]].forEach(tri=>{
        tri.forEach(i=>{
          verts.push(corners[i][0],yOff,corners[i][1]);
          const j=rc(-0.04,0.04);
          colours.push(cl(br+j,0,1),cl(bg+j,0,1),cl(bb+j,0,1));
        });
      });
    }
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));
  geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})));

  const stumpG=new THREE.CylinderGeometry(0.25,0.35,0.8,6);
  const crownG=new THREE.IcosahedronGeometry(0.7,0);
  const stumpM=new THREE.MeshLambertMaterial({color:0x5a3010});
  const crownM=new THREE.MeshLambertMaterial({color:0x1a5a10});
  const rockG=new THREE.DodecahedronGeometry(0.5,0);
  const rockM=new THREE.MeshLambertMaterial({color:0x666055});
  for(let r=0;r<MAP_H;r++) for(let c=0;c<MAP_W;c++){
    const t=RAW_MAP[r][c]; const{x,z}=tileToWorld(c,r);
    if(t===TR){
      const s=new THREE.Mesh(stumpG,stumpM); s.position.set(x,0.4,z); scene.add(s);
      const cr=new THREE.Mesh(crownG,crownM); cr.position.set(x,1.4+rc(-0.2,0.2),z); scene.add(cr);
    } else if(t===K){
      const rk=new THREE.Mesh(rockG,rockM);
      rk.position.set(x+rc(-0.2,0.2),0.35,z+rc(-0.2,0.2));
      rk.rotation.set(rc(0,2),rc(0,2),0); scene.add(rk);
    }
  }
}

function buildCapy(){
  const mat=new THREE.MeshLambertMaterial({color:0x8B6340});
  const noseMat=new THREE.MeshLambertMaterial({color:0x5a3a1a});
  const root=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.55,1.1),mat);
  body.position.set(0,0.5,0); root.add(body);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.5,0.55),mat);
  head.position.set(0,0.82,0.45); root.add(head);
  const nose=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.18,0.2),noseMat);
  nose.position.set(0,0.78,0.72); root.add(nose);
  const earG=new THREE.CylinderGeometry(0.1,0.12,0.25,5);
  const earL=new THREE.Mesh(earG,mat); earL.position.set(-0.25,1.08,0.4); root.add(earL);
  const earR=new THREE.Mesh(earG,mat); earR.position.set(0.25,1.08,0.4); root.add(earR);
  const legG=new THREE.BoxGeometry(0.22,0.38,0.22);
  [[-0.28,0.19,-0.28],[-0.28,0.19,0.28],[0.28,0.19,-0.28],[0.28,0.19,0.28]].forEach(([lx,ly,lz])=>{
    const l=new THREE.Mesh(legG,mat); l.position.set(lx,ly,lz); root.add(l);
  });
  capyMesh=root; scene.add(root);
}

function buildEnemyMesh(edef,id){
  const g=new THREE.Group();
  const bm=new THREE.MeshLambertMaterial({color:edef.color});
  const em=new THREE.MeshLambertMaterial({color:0xff2222});
  if(edef.boss){
    const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.5,2.0),bm); b.position.set(0,0.35,0); g.add(b);
    const h=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.35,0.8),bm); h.position.set(0,0.38,1.1); g.add(h);
    const tail=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.3,0.9),bm); tail.position.set(0,0.3,-1.1); g.add(tail);
  } else {
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.55,0.7),bm); b.position.set(0,0.38,0); g.add(b);
    const h=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.35,0.4),bm); h.position.set(0,0.72,0.35); g.add(h);
  }
  const eL=new THREE.Mesh(new THREE.SphereGeometry(0.06,4,4),em);
  eL.position.set(-0.16,0.78,0.52);
  const eR=new THREE.Mesh(new THREE.SphereGeometry(0.06,4,4),em);
  eR.position.set(0.16,0.78,0.52);
  g.add(eL); g.add(eR); enemyMeshes[id]=g; scene.add(g); return g;
}

function buildNpcMesh(npc){
  const g=new THREE.Group();
  const bm=new THREE.MeshLambertMaterial({color:npc.isShop?0xd4a02a:0x7a5c30});
  const b=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.55,0.9),bm); b.position.set(0,0.48,0); g.add(b);
  const h=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.45,0.5),bm); h.position.set(0,0.82,0.3); g.add(h);
  if(npc.isShop){
    const hat=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.3,0.3,6),new THREE.MeshLambertMaterial({color:0xdd9900}));
    hat.position.set(0,1.18,0.3); g.add(hat);
  }
  const{x,z}=tileToWorld(npc.col,npc.row); g.position.set(x,0,z);
  scene.add(g); npcMeshes.push({mesh:g,npc}); return g;
}

function buildPickupMesh(p){
  const col=p.item==='HERB'?0x22cc44:p.item==='SEED'?0xcc8822:0xffaa00;
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(0.28,0),
    new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:0.4}));
  const{x,z}=tileToWorld(p.col,p.row); m.position.set(x,0.4,z);
  scene.add(m); pickupMeshes.push({mesh:m,pickup:p,col:p.col,row:p.row,item:p.item}); return m;
}

function initScene(){
  const container=document.getElementById('game');
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(2,devicePixelRatio));
  container.appendChild(renderer.domElement);
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x4a7a30);
  scene.fog=new THREE.Fog(0x4a7a30,18,36);
  camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,80);
  scene.add(new THREE.AmbientLight(0xffffff,1.3));
  const sun=new THREE.DirectionalLight(0xfffbe0,1.2); sun.position.set(8,16,6); scene.add(sun);
  buildTerrain();
  for(let r=0;r<MAP_H;r++) for(let c=0;c<MAP_W;c++){
    if(RAW_MAP[r][c]===S){const{x,z}=tileToWorld(c,r);const pt=new THREE.PointLight(0x40d0ff,8,3,1.5);pt.position.set(x,0.5,z);scene.add(pt);}
  }
  buildCapy();
  NPC_SPAWNS.forEach(n=>buildNpcMesh(n));
}

// ─── Game state ───────────────────────────────────────────────────────────────
const STATE={OVERWORLD:'ow',BATTLE:'bt',DIALOG:'dl',SHOP:'sh',LEVELUP:'lu',GAMEOVER:'go'};
let gameState=STATE.OVERWORLD, player;
let px=13, py=14, lerpPx=0, lerpPz=0;
let defeatedEnemies=new Set(), pickedItems=new Set();
let activeEnemies=[], battleEnemy=null, battleEnemyRef=null;
let btLog=[], btPhase='';
let frame=0, autoSaveTimer=0, moveTimer=0;
const MOVE_INTERVAL=0.16;
const shakers=new Map();

const $=id=>document.getElementById(id);
const hudHP=$('hudHP'),hudHPBar=$('hudHPBar'),hudLvl=$('hudLvl'),hudGold=$('hudGold'),hudZone=$('hudZone');
const battleOverlay=$('battle'),btEnemyName=$('btEnemyName'),btEnemyHP=$('btEnemyHP');
const btEnemyHPBar=$('btEnemyHPBar'),btCapyHP=$('btCapyHP'),btCapyHPBar=$('btCapyHPBar');
const btLog$=$('btLog'),btActions=$('btActions');
const dialogBox=$('dialogBox'),dialogText=$('dialogText'),dialogBtn=$('dialogBtn');
const shopModal=$('shopModal'),shopList=$('shopList'),shopGold=$('shopGold');
const levelUpModal=$('levelUp'),luText=$('luText');
const toast=$('toast'),bootEl=$('boot');

function updateHUD(){
  hudHP.textContent=`${player.hp}/${player.maxHp}`;
  hudHPBar.style.width=`${Math.max(0,player.hp/player.maxHp*100)}%`;
  hudLvl.textContent=`Lv${player.level}`;
  hudGold.textContent=`◈${player.gold}`;
  const xpPct=(player.xp-XP_TABLE[player.level-1])/(XP_TABLE[player.level]-XP_TABLE[player.level-1]);
  $('xpBar').style.width=`${Math.max(0,Math.min(100,xpPct*100))}%`;
  hudZone.textContent=getZoneName(px,py);
}

function getZoneName(c,r){
  if(r<8)return'♦ Rocky Highlands';
  if(c<6)return'🏛 Ancient Ruins';
  if(c>18||r<6)return'🌊 Riverside';
  if(r>18)return'🌿 Deep Jungle';
  return'♨ Hot Springs Village';
}

function showToast(msg,dur=2000){toast.textContent=msg;toast.style.opacity='1';setTimeout(()=>toast.style.opacity='0',dur);}

function spawnEnemies(){
  activeEnemies=[];
  ENEMY_SPAWNS.forEach((sp,i)=>{
    if(defeatedEnemies.has(i)) return;
    const[col,row,type]=sp; const edef=EDEFS[type];
    const e={id:i,col,row,type,def:edef,name:edef.name,hp:edef.hp,maxHp:edef.hp,
      atk:edef.atk,def2:edef.def,spd:edef.spd,wander:0,boss:edef.boss||false,defDebuff:0,defDebuffTurns:0};
    const m=buildEnemyMesh(edef,`e${i}`);
    const{x,z}=tileToWorld(col,row); m.position.set(x,0,z); e.mesh=m; activeEnemies.push(e);
  });
}

function spawnPickups(){
  PICKUP_SPAWNS.forEach((p,i)=>{
    if(pickedItems.has(i)) return;
    p._idx=i; buildPickupMesh(p);
  });
}

function tryMove(dc,dr){
  const nc=px+dc,nr=py+dr;
  if(nc<0||nc>=MAP_W||nr<0||nr>=MAP_H) return false;
  if(!PASSABLE[RAW_MAP[nr][nc]]) return false;
  px=nc; py=nr; SFX.step(); return true;
}

function checkInteractions(){
  for(const e of activeEnemies){ if(e.col===px&&e.row===py){startBattle(e);return;} }
  pickupMeshes.forEach(p=>{
    if(p.col===px&&p.row===py&&p.mesh.visible){
      p.mesh.visible=false; pickedItems.add(p.pickup._idx);
      player.inventory[p.item]=(player.inventory[p.item]||0)+1;
      SFX.collect(); showToast(`Found ${p.item}!`); updateHUD();
    }
  });
  if(RAW_MAP[py][px]===S&&player.hp<player.maxHp){player.hp=Math.min(player.maxHp,player.hp+1);updateHUD();}
}

function tryInteract(){
  for(const{npc}of npcMeshes){
    if(Math.abs(npc.col-px)<=1&&Math.abs(npc.row-py)<=1){
      if(npc.isShop)openShop(); else{dialogText.textContent=npc.dialog;dialogBox.classList.remove('hidden');gameState=STATE.DIALOG;}
      return;
    }
  }
}

function startBattle(e){
  initAudio(); startBattleMusic();
  battleEnemyRef=e;
  battleEnemy={name:e.def.name,hp:e.hp,maxHp:e.def.hp,atk:e.def.atk,def:e.def2,defDebuff:0,defDebuffTurns:0,spd:e.def.spd,special:e.def.special,boss:e.boss};
  player.defDebuff=0;player.defDebuffTurns=0;player.poisoned=0;player.burned=0;player.buffMult=1;player.buffTurns=0;
  btLog=[]; gameState=STATE.BATTLE; battleOverlay.classList.remove('hidden');
  if(e.boss)SFX.boss();
  renderBattle('choose');
  addBattleLog(e.boss?`THE GRAND CAIMAN AWAKENS!`:`A wild ${battleEnemy.name} appears!`);
}

function renderBattle(phase){
  btPhase=phase;
  btEnemyName.textContent=battleEnemy.name+(battleEnemy.boss?' [BOSS]':'');
  btEnemyHP.textContent=`${Math.max(0,battleEnemy.hp)}/${battleEnemy.maxHp}`;
  btEnemyHPBar.style.width=`${Math.max(0,battleEnemy.hp/battleEnemy.maxHp*100)}%`;
  btCapyHP.textContent=`${player.hp}/${player.maxHp}`;
  btCapyHPBar.style.width=`${Math.max(0,player.hp/player.maxHp*100)}%`;
  if(phase==='choose'){
    btActions.innerHTML='';
    makeBtn('Attack',()=>doBattleAction('ATK'));
    player.skillsUnlocked.forEach(sk=>makeBtn(SKILL_DEFS[sk].name,()=>doBattleAction('SKILL',sk)));
    Object.entries(player.inventory).forEach(([id,qty])=>{
      if(qty>0){const s=SHOP_ITEMS.find(s=>s.id===id);if(s)makeBtn(`${s.name} x${qty}`,()=>doBattleAction('ITEM',id));}
    });
    makeBtn('Flee',()=>doBattleAction('FLEE'));
  } else {
    btActions.innerHTML='<div style="color:#8ab;font-size:14px;text-align:center;padding:12px">...</div>';
  }
}

function makeBtn(label,cb){
  const b=document.createElement('button'); b.className='btBtn'; b.textContent=label;
  b.ontouchstart=b.onclick=()=>{if(gameState===STATE.BATTLE&&btPhase==='choose')cb();};
  btActions.appendChild(b);
}

function addBattleLog(msg){btLog.unshift(msg);btLog$.textContent=btLog.slice(0,4).join('\n');}

function doBattleAction(type,arg){
  renderBattle('acting');
  if(type==='ATK'){
    const dmg=Math.max(1,Math.floor(player.atk*player.buffMult)-(battleEnemy.def+battleEnemy.defDebuff))+ri(-2,2);
    player.buffMult=1;player.buffTurns=0;battleEnemy.hp-=dmg;SFX.hit();
    addBattleLog(`Capy attacks for ${dmg}!`);shakeMesh(battleEnemyRef?.mesh);
  } else if(type==='SKILL'){
    const sk=SKILL_DEFS[arg]; const r=sk.use(player,battleEnemy);
    if(r.type==='hit')SFX.hit(); else if(r.type==='heal')SFX.heal();
    addBattleLog(r.msg); if(r.dmg)shakeMesh(battleEnemyRef?.mesh);
  } else if(type==='ITEM'){
    const qty=player.inventory[arg]||0;
    if(qty>0){
      player.inventory[arg]--;
      if(arg==='MANGO'){const h=30;player.hp=Math.min(player.maxHp,player.hp+h);SFX.heal();addBattleLog(`Ate a Mango! +${h} HP!`);}
      else if(arg==='SEED'){const h=70;player.hp=Math.min(player.maxHp,player.hp+h);SFX.heal();addBattleLog(`Weird Seed! +${h} HP!`);}
      else if(arg==='HERB'){player.poisoned=0;SFX.heal();addBattleLog('Herb cured poison!');}
    }
  } else if(type==='FLEE'){
    if(Math.random()<0.55){SFX.flee();endBattle(false,true);return;}
    else addBattleLog("Couldn't flee!");
  }
  updateHUD();
  if(battleEnemy.hp<=0){setTimeout(()=>endBattle(true),600);return;}
  if(battleEnemy.defDebuffTurns>0){battleEnemy.defDebuffTurns--;if(!battleEnemy.defDebuffTurns)battleEnemy.defDebuff=0;}
  setTimeout(()=>doEnemyTurn(),700);
}

function doEnemyTurn(){
  if(gameState!==STATE.BATTLE)return;
  renderBattle('enemy');
  const e=battleEnemy; let dmg=0,msg='';
  if(e.special==='DOUBLE'){
    const d1=Math.max(1,e.atk-(player.def+player.defDebuff))+ri(-1,1);
    const d2=Math.max(1,Math.floor(e.atk*0.6)-(player.def+player.defDebuff))+ri(-1,1);
    dmg=d1+d2;msg=`${e.name} strikes twice! ${d1}+${d2}=${dmg}!`;
  } else if(e.special==='POISON'&&Math.random()<0.35){
    dmg=Math.max(1,e.atk-(player.def+player.defDebuff))+ri(-1,1);player.poisoned=3;msg=`${e.name} poisons! ${dmg}!`;
  } else if(e.special==='BURN'&&Math.random()<0.35){
    dmg=Math.max(1,e.atk-(player.def+player.defDebuff))+ri(-1,1);player.burned=3;msg=`${e.name} breathes fire! ${dmg}!`;
  } else if(e.special==='CRUSH'&&Math.random()<0.4){
    dmg=Math.max(1,Math.floor(e.atk*1.5)-(player.def+player.defDebuff))+ri(-2,2);msg=`Grand Caiman CRUSHES! ${dmg}!`;SFX.boss();
  } else {
    dmg=Math.max(1,e.atk-(player.def+player.defDebuff))+ri(-2,2);msg=`${e.name} attacks for ${dmg}!`;
  }
  player.hp-=dmg;
  if(player.poisoned>0){player.hp-=4;player.poisoned--;msg+='\nPoison! -4';}
  if(player.burned>0){player.hp-=5;player.burned--;msg+='\nBurn! -5';}
  if(player.defDebuffTurns>0){player.defDebuffTurns--;if(!player.defDebuffTurns)player.defDebuff=0;}
  SFX.enemyMove();shakeMesh(capyMesh);addBattleLog(msg);updateHUD();
  if(player.hp<=0){setTimeout(()=>doGameOver(),600);return;}
  setTimeout(()=>renderBattle('choose'),700);
}

function endBattle(won,fled=false){
  if(won){
    SFX.victory();
    const e=battleEnemyRef; player.xp+=e.def.xp;player.gold+=e.def.gold;
    defeatedEnemies.add(e.id);if(e.mesh)e.mesh.visible=false;
    activeEnemies=activeEnemies.filter(a=>a.id!==e.id);
    addBattleLog(`Victory! +${e.def.xp} XP, +${e.def.gold}`);
    const leveled=checkLevelUp(player);
    setTimeout(()=>{
      battleOverlay.classList.add('hidden');gameState=STATE.OVERWORLD;startOverworldMusic();
      updateHUD();saveGame({player,px,py,defeatedEnemies,pickedItems});
      if(leveled)showLevelUp();
    },800);
  } else {
    battleOverlay.classList.add('hidden');gameState=STATE.OVERWORLD;startOverworldMusic();
    if(fled)showToast('Got away!');
  }
}

function doGameOver(){
  SFX.flee();SFX.hurt();battleOverlay.classList.add('hidden');
  gameState=STATE.GAMEOVER;$('gameOver').classList.remove('hidden');
}

function showLevelUp(){
  SFX.levelup();gameState=STATE.LEVELUP;
  const last=player.skillsUnlocked[player.skillsUnlocked.length-1];
  luText.textContent=`Level ${player.level}!\nHP:${player.maxHp} ATK:${player.atk} DEF:${player.def}${last!=='CHOMP'?`\nNew: ${SKILL_DEFS[last].name}`:''}`;
  levelUpModal.classList.remove('hidden');
}

function openShop(){
  gameState=STATE.SHOP;shopGold.textContent=player.gold;shopList.innerHTML='';
  SHOP_ITEMS.forEach(item=>{
    const row=document.createElement('div');row.className='shopRow';
    const info=document.createElement('div');
    info.innerHTML=`<b>${item.name}</b> <span style="color:#aaa;font-size:12px">${item.desc}</span>`;
    const qty=document.createElement('span');qty.textContent=`x${player.inventory[item.id]||0}`;
    qty.style.cssText='color:#8ff;font-size:12px;min-width:28px;text-align:right;';
    const btn=document.createElement('button');btn.className='shopBtn';btn.textContent=`${item.cost}`;
    btn.onclick=()=>{
      if(player.gold>=item.cost&&(player.inventory[item.id]||0)<5){
        player.gold-=item.cost;player.inventory[item.id]=(player.inventory[item.id]||0)+1;
        SFX.collect();shopGold.textContent=player.gold;qty.textContent=`x${player.inventory[item.id]}`;updateHUD();
      }
    };
    row.appendChild(info);row.appendChild(qty);row.appendChild(btn);shopList.appendChild(row);
  });
  shopModal.classList.remove('hidden');
}

function shakeMesh(m){if(!m)return;shakers.set(m,{t:0,ox:m.position.x,oy:m.position.y,oz:m.position.z});}
function updateShakers(dt){
  shakers.forEach((s,m)=>{s.t+=dt;
    if(s.t>0.25){m.position.set(s.ox,s.oy,s.oz);shakers.delete(m);}
    else m.position.set(s.ox+Math.sin(s.t*80)*0.12,s.oy,s.oz);
  });
}

let dirBtns={};
function setupInput(){
  ['up','down','left','right'].forEach(dir=>{
    const el=$('dir-'+dir);if(!el)return;dirBtns[dir]=false;
    el.addEventListener('touchstart',e=>{e.preventDefault();dirBtns[dir]=true;},{passive:false});
    el.addEventListener('touchend',e=>{e.preventDefault();dirBtns[dir]=false;},{passive:false});
    el.addEventListener('mousedown',()=>dirBtns[dir]=true);el.addEventListener('mouseup',()=>dirBtns[dir]=false);
  });
  $('interactBtn')?.addEventListener('touchstart',e=>{e.preventDefault();tryInteract();},{passive:false});
  $('interactBtn')?.addEventListener('click',tryInteract);
  dialogBtn?.addEventListener('click',()=>{dialogBox.classList.add('hidden');gameState=STATE.OVERWORLD;});
  $('shopClose')?.addEventListener('click',()=>{shopModal.classList.add('hidden');gameState=STATE.OVERWORLD;});
  $('luClose')?.addEventListener('click',()=>{levelUpModal.classList.add('hidden');gameState=STATE.OVERWORLD;});
  $('goRestart')?.addEventListener('click',()=>{
    $('gameOver').classList.add('hidden');player=makePlayer();px=13;py=14;
    defeatedEnemies=new Set();pickedItems=new Set();
    Object.values(enemyMeshes).forEach(m=>scene.remove(m));enemyMeshes={};
    pickupMeshes.forEach(p=>scene.remove(p.mesh));pickupMeshes=[];activeEnemies=[];
    spawnEnemies();spawnPickups();updateHUD();gameState=STATE.OVERWORLD;startOverworldMusic();
  });
  document.addEventListener('touchstart',()=>{initAudio();startOverworldMusic();},{once:true,passive:true});
  document.addEventListener('mousedown',()=>{initAudio();startOverworldMusic();},{once:true});
}

function updateEnemies(dt){
  activeEnemies.forEach(e=>{
    e.wander-=dt;
    if(e.wander<=0){
      const dirs=[[-1,0],[1,0],[0,-1],[0,1]];const d=dirs[ri(0,3)];
      const nc=e.col+d[0],nr=e.row+d[1];
      if(nc>=1&&nc<MAP_W-1&&nr>=1&&nr<MAP_H-1&&PASSABLE[RAW_MAP[nr][nc]]){
        e.col=nc;e.row=nr;const{x,z}=tileToWorld(nc,nr);e.mesh.position.set(x,0,z);
      }
      e.wander=e.boss?3:rc(1.2,2.8);
    }
    if(e.mesh) e.mesh.position.y=Math.sin(frame*0.04+e.id)*0.06;
  });
}

let lastTime=0;
function loop(ts){
  requestAnimationFrame(loop);
  const dt=Math.min(0.05,(ts-lastTime)/1000);lastTime=ts;frame++;
  if(gameState===STATE.OVERWORLD){
    moveTimer-=dt;
    if(moveTimer<=0){
      let moved=false;
      if(dirBtns.up)moved=tryMove(0,-1);
      else if(dirBtns.down)moved=tryMove(0,1);
      else if(dirBtns.left)moved=tryMove(-1,0);
      else if(dirBtns.right)moved=tryMove(1,0);
      if(moved){moveTimer=MOVE_INTERVAL;checkInteractions();}
    }
    const{x:wx,z:wz}=tileToWorld(px,py);
    lerpPx=lerp(lerpPx,wx,0.18);lerpPz=lerp(lerpPz,wz,0.18);
    capyMesh.position.set(lerpPx,0,lerpPz);
    capyMesh.children[0].position.y=0.5+Math.sin(frame*0.12)*0.04;
    if(dirBtns.up)capyMesh.rotation.y=0;
    if(dirBtns.down)capyMesh.rotation.y=Math.PI;
    if(dirBtns.left)capyMesh.rotation.y=Math.PI/2;
    if(dirBtns.right)capyMesh.rotation.y=-Math.PI/2;
    updateEnemies(dt);updateShakers(dt);
    pickupMeshes.forEach(p=>{if(p.mesh.visible)p.mesh.position.y=0.4+Math.sin(frame*0.08+p.col)*0.1;});
    camera.position.set(lerpPx,14,lerpPz+11);camera.lookAt(lerpPx,0,lerpPz-1);
    autoSaveTimer+=dt;
    if(autoSaveTimer>15){autoSaveTimer=0;saveGame({player,px,py,defeatedEnemies,pickedItems});}
  }
  renderer.render(scene,camera);
}

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);
});

function boot(){
  initScene();setupInput();
  const save=loadGame();
  if(save){player=save.player;px=save.px;py=save.py;defeatedEnemies=new Set(save.defeatedEnemies);pickedItems=new Set(save.pickedItems);showToast('Game restored!');}
  else{player=makePlayer();showToast('Walk into enemies to battle!');}
  const{x:wx,z:wz}=tileToWorld(px,py);lerpPx=wx;lerpPz=wz;capyMesh.position.set(wx,0,wz);
  spawnEnemies();spawnPickups();updateHUD();bootEl.classList.add('hidden');requestAnimationFrame(loop);
}

boot();
