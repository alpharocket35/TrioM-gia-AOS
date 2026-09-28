const APPS = {
 files:{title:"Fichiers",icon:"📁",open:filesApp},
 notes:{title:"Notes",icon:"📝",open:notesApp},
 calculator:{title:"Calculatrice",icon:"🧮",open:calculatorApp},
 terminal:{title:"Terminal",icon:"⌨️",open:terminalApp},
 browser:{title:"Web",icon:"🌐",open:browserApp},
 gaming:{title:"TrioGaming",icon:"🎮",open:gamingApp},snake:{title:"Snake",icon:"🐍",open:snakeApp},game2048:{title:"2048",icon:"🔢",open:game2048App},memory:{title:"Memory",icon:"🧠",open:memoryApp},
 settings:{title:"Réglages",icon:"⚙️",open:settingsApp}
};

const state={windows:new Map(),z:100,theme:localStorage.getItem("aos_theme")||"light",accent:localStorage.getItem("aos_accent")||"sky",notes:localStorage.getItem("aos_notes")||""};
const desktop=document.querySelector("#desktop"), windows=document.querySelector("#windows"), taskButtons=document.querySelector("#taskButtons");

const themes={sky:"#38bdf8",blue:"#60a5fa",cyan:"#22d3ee",white:"#e0f2fe"};
function applyTheme(name){
 state.theme=name;localStorage.setItem("aos_theme",name);
 document.body.classList.toggle("dark-mode",name==="dark");
 if(name!=="dark"){document.documentElement.style.setProperty("--accent",themes[state.accent]||themes.sky);document.documentElement.style.setProperty("--accent2","#bae6fd")}
 else{document.documentElement.style.setProperty("--accent","#facc15");document.documentElement.style.setProperty("--accent2","#fde68a")}
}
applyTheme(state.theme);

function qs(s,p=document){return p.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function openApp(id){ audio.open();
  const app=APPS[id]; if(!app)return;
  if(state.windows.has(id)){focusWindow(id);return}
  const win=document.createElement("section"); win.className="window focused"; win.dataset.app=id;
  const offset=(state.windows.size%6)*28;
  win.style.left=`calc(50% - 350px + ${offset}px)`; win.style.top=`calc(50% - 240px + ${offset}px)`;
  win.innerHTML=`<div class="titlebar"><div class="window-title"><span>${app.icon}</span>${app.title}</div><div class="win-controls"><button class="min">—</button><button class="max">□</button><button class="close">×</button></div></div><div class="window-body"></div><i class="resize-handle"></i>`;
  windows.appendChild(win); state.windows.set(id,{el:win,min:false,max:false,restore:null}); focusWindow(id);
  app.open(qs(".window-body",win),id);
  setupWindow(win,id);
}
function focusWindow(id){const item=state.windows.get(id);if(!item)return;state.z++;item.el.style.zIndex=state.z;document.querySelectorAll(".window").forEach(x=>x.classList.remove("focused"));item.el.classList.add("focused");renderTasks()}
function closeWindow(id){ audio.close();const item=state.windows.get(id);if(!item)return;item.el.remove();state.windows.delete(id);renderTasks()}
function minimizeWindow(id){const item=state.windows.get(id);if(!item)return;item.min=true;item.el.style.display="none";renderTasks()}
function maximizeWindow(id){
 const item=state.windows.get(id); if(!item)return;
 if(!item.max){item.restore={left:item.el.style.left,top:item.el.style.top,width:item.el.style.width,height:item.el.style.height};item.el.style.left="0";item.el.style.top="0";item.el.style.width="100%";item.el.style.height="calc(100% - 62px)";item.max=true}
 else{Object.assign(item.el.style,item.restore);item.max=false}
 focusWindow(id);
}
function renderTasks(){
 taskButtons.innerHTML="";
 state.windows.forEach((item,id)=>{const b=document.createElement("button");b.className="task-btn"+(item.min?"":" active");b.textContent=APPS[id].icon+" "+APPS[id].title;b.onclick=()=>{item.min?(item.min=false,item.el.style.display="flex",focusWindow(id)):focusWindow(id)};taskButtons.appendChild(b)})
}
function setupWindow(win,id){
 qs(".close",win).onclick=e=>{e.stopPropagation();closeWindow(id)};
 qs(".min",win).onclick=e=>{e.stopPropagation();minimizeWindow(id)};
 qs(".max",win).onclick=e=>{e.stopPropagation();maximizeWindow(id)};
 win.addEventListener("mousedown",()=>focusWindow(id));
 let drag=null;
 const bar=qs(".titlebar",win);
 bar.addEventListener("mousedown",e=>{
   if(e.target.closest(".win-controls")||state.windows.get(id).max)return;
   const r=win.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};
   const move=ev=>{win.style.left=Math.max(0,ev.clientX-drag.x)+"px";win.style.top=Math.max(0,ev.clientY-drag.y)+"px"};
   const up=()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up)};
   window.addEventListener("mousemove",move);window.addEventListener("mouseup",up);
 });
 let resizing=false;
 qs(".resize-handle",win).addEventListener("mousedown",e=>{
   e.preventDefault();resizing=true;const r=win.getBoundingClientRect(), sx=e.clientX, sy=e.clientY, sw=r.width, sh=r.height;
   const move=ev=>{win.style.width=Math.max(320,sw+ev.clientX-sx)+"px";win.style.height=Math.max(230,sh+ev.clientY-sy)+"px"};
   const up=()=>{resizing=false;window.removeEventListener("mousemove",move);window.removeEventListener("mouseup",up)};
   window.addEventListener("mousemove",move);window.addEventListener("mouseup",up);
 });
}

