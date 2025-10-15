
const COGNITO_DOMAIN = "*******";
const CLIENT_ID      = "*********";
const REDIRECT_URI   = "***********";
const API_BASE       = "**************";


const $ = (s)=>document.querySelector(s);
const outNotes     = $('#listNotes');
const outExpenses  = $('#listExpenses');
const statusDot    = $('#status');
const btnLogin     = $('#btnLogin');
const btnLogout    = $('#btnLogout');


const loginUrl  = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=token&scope=openid&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${encodeURIComponent(CLIENT_ID)}&logout_uri=${encodeURIComponent(REDIRECT_URI)}`;


function getHashParams(){ const h=window.location.hash.substring(1); return Object.fromEntries(new URLSearchParams(h)); }
function saveTokensFromHash(){
  const p=getHashParams();
  if (p.id_token)     localStorage.setItem("id_token", p.id_token);
  if (p.access_token) localStorage.setItem("access_token", p.access_token);
  if (p.expires_in)   localStorage.setItem("expires_in", p.expires_in);
  if (window.location.hash) history.replaceState({}, document.title, window.location.pathname);
}

const getToken = ()=> localStorage.getItem("access_token");


function setStatus(){
  const has=!!getToken();
  statusDot.textContent = has ? "Connecté" : "Hors ligne";
  statusDot.className   = "badge " + (has ? "ok" : "warn");
  btnLogin.style.display  = has ? "none"        : "inline-block";
  btnLogout.style.display = has ? "inline-block": "none";
}


function stripHtml(s){ return (s||"").replace(/[<>&]/g,""); }
async function call(method, path, body){
  const token=getToken();
  const target = path.startsWith('/notes') ? outNotes : outExpenses;
  if(!token){ target.innerHTML = "<div class='hint'>Pas de token : connectez-vous.</div>"; setStatus(); return {ok:false}; }

  const spinner=document.createElement('span'); spinner.className='spinner'; target.before(spinner);
  try{
    const res=await fetch(API_BASE+path,{
      method,
      headers:{ "content-type":"application/json", "Authorization":"Bearer "+token },
      body: body ? JSON.stringify(body) : undefined
    });
    const text=await res.text();
    let data; try{ data=JSON.parse(text); } catch{ data={raw:text}; }

    if(!res.ok){
      target.innerHTML = `<div class='hint'>Erreur ${res.status} — ${stripHtml(text)||'appel échoué'}</div>`;
    }
    return { ok: res.ok, status: res.status, data };
  }catch(e){
    target.innerHTML = `<div class='hint'>Erreur réseau — ${stripHtml(e.message)}</div>`;
    return { ok:false, status:0, data:null };
  }finally{
    spinner.remove(); setStatus();
  }
}


function escapeHtml(s){ return (s??"").toString().replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function renderNotes(arr){
  outNotes.innerHTML = arr?.length ? arr.map(n=>`
    <div class="item" data-type="note" data-id="${escapeHtml(n.noteId)}">
      <h4><span>${escapeHtml(n.title)}</span>
        <button class="btn danger btn-del" title="Supprimer">Supprimer</button></h4>
      <div>${escapeHtml(n.body||"")}</div>
      <div class="meta">${escapeHtml(n.createdAt||"")}</div>
    </div>`).join("") : "<div class='hint'>Aucune note.</div>";
}
function renderExpenses(arr){
  outExpenses.innerHTML = arr?.length ? arr.map(e=>`
    <div class="item" data-type="expense" data-id="${escapeHtml(e.expenseId)}">
      <h4><span>${escapeHtml(e.category||'?')} – ${escapeHtml(e.amount)} ${escapeHtml(e.currency||'')}</span>
        <button class="btn danger btn-del" title="Supprimer">Supprimer</button></h4>
      <div>${escapeHtml(e.note||"")}</div>
      <div class="meta">${escapeHtml(e.date||"")}</div>
    </div>`).join("") : "<div class='hint'>Aucune dépense.</div>";
}


outNotes.addEventListener('click', async (e)=>{
  const btn=e.target.closest('.btn-del'); if(!btn) return;
  const item=btn.closest('.item'); const id=item?.dataset.id;
  if(!id) return; if(!confirm("Supprimer cette note ?")) return;
  const r=await call('DELETE', `/notes/${encodeURIComponent(id)}`);
  if(r.ok){ item.remove(); }
});
outExpenses.addEventListener('click', async (e)=>{
  const btn=e.target.closest('.btn-del'); if(!btn) return;
  const item=btn.closest('.item'); const id=item?.dataset.id;
  if(!id) return; if(!confirm("Supprimer cette dépense ?")) return;
  const r=await call('DELETE', `/expenses/${encodeURIComponent(id)}`);
  if(r.ok){ item.remove(); }
});


$('#formNote').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title=$('#noteTitle').value.trim();
  const body=$('#noteBody').value.trim();
  if(!title){ alert('Titre requis'); return; }
  const r=await call('POST','/notes',{title, body});
  if(r.ok) $('#btnListNotes').click();
  e.target.reset();
});
$('#formExpense').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const amount=parseFloat($('#expAmount').value);
  if(Number.isNaN(amount)){ alert('Montant invalide'); return; }
  const currency=($('#expCurrency').value||'USD').toUpperCase();
  const category=$('#expCategory').value||'uncategorized';
  const note=$('#expNote').value||'';
  const date=$('#expDate').value||new Date().toISOString().slice(0,10);
  const r=await call('POST','/expenses',{amount,currency,category,note,date});
  if(r.ok) $('#btnListExpenses').click();
  e.target.reset();
});


function clearAllTokens(){
  try{
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_in');
  }catch{}
}
btnLogin.onclick  = ()=> location.href = loginUrl;
btnLogout.onclick = ()=>{

  clearAllTokens();
  setStatus();
  
  location.href = logoutUrl;
};


function init(){
  saveTokensFromHash(); 
  setStatus();          
}
init();


if (getToken()) {
  document.getElementById('btnListNotes').click();
  document.getElementById('btnListExpenses').click();
}


document.getElementById('btnListNotes').onclick    = async()=>{ const r=await call('GET','/notes');    if(r.ok) renderNotes(r.data.items||[]); };
document.getElementById('btnListExpenses').onclick = async()=>{ const r=await call('GET','/expenses'); if(r.ok) renderExpenses(r.data.items||[]); };