import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const socket = io();
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let chosenRole = "monk", myId = null, myName = "Tâm An", myScore = 0, selectedAmount = 20000;
let audioCtx = null, musicTimer = null, musicOn = false;
const actors = new Map();
const canvas = $("#templeCanvas");
const wrap = $("#sceneWrap");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#e8d6b0");
scene.fog = new THREE.Fog("#e8d6b0", 28, 58);
const camera = new THREE.PerspectiveCamera(43, 1, .1, 100);
camera.position.set(0, 13.5, 21.5);
camera.lookAt(0, 2.8, 0);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.add(new THREE.HemisphereLight(0xfff0cf, 0x755039, 2.1));
const sun = new THREE.DirectionalLight(0xffe1a1, 3.2); sun.position.set(-5, 12, 7); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);
const warm = new THREE.PointLight(0xffbf5e, 24, 22); warm.position.set(0,6,-4); scene.add(warm);

function mat(color, roughness=.75, metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
const wood=mat("#6e3824"), darkWood=mat("#48251a"), gold=mat("#d9a843",.35,.55), cream=mat("#fff0c9"), floorMat=mat("#c8ad82"), red=mat("#9e3328"), jade=mat("#456b4b"), porcelain=mat("#e9e1ce");
function box(parent,x,y,z,w,h,d,material,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,x,y,z,rt,rb,h,material,seg=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(parent,x,y,z,r,material,scale){const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),material);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;parent.add(m);return m;}
function torus(parent,x,y,z,r,t,material){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,48),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}

