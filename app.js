const APPS = {
 files:{title:"Fichiers",icon:"📁",open:filesApp},
 notes:{title:"Notes",icon:"📝",open:notesApp},
 calculator:{title:"Calculatrice",icon:"🧮",open:calculatorApp},
 terminal:{title:"Terminal",icon:"⌨️",open:terminalApp},
 browser:{title:"Web",icon:"🌐",open:browserApp},
 gaming:{title:"TrioGaming",icon:"🎮",open:gamingApp},
 settings:{title:"Réglages",icon:"⚙️",open:settingsApp}
};

const state={windows:new Map(),z:100,theme:localStorage.getItem("aos_theme")||"light",accent:localStorage.getItem("aos_accent")||"sky",notes:localStorage.getItem("alpha_notes")||""};
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
function openApp(id){
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
function closeWindow(id){const item=state.windows.get(id);if(!item)return;item.el.remove();state.windows.delete(id);renderTasks()}
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
 ta.addEventListener("input",()=>{state.notes=ta.value;localStorage.setItem("alpha_notes",state.notes);qs("#saved",body).textContent="Enregistré à "+new Date().toLocaleTimeString("fr-FR")});
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
 body.innerHTML=`<div class="terminal"><div class="terminal-output">AOS de TrioMégia Terminal v1.0<br>Bienvenue. Tape <b>help</b> pour voir les commandes.<br><br></div><div class="terminal-line"><span>alpha@os:~$</span><input autofocus autocomplete="off"></div></div>`;
 const out=qs(".terminal-output",body),input=qs("input",body);
 input.addEventListener("keydown",e=>{if(e.key!=="Enter")return;const cmd=input.value.trim();out.innerHTML+=`<span>alpha@os:~$ ${esc(cmd)}</span><br>`;let ans="";
   if(cmd==="help")ans="help  about  clear  date  echo [texte]  apps  neofetch";
   else if(cmd==="about")ans="AOS de TrioMégia — un système d'exploitation simulé dans ton navigateur.";
   else if(cmd==="date")ans=new Date().toString();
   else if(cmd==="apps")ans=Object.entries(APPS).map(([k,v])=>`${v.icon} ${k}`).join("  ");
   else if(cmd==="neofetch")ans="     α   AlphaOS\\n     Browser-based desktop\\n     Theme: "+state.theme;
   else if(cmd==="clear"){out.innerHTML="";input.value="";return}
   else if(cmd.startsWith("echo "))ans=cmd.slice(5);
   else if(cmd)ans=`Commande inconnue : ${cmd}`;
   out.innerHTML+=esc(ans)+"<br><br>";input.value="";out.scrollTop=out.scrollHeight;
 });
}

function browserApp(body){
 body.innerHTML=`<div class="browser"><div class="browser-bar"><button class="soft-btn" id="home">⌂</button><input value="https://alpharocket.github.io/"><button class="soft-btn" id="go">Aller</button></div><div class="browser-page" id="page"><h1>Alpha Browser</h1><p>Bienvenue dans le navigateur intégré d'AlphaOS.</p><p>Cette application est une simulation locale. Elle n'envoie pas automatiquement tes données à un service externe.</p></div></div>`;
 const input=qs("input",body),page=qs("#page",body);
 qs("#go",body).onclick=()=>{page.innerHTML=`<h1>🌐 ${esc(input.value)}</h1><p>Page de démonstration AlphaOS.</p><p>Tu peux remplacer cette application par une vraie interface de navigation si tu ajoutes ton propre backend/proxy.</p>`};
 qs("#home",body).onclick=()=>{input.value="alpha://home";page.innerHTML="<h1>Alpha Browser</h1><p>Accueil AlphaOS.</p>"};
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
<div class="setting-row"><div><b>Accent AOS</b><small>Personnalise le bleu ciel</small></div><div class="theme-buttons">${Object.keys(themes).map(t=>`<button class="theme-btn ${t}" data-accent="${t}" title="${t}"></button>`).join("")}</div></div><div class="setting-row"><div><b>Réinitialiser les notes</b><small>Supprime les notes locales</small></div><button class="soft-btn" id="clearNotes">Effacer</button></div><div class="about"><div style="font-size:55px">α</div><h2>AlphaOS</h2><p>AOS de TrioMégia • GitHub Pages Edition</p><p>Bleu ciel + blanc • Mode sombre jaune + noir</p></div></div>`;
 body.querySelectorAll("[data-accent]").forEach(b=>b.onclick=()=>{state.accent=b.dataset.accent;localStorage.setItem("aos_accent",state.accent);if(state.theme!=="dark")applyTheme(state.theme);toast("Accent AOS appliqué")});
 qs("#modeToggle",body).onclick=()=>{applyTheme(state.theme==="dark"?"light":"dark");settingsApp(body);toast("Mode "+(state.theme==="dark"?"sombre":"clair"))};
 qs("#clearNotes",body).onclick=()=>{localStorage.removeItem("alpha_notes");state.notes="";toast("Notes supprimées")};
}

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