function filesApp(body){
 body.innerHTML=`<div class="files-app"><div class="files-toolbar"><button class="soft-btn" id="newFolder">📁 Nouveau dossier</button><button class="soft-btn" id="newText">📄 Nouveau fichier</button></div><div class="file-grid" id="fileGrid"></div></div>`;
 const grid=qs("#fileGrid",body);
 const virtualFiles=[["📁","Projets"],["📁","Images"],["📁","Documents"],["📄","Bienvenue.txt"],["📄","README.md"]];
 virtualFiles.forEach(([icon,name])=>{const d=document.createElement("div");d.className="file-card";d.innerHTML=`<span class="big">${icon}</span><small>${name}</small>`;grid.appendChild(d)});
 qs("#newFolder",body).onclick=()=>{const n=prompt("Nom du dossier ?");if(n){const d=document.createElement("div");d.className="file-card";d.innerHTML=`<span class="big">📁</span><small>${esc(n)}</small>`;grid.prepend(d)}};
 qs("#newText",body).onclick=()=>openApp("notes");
}

function notesApp(body){
 body.innerHTML=`<div class="notes-app"><textarea placeholder="Écris tes notes ici..."></textarea><div class="notes-bottom">Sauvegarde automatique dans ce navigateur • <span id="saved">Enregistré</span></div></div>`;
 const ta=qs("textarea",body);ta.value=state.notes;
 ta.addEventListener("input",()=>{state.notes=ta.value;localStorage.setItem("aos_notes",state.notes);qs("#saved",body).textContent="Enregistré à "+new Date().toLocaleTimeString("fr-FR")});
}

function calculatorApp(body){
 body.innerHTML=`<div class="calc"><input class="calc-display" value="0" readonly><div class="calc-grid">${["C","⌫","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","="].map((x,i)=>`<button class="${["÷","×","−","+"].includes(x)?"op":""}" data-v="${x}">${x}</button>`).join("")}</div></div>`;
 const display=qs(".calc-display",body);let expr="";
 body.querySelectorAll("button").forEach(b=>b.onclick=()=>{
   const v=b.dataset.v;
   if(v==="C"){expr="";display.value="0";return}
   if(v==="⌫"){expr=expr.slice(0,-1);display.value=expr||"0";return}
   if(v==="="){try{const safe=expr.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replace(/[^0-9+\-*/%.() ]/g,"");expr=String(Function("return "+safe)());display.value=expr}catch{display.value="Erreur";expr=""}return}
   expr+=v;display.value=expr;
 });
}