function buildTemple(){
  box(scene,0,-.35,0,20,.5,24,floorMat);
  // stone tile grid
  for(let x=-9;x<=9;x+=2)for(let z=-10;z<=10;z+=2)box(scene,x,-.085,z,1.96,.025,1.96,mat((Math.abs(x+z)%4===0)?"#d8c39d":"#cbb58f"),false);
  box(scene,0,.02,1,3.2,.09,18,mat("#9f2e28"));
  // hall walls and open window bays
  box(scene,0,5.3,-10.8,20,10.5,.45,darkWood);
  box(scene,0,10.55,-10.7,21,.45,1.1,wood);
  for(let x=-9;x<=9;x+=3){box(scene,x,5.2,-10.45,.18,9.7,.45,gold);box(scene,x,9.6,-10.35,2.8,.16,.5,wood);}
  // side pillars and carved beam
  for(const x of [-9,-6,-3,0,3,6,9]){
    for(const z of [-8.5, -3.5, 2.5, 8.5]){
      if(Math.abs(x)===9 || x===-6 || x===6){box(scene,x,3.15,z,.48,6.3,.48,wood);box(scene,x,6.35,z,.72,.2,.72,gold);}
    }
  }
  box(scene,0,9.2,-8.8,19,.38,.8,darkWood);box(scene,0,9.45,-8.8,18,.14,.9,gold);
  // rafters
  for(let x=-9;x<=9;x+=1.5){const r=box(scene,x,9.9,-7.6,.13,1.1,6,wood);r.rotation.x=-.16;}
  // windows with greenery beyond
  for(const x of [-8,-5,5,8]){
    box(scene,x,3.8,-10.15,1.8,3.1,.1,mat("#b6c89b"));
    for(let k=0;k<4;k++)box(scene,x-0.8+k*.53,3.8,-10.05,.055,3.1,.12,wood,false);
  }
  // altar dais
  box(scene,0,.45,-7.4,8.8,.8,3.2,darkWood);box(scene,0,.9,-7.4,8.1,.16,2.8,gold);
  box(scene,0,1.25,-7.5,6.8,.6,2.2,wood);box(scene,0,1.58,-7.5,6.5,.12,2.0,gold);
  // altar front carvings
  for(let x=-2.8;x<=2.8;x+=.7){torus(scene,x,1.3,-6.35,.22,.045,gold);}
  // Buddha lotus base
  cylinder(scene,0,1.95,-8.1,1.55,1.7,.45,gold,48);
  cylinder(scene,0,2.2,-8.1,1.25,1.25,.22,mat("#b77b2e",.4,.4),48);
  // lotus petals around pedestal
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const p=sphere(scene,Math.cos(a)*1.28,2.05,-8.1+Math.sin(a)*1.28,.32,mat("#f1c66b"),[.7,.45,1]);p.rotation.y=-a;}
  // Buddha statue, deliberately stylized, calm and golden
  const buddha= new THREE.Group(); scene.add(buddha); buddha.position.set(0,2.25,-8.1);
  sphere(buddha,0,1.75,0,.78,gold,[1,.86,.78]);
  sphere(buddha,0,2.67,-.03,.52,gold,[.92,1.05,.9]);
  // ushnisha
  sphere(buddha,0,3.17,-.02,.2,gold,[.85,1.15,.85]);
  // ears
  sphere(buddha,-.53,2.62,0,.16,gold,[.55,1.6,.55]);sphere(buddha,.53,2.62,0,.16,gold,[.55,1.6,.55]);
  // peaceful eyes/brows/nose/mouth
  const dark=mat("#6a421e");
  box(buddha,-.2,2.72,.45,.18,.035,.025,dark,false);box(buddha,.2,2.72,.45,.18,.035,.025,dark,false);
  sphere(buddha,0,2.57,.49,.055,gold,[.6,2,1]);
  const mouth=box(buddha,0,2.46,.47,.18,.025,.025,dark,false);
  // robe shoulders and folded legs
  sphere(buddha,0,1.35,.02,.8,gold,[1.45,.7,.8]);
  sphere(buddha,0,.92,.22,.82,gold,[1.35,.42,.95]);
  // halo
  const halo=torus(scene,0,5.15,-8.65,1.4,.12,gold);halo.rotation.x=0;
  torus(scene,0,5.15,-8.67,1.7,.035,mat("#f4d47d",.3,.4));
  // banners
  for(const x of [-4.1,4.1]){
    box(scene,x,5.1,-8.7,1.25,3.3,red);
    box(scene,x,6.8,-8.7,1.5,.13,gold);
    box(scene,x,3.45,-8.7,1.5,.13,gold);
    const text=x<0?"NAM MÔ\nA DI ĐÀ\nPHẬT":"THIỆN TÂM\nAN LẠC";
    makeCanvasSign(text,x,5.05,-8.05);
  }
  // offerings: incense burner, candles, vases, fruit
  cylinder(scene,0,2.02,-5.45,.56,.66,.58,gold,32);
  cylinder(scene,0,2.35,-5.45,.62,.55,.12,mat("#b57a2d",.35,.45),32);
  cylinder(scene,0,2.47,-5.45,.38,.42,.1,gold,32);
  for(let i=-3;i<=3;i++){const x=i*.11;const stick=cylinder(scene,x,2.95,-5.45,.018,.018,.88,mat("#58321d"),8);stick.rotation.z=(i*.025);}
  for(const x of [-2.6,2.6]){
    cylinder(scene,x,2.2,-5.7,.24,.38,.7,porcelain);
    cylinder(scene,x,2.58,-5.7,.18,.12,.08,gold);
    for(let j=0;j<5;j++){const f=sphere(scene,x+Math.cos(j*1.25)*.3,2.78+(j%2)*.13,-5.7+Math.sin(j*1.25)*.23,.19,mat(["#d65a38","#d7a33f","#7e9b4d"][j%3]));}
    for(let j=0;j<3;j++){const candle=cylinder(scene,x+(j-1)*.42,2.5,-6.4,.09,.11,.5,cream);cylinder(scene,candle.position.x,2.8,-6.4,.035,.02,.14,mat("#ffbd52"));}
  }
  // incense table legs
  for(const x of [-3.2,3.2])for(const z of [-6.2,-4.8])box(scene,x,1.1,z,.18,1.6,.18,wood);
  // hanging lanterns
  for(const x of [-7,-3.5,3.5,7]){
    cylinder(scene,x,7.6,-5,.025,.025,.8,gold,8);
    sphere(scene,x,7.05,-5,.42,mat("#d99b43"),[.8,1.1,.8]);
    cylinder(scene,x,6.6,-5,.32,.42,.13,gold);
    for(let k=-1;k<=1;k++)box(scene,x+k*.15,6.35,-5,.025,.45,.025,gold,false);
  }
  // bell and wooden mokugyo-like object
  const bellGroup=new THREE.Group();scene.add(bellGroup);bellGroup.position.set(7,3.6,-1.5);
  cylinder(bellGroup,0,0,0,.52,.38,1.25,gold,32);cylinder(bellGroup,0,.65,0,.08,.08,.16,wood,16);torus(bellGroup,0,-.62,0,.4,.08,gold);
  box(scene,6.1,4.4,-1.5,2.0,.18,.2,darkWood);box(scene,6.1,3.9,-1.5,.16,1.1,wood);box(scene,8.0,3.9,-1.5,.16,1.1,wood);
  // bonsai trees
  for(const x of [-8.1,8.1]){cylinder(scene,x,.4,-5,.65,.8,.7,porcelain);cylinder(scene,x,1.35,-5,.1,.15,1.4,wood);for(let i=0;i<7;i++)sphere(scene,x+(Math.random()-.5)*.9,2+(Math.random()*.9),-5+(Math.random()-.5)*.7,.55,jade,[1,1,.9]);}
  // donation box, visible to click
  const donation=new THREE.Group();scene.add(donation);donation.position.set(-7,0,-.3);donation.userData.kind="donation";
  box(donation,0,.55,0,1.05,1.05,.8,red);box(donation,0,1.12,0,1.12,.16,.88,gold);
  box(donation,0,.72,.415,.65,.25,.025,mat("#f5d58b"),false);
  makeCanvasSign("CÔNG ĐỨC",-7,1.35,.15);
  donation.traverse(o=>{if(o.isMesh)o.userData.kind="donation";});
  // cushions: 32 selectable places in two rows of 8 on each side
  for(const side of [-1,1])for(let row=0;row<2;row++)for(let i=0;i<8;i++){
    const x=side*(2.4+i*.75), z= row===0 ? -1.8 : 2.0;
    const cushion=new THREE.Group();scene.add(cushion);cushion.position.set(x,.08,z);cushion.userData={kind:"seat",seatId:`${side}_${row}_${i}`,occupied:false};
    const c=box(cushion,0,.12,0,.63,.22,.63,mat((i+row)%2?"#8e2f27":"#a43b2e"));c.userData=cushion.userData;
    const trim=box(cushion,0,.24,0,.48,.025,.48,gold,false);trim.userData=cushion.userData;
    torus(cushion,0,.27,0,.19,.025,gold);
  }
}
function makeCanvasSign(text,x,y,z){
 const c=document.createElement("canvas");c.width=512;c.height=256;const ctx=c.getContext("2d");
 ctx.fillStyle="#9b3026";ctx.fillRect(0,0,512,256);ctx.strokeStyle="#e4b85b";ctx.lineWidth=10;ctx.strokeRect(10,10,492,236);
 ctx.fillStyle="#ffdfa0";ctx.font="bold 43px serif";ctx.textAlign="center";ctx.textBaseline="middle";
 const lines=text.split("\n");lines.forEach((line,i)=>ctx.fillText(line,256,128+(i-(lines.length-1)/2)*55));
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.4),new THREE.MeshBasicMaterial({map:tex}));mesh.position.set(x,y,z);scene.add(mesh);
}
buildTemple();

