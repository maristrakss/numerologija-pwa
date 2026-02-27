function setStatus(message,type){const el=document.getElementById('status');el.textContent=message||'';el.className='status'+(type?' '+type:'')}
function setLoading(loading){const btn=document.getElementById('calcBtn');btn.disabled=loading;btn.textContent=loading?'Aprēķina...':'Aprēķināt'}
function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function isoToLv(iso){if(!iso||!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';const[y,m,d]=iso.split('-');return `${d}.${m}.${y}`}
function collectData(){return{firstName:document.getElementById('firstName').value.trim(),lastName:document.getElementById('lastName').value.trim(),fatherName:document.getElementById('fatherName').value.trim(),birthDate:document.getElementById('birthDate').value.trim(),analysisDate:document.getElementById('analysisDate').value.trim()}}
function setTodayToAnalysisDate(){const el=document.getElementById('analysisDate');if(el.value) return;const today=new Date();const yyyy=today.getFullYear();const mm=String(today.getMonth()+1).padStart(2,'0');const dd=String(today.getDate()).padStart(2,'0');el.value=`${yyyy}-${mm}-${dd}`}
function renderSeqGroup(title,keys,seq){return `<div class='seq-group'><div class='seq-group-title'>${escapeHtml(title)}</div><div class='external-seq'>${keys.map(key=>`<div class='seq-card'><div class='seq-key'>${escapeHtml(key)}</div><div class='seq-val'>${escapeHtml(seq[key]??'–')}</div></div>`).join('')}</div></div>`}
function renderExplainCards(items){return `<div class='explain-grid'>${items.map(item=>`<div class='explain-card'><div class='explain-head'><div class='explain-title'>${escapeHtml(item.title)}</div><div class='explain-value'>${escapeHtml(item.value)}</div></div><div class='explain-text'>${escapeHtml(item.text)}</div></div>`).join('')}</div>`}
function renderResults(result){
  const root=document.getElementById('results');
  if(!result||!result.matrix||!result.outer){root.innerHTML='<div class="placeholder">Nav rezultātu.</div>';return;}
  const m=result.matrix, outer=result.outer.matrix, seq=result.outer.numbers.sequence, cellExpl=(result.explanations&&result.explanations.cells)||[], lineExpl=(result.explanations&&result.explanations.lines)||[];
  root.innerHTML=`<div class='cards'>
      <div class='stat-card'><div class='stat-title'>Personiskais gada skaitlis</div><div class='stat-value'>${escapeHtml(result.personalYear)}</div></div>
      <div class='stat-card'><div class='stat-title'>Personiskais mēneša skaitlis</div><div class='stat-value'>${escapeHtml(result.personalMonth)}</div></div>
      <div class='stat-card'><div class='stat-title'>Personiskais dienas skaitlis</div><div class='stat-value'>${escapeHtml(result.personalDay)}</div></div>
    </div>
    <div class='report'>
      <div class='report-name'>${escapeHtml(result.fullName||'')}</div>
      <div class='report-sub'>${escapeHtml(result.birthDateDisplay||isoToLv(result.birthDate)||'')} – izpētes datums ${escapeHtml(result.analysisDateDisplay||isoToLv(result.analysisDate)||'')}</div>
      <div class='meta-row'>Alfabēta režīms: ${escapeHtml(result.alphabet==='RU'?'RU':'LATIN')} ${result.fatherName?'– tēva vārds iekļauts':'– tēva vārds nav ievadīts'}</div>
      <div class='matrix-shell'>
        <h3 class='section-title'>Iekšējā matrica</h3>
        <div class='matrix-row'>
          <div class='matrix-grid'>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c1)}</div><div class='label'>raksturs</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c2)}</div><div class='label'>veselība</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c3)}</div><div class='label'>veiksme</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c4)}</div><div class='label'>enerģija</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c5)}</div><div class='label'>loģika</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c6)}</div><div class='label'>pienākums</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c7)}</div><div class='label'>intereses</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c8)}</div><div class='label'>darbs</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.cells.c9)}</div><div class='label'>atmiņa</div></div>
          </div>
          <div class='side-grid'>
            <div class='cell'><div class='value'>${escapeHtml(m.lines.purpose)}</div><div class='label'>mērķis</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.lines.family)}</div><div class='label'>ģimene</div></div>
            <div class='cell'><div class='value'>${escapeHtml(m.lines.habits)}</div><div class='label'>ieradumi</div></div>
          </div>
        </div>
        <div class='bottom-grid'>
          <div class='cell'><div class='value'>${escapeHtml(m.lines.selfEsteem)}</div><div class='label'>pašvērtējums</div></div>
          <div class='cell'><div class='value'>${escapeHtml(m.lines.work)}</div><div class='label'>darbs</div></div>
          <div class='cell'><div class='value'>${escapeHtml(m.lines.talent)}</div><div class='label'>talants</div></div>
          <div class='cell'><div class='value'>${escapeHtml(m.lines.spirit)} / ${escapeHtml(m.lines.temperament)}</div><div class='label'>gars / temperaments</div></div>
        </div>
        <div class='work-numbers'>Darba skaitļi: ${escapeHtml(m.aux.s1)} / ${escapeHtml(m.aux.s2)} / ${escapeHtml(m.aux.s3)} / ${escapeHtml(m.aux.s4)}</div>
      </div>
    </div>
    <div class='report'><div class='outer-block'><div class='outer-header'><h3 class='outer-title'>Ārējā matrica</h3><p class='outer-subtitle'>Veidota no ārējo skaitļu virknes I–XIV, balstoties uz vārda, uzvārda, tēva vārda un dzīves ceļa skaitļu kombināciju.</p></div>
      <div class='outer-layout'><div class='outer-side'><div class='matrix-shell'><div class='outer-grid'>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c1)}</div><div class='label'>1</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c2)}</div><div class='label'>4</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c3)}</div><div class='label'>7</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c4)}</div><div class='label'>2</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c5)}</div><div class='label'>5</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c6)}</div><div class='label'>8</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c7)}</div><div class='label'>3</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c8)}</div><div class='label'>6</div></div>
        <div class='cell'><div class='value'>${escapeHtml(outer.cells.c9)}</div><div class='label'>9</div></div>
      </div><div class='meta-row'>Dzīves ceļš: ${escapeHtml(result.lifePath)} – Liktenis: ${escapeHtml(result.destiny)} – Brieduma skaitlis: ${escapeHtml(result.maturity)}</div></div></div>
      <div class='outer-seq-wrap'>${renderSeqGroup('Pamatvirkne',['I','II','III','IV','V','VI'],seq)}${renderSeqGroup('Savienojumi',['VII','VIII','IX','X','XI'],seq)}${renderSeqGroup('Tēva vārda grupa',['XII','XIII','XIV'],seq)}</div></div></div></div>
    <div class='report'><h3 class='section-title'>Šūnu skaidrojums</h3>${renderExplainCards(cellExpl)}</div>
    <div class='report'><h3 class='section-title'>Līniju un diagonāļu skaidrojums</h3>${renderExplainCards(lineExpl)}</div>`;
}
function saveFormData(data){
  localStorage.setItem('numerologija:lastForm', JSON.stringify(data));
}
function loadFormData(){
  try{
    const raw = localStorage.getItem('numerologija:lastForm');
    if(!raw) return;
    const data = JSON.parse(raw);
    if(data.firstName) document.getElementById('firstName').value = data.firstName;
    if(data.lastName) document.getElementById('lastName').value = data.lastName;
    if(data.fatherName) document.getElementById('fatherName').value = data.fatherName;
    if(data.birthDate) document.getElementById('birthDate').value = data.birthDate;
    if(data.analysisDate) document.getElementById('analysisDate').value = data.analysisDate;
  }catch(e){}
}
function runCalculation(){
  const payload=collectData();
  setStatus('','');
  setLoading(true);
  try{
    const result = window.calculateNumerology(payload);
    saveFormData(payload);
    setLoading(false);
    setStatus('Aprēķins pabeigts.','success');
    renderResults(result);
  }catch(error){
    setLoading(false);
    const msg=error&&error.message?error.message:String(error||'Nezināma kļūda');
    setStatus(msg,'error');
  }
}
function registerServiceWorker(){
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('./service-worker.js').catch(function(){});
    });
  }
}
let deferredPrompt = null;
function setupInstallPrompt(){
  const btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.hidden = false;
  });
  btn.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.hidden = true;
  });
}
document.addEventListener('DOMContentLoaded',function(){
  setTodayToAnalysisDate();
  loadFormData();
  registerServiceWorker();
  setupInstallPrompt();
});