function terminalApp(body){
 body.innerHTML=`<div class="terminal"><div class="terminal-output">AOS de TrioMégia Terminal v1.0<br>Bienvenue Admin. Tape <b>help</b> pour voir les commandes.<br><br></div><div class="terminal-line"><span>Admin@aos:~$</span><input autofocus autocomplete="off"></div></div>`;
 const out=qs(".terminal-output",body),input=qs("input",body);
 input.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const cmd=input.value.trim();out.innerHTML+=`<span>Admin@aos:~$ ${esc(cmd)}</span><br>`;let ans="";
   if(cmd==="help")ans="help  about  clear  date  echo [texte]  apps  neofetch";
   else if(cmd==="about")ans="AOS de TrioMégia — un système d'exploitation simulé dans ton navigateur.";
   else if(cmd==="date")ans=new Date().toString();
   else if(cmd==="apps")ans=Object.entries(APPS).map(([k,v])=>`${v.icon} ${k}`).join("  ");
   else if(cmd==="neofetch")ans="     α   AOS de TrioMégia\\n     Browser-based desktop\\n     Theme: "+state.theme;
   else if(cmd==="clear"){out.innerHTML="";input.value="";return}
   else if(cmd.startsWith("echo "))ans=cmd.slice(5);
   else if(cmd)ans=`Commande inconnue : ${cmd}`;
   out.innerHTML+=esc(ans)+"<br><br>";input.value="";out.scrollTop=out.scrollHeight;
 });
}

function browserApp(body){
 body.innerHTML=`<div class="browser"><div class="browser-bar"><button class="soft-btn" id="home">⌂</button><input value="https://trio-megia.github.io/"><button class="soft-btn" id="go">Aller</button></div><div class="browser-page" id="page"><h1>Trio Browser</h1><p>Bienvenue dans le navigateur intégré d'AOS de TrioMégia.</p><p>Cette application est une simulation locale. Elle n'envoie pas automatiquement tes données à un service externe.</p></div></div>`;
 const input=qs("input",body),page=qs("#page",body);
 qs("#go",body).onclick=()=>{page.innerHTML=`<h1>🌐 ${esc(input.value)}</h1><p>Page de démonstration AOS de TrioMégia.</p><p>Tu peux remplacer cette application par une vraie interface de navigation si tu ajoutes ton propre backend/proxy.</p>`};
 qs("#home",body).onclick=()=>{input.value="aos://home";page.innerHTML="<h1>Trio Browser</h1><p>Accueil AOS de TrioMégia.</p>"};
}


function gamingApp(body){
 body.innerHTML=`<div class="trio-gaming">
 <div class="gaming-head"><div><div class="gaming-logo">🎮 TrioGaming</div><div class="gaming-sub">Le portail jeux de AOS de TrioMégia</div></div><div class="gaming-badge">ORANGE / BLACK</div></div>
 <div class="game-grid">
  <button class="game-tile" data-game="snake"><div class="game-icon">🐍</div><h3>Snake</h3><p>Petit classique à lancer</p></button>
  <button class="game-tile" data-game="2048"><div class="game-icon">🔢</div><h3>2048</h3><p>Assemble les nombres</p></button>
  <button class="game-tile" data-game="memory"><div class="game-icon">🧠</div><h3>Memory</h3><p>Teste ta mémoire</p></button>
  <button class="game-tile" data-game="coming"><div class="game-icon">🚀</div><h3>TrioGame Lab</h3><p>De nouveaux jeux arrivent</p></button>
 </div></div>`;
 body.querySelectorAll("[data-game]").forEach(b=>b.onclick=()=>{
   const game=b.dataset.game;
   if(game==="coming") toast("TrioGame Lab : bientôt disponible !");
   else if(game==="snake") toast("Snake : module prêt à accueillir le jeu HTML5.");
   else if(game==="2048") toast("2048 : module prêt à accueillir le jeu HTML5.");
   else toast("Memory : module prêt à accueillir le jeu HTML5.");
 });
}

function settingsApp(body){
 body.innerHTML=`<div class="settings"><h2>Réglages</h2><div class="setting-row"><div><b>Mode clair / sombre</b><small>Clair : bleu ciel et blanc • Sombre : jaune et noir</small></div><button class="soft-btn" id="modeToggle">${state.theme==="dark"?"☀️ Mode clair":"🌙 Mode sombre"}</button></div>
<div class="setting-row"><div><b>Accent AOS</b><small>Personnalise le bleu ciel</small></div><div class="theme-buttons">${Object.keys(themes).map(t=>`<button class="theme-btn ${t}" data-accent="${t}" title="${t}"></button>`).join("")}</div></div><div class="setting-row"><div><b>Réinitialiser les notes</b><small>Supprime les notes locales</small></div><button class="soft-btn" id="clearNotes">Effacer</button></div><div class="about"><div style="font-size:55px">TM</div><h2>AOS de TrioMégia</h2><p>AOS de TrioMégia • GitHub Pages Edition</p><p>Bleu ciel + blanc • Mode sombre jaune + noir</p></div></div>`;
 body.querySelectorAll("[data-accent]").forEach(b=>b.onclick=()=>{state.accent=b.dataset.accent;localStorage.setItem("aos_accent",state.accent);if(state.theme!=="dark")applyTheme(state.theme);toast("Accent AOS appliqué")});
 qs("#modeToggle",body).onclick=()=>{applyTheme(state.theme==="dark"?"light":"dark");settingsApp(body);toast("Mode "+(state.theme==="dark"?"sombre":"clair"))};
 qs("#clearNotes",body).onclick=()=>{localStorage.removeItem("aos_notes");state.notes="";toast("Notes supprimées")};
}