function createAvatar({id,name,role="monk",x=0,z=4}){
 const g=new THREE.Group();g.position.set(x,0,z);g.userData={id,name,role,action:"idle",targetX:x,targetZ:z};
 const robe=mat(role==="nun"?"#b9b2a2":"#b8afa0"), skin=mat("#f4cda6"), face=mat("#3b281d"), white=mat("#fff6df"), blush=mat("#e99a86");
 // shadow marker
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.5,24),new THREE.MeshBasicMaterial({color:"#4e3826",transparent:true,opacity:.22}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;g.add(shadow);
 // body, robe skirt and head
 sphere(g,0,.78,0,.39,robe,[.9,1.15,.7]);
 const skirt=cylinder(g,0,.42,0,.47,.36,.65,robe,20);
 sphere(g,0,1.47,0,.43,skin,[.88,1,.8]);
 // ears
 sphere(g,-.39,1.48,0,.09,skin);sphere(g,.39,1.48,0,.09,skin);
 // shaved monk scalp or nun hair cap
 if(role==="nun"){sphere(g,0,1.67,-.04,.43,mat("#35251f"),[1.03,.75,.88]);sphere(g,-.34,1.52,.03,.17,mat("#35251f"));sphere(g,.34,1.52,.03,.17,mat("#35251f"));sphere(g,.35,1.83,.02,.1,mat("#d75e79"));}
 else {sphere(g,0,1.78,-.02,.39,skin,[1,.5,.9]);}
 // eyes, eyebrows, nose, smile, cheeks
 for(const side of [-1,1]){
   sphere(g,side*.16,1.51,.34,.09,white,[.78,1.15,.5]);
   sphere(g,side*.16,1.51,.385,.047,face,[.8,1.2,.5]);
   sphere(g,side*.14,1.54,.414,.016,white);
   box(g,side*.16,1.65,.32,.13,.025,.035,face,false);
   sphere(g,side*.25,1.38,.3,.07,blush,[1,.5,.25]);
 }
 sphere(g,0,1.44,.37,.045,skin,[.55,1,.5]);
 // arms and hands
 const arms=[];
 for(const side of [-1,1]){
   const arm=sphere(g,side*.42,.83,0,.14,robe,[.9,2.2,.85]);arm.rotation.z=side*-.35;arms.push(arm);
   sphere(g,side*.48,.48,.1,.13,skin,[.8,.8,.8]);
 }
 // legs and shoes
 for(const side of [-1,1]){sphere(g,side*.18,.18,.08,.2,robe,[.8,.7,1]);sphere(g,side*.19,.08,.19,.18,mat("#6b4534"),[1,.45,1]);}
 // nameplate sprite
 const labelCanvas=document.createElement("canvas");labelCanvas.width=512;labelCanvas.height=128;const ctx=labelCanvas.getContext("2d");
 ctx.fillStyle="rgba(65,35,23,.92)";roundRect(ctx,10,15,492,98,35);ctx.fill();
 ctx.strokeStyle="#e5c174";ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle="#fff0c9";ctx.font="bold 39px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(name.slice(0,18),256,64);
 const tex=new THREE.CanvasTexture(labelCanvas);tex.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.scale.set(1.7,.43,1);sprite.position.set(0,2.35,0);g.add(sprite);
 // bubble
 const bubble=new THREE.Group();bubble.position.set(0,2.85,0);g.add(bubble);bubble.visible=false;
 const bubbleCanvas=document.createElement("canvas");bubbleCanvas.width=512;bubbleCanvas.height=160;
 const bubbleTex=new THREE.CanvasTexture(bubbleCanvas);bubbleTex.colorSpace=THREE.SRGBColorSpace;
 const bubbleSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:bubbleTex,transparent:true,depthTest:false}));bubbleSprite.scale.set(2.2,.68,1);bubble.add(bubbleSprite);
 g.userData={...g.userData,arms,robe,skirt,bubble,bubbleCanvas,bubbleTex,bubbleSprite,shadow};
 scene.add(g);actors.set(id,g);return g;
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function bubbleText(g,text){
 const c=g.userData.bubbleCanvas,ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#fff9e9";roundRect(ctx,5,5,502,135,30);ctx.fill();ctx.strokeStyle="#d9b66f";ctx.lineWidth=5;ctx.stroke();ctx.fillStyle="#5b3825";ctx.font="bold 35px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
 let s=text;if(s.length>23)s=s.slice(0,22)+"…";ctx.fillText(s,256,72);g.userData.bubbleTex.needsUpdate=true;g.userData.bubble.visible=true;
 clearTimeout(g.userData.bubbleTimeout);g.userData.bubbleTimeout=setTimeout(()=>{if(g.userData.bubble)g.userData.bubble.visible=false;},4500);
}
function setAction(g,action){
 const d=g.userData;d.action=action;d.actionUntil=Date.now()+3000;
 if(action==="bow")bubbleText(g,"🙏 Nam mô A Di Đà Phật");
 if(action==="incense")bubbleText(g,"🪔 Thành tâm dâng hương");
 if(action==="meditate")bubbleText(g,"Tâm an, vạn sự an");
 if(action==="mallet")bubbleText(g,"Cốc… cốc…");
 if(action==="bell")bubbleText(g,"Boong…");
 if(action==="stand")bubbleText(g,"Con xin đứng lên");
 if(action==="incense"||action==="bow"||action==="mallet"||action==="bell")ritualSound(action);
}
function ritualSound(action){
 try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();
 const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.connect(gain);gain.connect(audioCtx.destination);
 osc.type=action==="bell"?"sine":"triangle";osc.frequency.value=action==="bell"?440:action==="mallet"?180:action==="bow"?330:520;
 gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.12,audioCtx.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+(action==="bell"?1.4:.22));osc.start();osc.stop(audioCtx.currentTime+(action==="bell"?1.5:.25));
 }catch(e){}
}
function animate(){
 requestAnimationFrame(animate);const t=performance.now()*.001;
 actors.forEach(g=>{
  const d=g.userData;const dx=d.targetX-g.position.x,dz=d.targetZ-g.position.z;
  if(Math.abs(dx)+Math.abs(dz)>.04){g.position.x+=dx*.09;g.position.z+=dz*.09;g.rotation.y=Math.atan2(dx,dz);d.walking=true;}
  else d.walking=false;
  const active=Date.now()< (d.actionUntil||0);
  d.robe.rotation.z=d.walking?Math.sin(t*10)*.045:0;
  d.arms.forEach((arm,i)=>{const side=i===0?-1:1;arm.rotation.z=side*-.35;arm.rotation.x=0;});
  if(d.action==="bow"&&active){g.rotation.x=.25+Math.sin(t*7)*.08;}
  else if(d.action==="meditate"&&active){g.position.y=.05+Math.sin(t*2)*.025;d.arms[0].rotation.z=-.8;d.arms[1].rotation.z=.8;}
  else if(d.action==="incense"&&active){d.arms[0].rotation.z=-.8;d.arms[1].rotation.z=.8;}
  else if(d.action==="mallet"&&active){d.arms[0].rotation.x=Math.sin(t*15)*.6;}
  else if(d.action==="bell"&&active){d.arms[1].rotation.x=Math.sin(t*12)*.6;}
  else {g.rotation.x*=.8;g.position.y*=.8;}
  if(d.bubble.visible)d.bubble.lookAt(camera.position);
 });
 renderer.render(scene,camera);
}
animate();
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(wrap);resize();

let raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),dragStart=null;
function intersectAt(ev){
 const rect=canvas.getBoundingClientRect();pointer.x=((ev.clientX-rect.left)/rect.width)*2-1;pointer.y=-((ev.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
 return raycaster.intersectObjects(scene.children,true);
}
canvas.addEventListener("pointerdown",e=>{dragStart={x:e.clientX,y:e.clientY};});
canvas.addEventListener("pointerup",e=>{
 if(!dragStart||Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>10){dragStart=null;return;}
 const hits=intersectAt(e);dragStart=null;
 for(const hit of hits){
  let o=hit.object;while(o&&!o.userData.kind&&o.parent)o=o.parent;
  if(o?.userData.kind==="donation"){openDonation();return;}
  if(o?.userData.kind==="seat"){moveTo(o.position.x,o.position.z);showToast("Bạn đã chọn một chỗ ngồi an lành.");return;}
  if(hit.point && hit.point.y<.7){moveTo(hit.point.x,hit.point.z);return;}
 }
});
function moveTo(x,z){
 const g=actors.get(myId);if(!g)return;
 const px=Math.max(-7.5,Math.min(7.5,x)),pz=Math.max(1.2,Math.min(9.5,z));
 g.userData.targetX=px;g.userData.targetZ=pz;g.userData.action="idle";
 socket.emit("move",{x:px,z:pz});socket.emit("action",{action:"stand"});
}
function showToast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.remove("show"),2400);}
function join(){
 myName=$("#nickname").value.trim().slice(0,18)||"Tâm An";
 $("#setup").classList.add("hidden");$("#profileName").textContent=myName;$("#profileRole").textContent=chosenRole==="nun"?"Tiểu Sư Cô · Đang an trú":"Tiểu Sư Phụ · Đang an trú";$("#profileAvatar").textContent=chosenRole==="nun"?"🧘🏻‍♀️":"🧘🏻‍♂️";
 socket.emit("joinTemple",{name:myName,role:chosenRole,x:(Math.random()-.5)*2,z:4+Math.random()*2});
}
$$(".role-choice").forEach(b=>b.addEventListener("click",()=>{$$(".role-choice").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");chosenRole=b.dataset.role;}));
$("#enter").addEventListener("click",join);$("#nickname").addEventListener("keydown",e=>{if(e.key==="Enter")join();});
socket.on("joined",data=>{
 myId=data.id;data.players.forEach(p=>{if(!actors.has(p.id))createAvatar(p);});
 $("#onlineCount").textContent=data.players.length;renderLeaderboard(data.leaderboard);
 const mine=actors.get(myId);if(mine){mine.userData.targetX=0;mine.userData.targetZ=3.5;}
});
socket.on("playerJoined",p=>{if(!actors.has(p.id))createAvatar(p);showToast(`${p.name} đã vào chánh điện.`);});
socket.on("playerLeft",p=>{const g=actors.get(p.id);if(g){scene.remove(g);actors.delete(p.id);}showToast(`${p.name} đã rời chùa.`);});
socket.on("presence",n=>$("#onlineCount").textContent=Math.min(n,32));
socket.on("playerMoved",p=>{const g=actors.get(p.id);if(g){g.userData.targetX=p.x;g.userData.targetZ=p.z;}});
socket.on("playerAction",p=>{const g=actors.get(p.id);if(g)setAction(g,p.action);if(p.id===myId&&p.points){myScore+=p.points;$("#myScore").innerHTML=`${myScore} <small>điểm</small>`;showToast(`Hoan hỷ! +${p.points} điểm công đức.`);}});
socket.on("chatMessage",m=>{
 const g=actors.get(m.id);if(g)bubbleText(g,m.text);
 const item=document.createElement("div");item.className="chat-item";const name=document.createElement("b");name.textContent=m.name;const msg=document.createElement("span");msg.textContent=m.text;const time=document.createElement("span");time.className="time";time.textContent=new Date(m.at).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});item.append(name,msg,time);$("#chatFeed").append(item);$("#chatFeed").scrollTop=$("#chatFeed").scrollHeight;$("#chatCount").textContent=$$("#chatFeed .chat-item").length;
});
socket.on("leaderboard",renderLeaderboard);
socket.on("donationNotice",d=>{showToast(`${d.name} vừa hoan hỷ công đức ${d.amount.toLocaleString("vi-VN")}đ · +${d.points} điểm`);addSystemMessage(`🪷 ${d.name} đã phát tâm công đức ${d.amount.toLocaleString("vi-VN")}đ.`);if(d.name===myName){myScore+=d.points;$("#myScore").innerHTML=`${myScore} <small>điểm</small>`;}});
function renderLeaderboard(rows){const el=$("#leaderboard");el.innerHTML="";if(!rows?.length){el.innerHTML='<div class="empty-rank">Hãy thực hành để ghi nhận công đức đầu tiên.</div>';return;}rows.forEach((r,i)=>{const row=document.createElement("div");row.className="rank-row";row.innerHTML=`<span class="rank-number">${i+1}</span><span class="rank-name"></span><span class="rank-score">${r.score} điểm</span>`;row.querySelector(".rank-name").textContent=r.name;el.append(row);});}
function addSystemMessage(text){const el=document.createElement("div");el.className="system-message";el.textContent=text;$("#chatFeed").append(el);$("#chatFeed").scrollTop=$("#chatFeed").scrollHeight;}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput");const text=input.value.trim();if(text){socket.emit("chat",{text});input.value="";}});
$$("[data-action]").forEach(b=>b.addEventListener("click",()=>{const action=b.dataset.action;if(!myId){showToast("Vui lòng vào chánh điện trước.");return;}socket.emit("action",{action});const g=actors.get(myId);if(g)setAction(g,action);}));
function openDonation(){$("#donateModal").classList.remove("hidden");}
$("#donateFab").addEventListener("click",openDonation);$("#closeDonate").addEventListener("click",()=>$("#donateModal").classList.add("hidden"));
$("#donateModal").addEventListener("click",e=>{if(e.target.id==="donateModal")$("#donateModal").classList.add("hidden");});
$$("[data-amount]").forEach(b=>b.addEventListener("click",()=>{$$("[data-amount]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selectedAmount=Number(b.dataset.amount);}));
$("#confirmDonate").addEventListener("click",()=>{if(!myId){showToast("Vui lòng vào chánh điện trước.");return;}socket.emit("donate",{amount:selectedAmount});$("#donateModal").classList.add("hidden");showToast("Hoan hỷ tâm lành của bạn.");});

$("#musicToggle").addEventListener("click",async()=>{
 musicOn=!musicOn;$("#musicToggle").setAttribute("aria-pressed",String(musicOn));$("#musicState").textContent=musicOn?"BẬT":"TẮT";
 if(musicOn){startAmbient();showToast("Đã bật âm thanh thiền mô phỏng.");}else{stopAmbient();}
});
$("#volume").addEventListener("input",()=>{if(musicOn)startAmbient();});
function startAmbient(){
 stopAmbient();try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();
 const volume=Number($("#volume").value)/100*.025;const notes=[261.63,329.63,392,523.25];let i=0;
 musicTimer=setInterval(()=>{if(!musicOn)return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type="sine";osc.frequency.value=notes[i++%notes.length];gain.gain.setValueAtTime(.0001,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),audioCtx.currentTime+.5);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+3);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+3);},1600);
 }catch(e){showToast("Trình duyệt chưa hỗ trợ âm thanh.");}
}
function stopAmbient(){if(musicTimer)clearInterval(musicTimer);musicTimer=null;}
$("#leave").addEventListener("click",()=>{socket.disconnect();location.reload();});
window.addEventListener("beforeunload",()=>socket.disconnect());