const audio={ctx:null,enabled:localStorage.getItem("aos_sound")!=="off",ensure(){if(!this.enabled)return null;if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==="suspended")this.ctx.resume();return this.ctx},beep(freq=440,dur=.07,type="sine",gain=.035){const c=this.ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)},click(){this.beep(520,.05,"triangle",.025)},open(){this.beep(660,.08,"sine",.03);setTimeout(()=>this.beep(880,.08,"sine",.025),55)},close(){this.beep(300,.08,"triangle",.025)},success(){this.beep(660,.08);setTimeout(()=>this.beep(880,.1),70)},error(){this.beep(180,.13,"sawtooth",.02)}};
function playGame(game){
 audio.open();
 if(game==="snake") return openApp("snake");
 if(game==="2048") return openApp("game2048");
 if(game==="memory") return openApp("memory");
 toast("TrioGame Lab arrive bientôt !");
}
function snakeApp(body){body.innerHTML=`<div class="mini-game"><h2>🐍 Snake</h2><canvas id="snakeCanvas" width="420" height="320"></canvas><p>Flèches ou ZQSD • Espace pour recommencer</p></div>`;const c=qs("#snakeCanvas",body),x=c.getContext("2d");let dir={x:1,y:0},snake=[{x:10,y:10}],food={x:15,y:8},score=0,run=true;const reset=()=>{snake=[{x:10,y:10}];food={x:15,y:8};dir={x:1,y:0};score=0;run=true};const tick=()=>{if(!run)return;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=21||h.y>=16||snake.some(q=>q.x===h.x&&q.y===h.y)){run=false;audio.error();return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;audio.success();do{food={x:Math.floor(Math.random()*21),y:Math.floor(Math.random()*16)}}while(snake.some(q=>q.x===food.x&&q.y===food.y))}else snake.pop();x.clearRect(0,0,c.width,c.height);x.fillStyle="#111";x.fillRect(0,0,c.width,c.height);x.fillStyle="var(--accent,#38bdf8)";snake.forEach(q=>x.fillRect(q.x*20+1,q.y*20+1,18,18));x.fillStyle="#ff7a00";x.fillRect(food.x*20+2,food.y*20+2,16,16);x.fillStyle="#fff";x.fillText("Score: "+score,8,312)};document.onkeydown=e=>{const k=e.key.toLowerCase();if(k==="arrowup"||k==="z")dir={x:0,y:-1};if(k==="arrowdown"||k==="s")dir={x:0,y:1};if(k==="arrowleft"||k==="q")dir={x:-1,y:0};if(k==="arrowright"||k==="d")dir={x:1,y:0};if(k===" "){reset();tick()}};tick();setInterval(tick,110)}
function game2048App(body){body.innerHTML=`<div class="mini-game"><h2>🔢 2048</h2><div id="g2048" class="board2048"></div><p>Flèches ou ZQSD</p></div>`;let a=Array(16).fill(0);const el=qs("#g2048",body);function draw(){el.innerHTML=a.map(v=>`<div class="tile t${v}">${v||""}</div>`).join("")}function add(){let z=a.map((v,i)=>v?null:i).filter(i=>i!==null);if(z.length)a[z[Math.floor(Math.random()*z.length)]]=Math.random()<.9?2:4}function move(d){let old=a.join();for(let r=0;r<4;r++){let line=d<2?a.slice(r*4,r*4+4):[a[r],a[r+4],a[r+8],a[r+12]];if(d===1||d===3)line.reverse();line=line.filter(Boolean);for(let i=0;i<line.length-1;i++)if(line[i]===line[i+1]){line[i]*=2;line.splice(i+1,1);audio.success()}while(line.length<4)line.push(0);if(d===1||d===3)line.reverse();if(d<2)for(let i=0;i<4;i++)a[r*4+i]=line[i];else for(let i=0;i<4;i++)a[r+4*i]=line[i]}if(old!==a.join()){add();draw()}else audio.error()}a[0]=2;add();add();draw();document.onkeydown=e=>{let k=e.key.toLowerCase();if(["arrowleft","q"].includes(k))move(0);if(["arrowright","d"].includes(k))move(1);if(["arrowup","z"].includes(k))move(2);if(["arrowdown","s"].includes(k))move(3)}}
function memoryApp(body){const vals=["🍕","🚀","🎮","🐱","🔥","⚡","🎧","🌟"];let deck=[...vals,...vals].sort(()=>Math.random()-.5),open=[];body.innerHTML=`<div class="mini-game"><h2>🧠 Memory</h2><div id="memory" class="memory-grid"></div></div>`;const g=qs("#memory",body);deck.forEach((v,i)=>{const b=document.createElement("button");b.className="memory-card";b.textContent="?";b.onclick=()=>{if(open.length===2||b.dataset.done)return;b.textContent=v;open.push([i,b]);audio.click();if(open.length===2){if(deck[open[0][0]]===deck[open[1][0]]){open.forEach(x=>x[1].dataset.done="1");open=[];audio.success()}else setTimeout(()=>{open.forEach(x=>x[1].textContent="?");open=[]},650)}};g.appendChild(b)})}
function toast(msg){const d=document.createElement("div");d.textContent=msg;d.style.cssText="position:fixed;z-index:30000;right:20px;bottom:80px;background:#111827ee;color:white;padding:12px 16px;border:1px solid #ffffff22;border-radius:10px;box-shadow:0 10px 30px #0005";document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}

document.querySelectorAll(".desktop-icon").forEach(b=>b.onclick=()=>openApp(b.dataset.app));
document.querySelector("#startBtn").onclick=()=>document.querySelector("#startMenu").classList.toggle("hidden");
document.querySelector("#clockBtn").onclick=()=>openApp("settings");
document.querySelector("#lockBtn").onclick=()=>{document.querySelector("#startMenu").classList.add("hidden");document.querySelector("#lockScreen").classList.remove("hidden")};
document.querySelector("#themeToggle").onclick=()=>{
  applyTheme(state.theme==="dark"?"light":"dark");
  document.querySelector("#startMenu").classList.add("hidden");
  toast("Mode "+(state.theme==="dark"?"sombre jaune/noir":"clair bleu ciel/blanc"));
};
document.querySelector("#unlockBtn").onclick=()=>document.querySelector("#lockScreen").classList.add("hidden");

document.querySelector("#desktop").addEventListener("contextmenu",e=>{
 if(e.target.closest(".window,.taskbar,.start-menu"))return;
 e.preventDefault();const m=document.querySelector("#contextMenu");m.style.left=Math.min(e.clientX,innerWidth-200)+"px";m.style.top=Math.min(e.clientY,innerHeight-170)+"px";m.classList.remove("hidden")
});
document.addEventListener("click",e=>{
 if(!e.target.closest("#contextMenu"))document.querySelector("#contextMenu").classList.add("hidden");
});
document.querySelector("#contextMenu").addEventListener("click",e=>{
 const a=e.target.closest("button")?.dataset.action;if(a==="newnote")openApp("notes");if(a==="settings")openApp("settings");if(a==="refresh")location.reload();
});
const appList=document.querySelector("#appList");
Object.entries(APPS).forEach(([id,a])=>{const b=document.createElement("button");b.className="app-item";b.dataset.id=id;b.innerHTML=`<span>${a.icon}</span><div><b>${a.title}</b><small>Ouvrir l'application</small></div>`;b.onclick=()=>{openApp(id);document.querySelector("#startMenu").classList.add("hidden")};appList.appendChild(b)});
document.querySelector("#appSearch").addEventListener("input",e=>{const q=e.target.value.toLowerCase();appList.querySelectorAll(".app-item").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?"flex":"none")});

function updateClock(){
 const now=new Date(),time=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),date=now.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});
 document.querySelector("#clockBtn").innerHTML=`${time}<br><small>${date}</small>`;
 document.querySelector("#startTime").textContent=now.toLocaleTimeString("fr-FR");
 document.querySelector("#lockClock").textContent=now.toLocaleString("fr-FR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
}
updateClock();setInterval(updateClock,1000);

setTimeout(()=>{document.querySelector("#boot").classList.add("hidden");desktop.classList.remove("hidden")},1700);
