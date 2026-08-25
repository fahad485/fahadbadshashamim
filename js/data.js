const DATA_FILES=['site','about','research','publications','experience','skills','education','appearance','contact','languages','skill-details','cv','custom-sections'];
async function loadJSON(name){const r=await fetch(`data/${name}.json?v=${Date.now()}`);if(!r.ok)throw new Error(`Failed to load ${name}.json`);return r.json()}
async function loadAll(){const entries=await Promise.all(DATA_FILES.map(async n=>[n,await loadJSON(n)]));return Object.fromEntries(entries)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function safeUrl(u,fallback='#'){if(!u)return fallback;try{const x=new URL(u,location.href);if(['http:','https:','mailto:'].includes(x.protocol)||x.origin===location.origin)return x.href}catch{}return fallback}
function safeImage(u){if(!u)return '';return safeUrl(u,'')}
const LANG_KEY='portfolio-language';
async function getI18n(){try{return await loadJSON('i18n')}catch{return {en:{}}}}
function getLang(enabled=['en']){const l=localStorage.getItem(LANG_KEY)||'en';return enabled.includes(l)?l:'en'}
function setLang(l){localStorage.setItem(LANG_KEY,l);document.documentElement.lang=l;location.reload()}
function applyI18n(dict,lang){document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(dict[lang]?.[k]!==undefined)el.textContent=dict[lang][k]})}
function langSelect(dict,enabled){const s=document.createElement('select');s.className='lang-select';s.setAttribute('aria-label','Language');const current=getLang(enabled);enabled.forEach(l=>{const o=document.createElement('option');o.value=l;o.textContent=dict[l]?.name||l.toUpperCase();if(l===current)o.selected=true;s.appendChild(o)});s.addEventListener('change',()=>setLang(s.value));return s}
function capBrand(name){
 const safe=String(name||'Fahad Badsha Shamim');
 const parts=safe.split(/\s+/); const first=parts[0]||'Fahad', middle=parts[1]||'Badsha', last=parts.slice(2).join(' ')||'Shamim';
 const i=last.toLowerCase().indexOf('i');
 let lastHtml=esc(last);
 if(i>=0){
   const before=esc(last.slice(0,i)), after=esc(last.slice(i+1));
   lastHtml=`${before}<span class="brand-i" aria-hidden="true"><span class="i-letter">i</span><span class="cap-dot"><svg viewBox="0 0 32 22" focusable="false"><path d="M2 8 16 1l14 7-14 7L2 8Zm5 2v5c0 2.4 4 4.7 9 4.7s9-2.3 9-4.7v-5l-3 1.5v3c0 1-2.7 2.1-6 2.1s-6-1.1-6-2.1v-3L7 10Z"/></svg></span></span>${after}`;
 }
 return `<span class="brand" aria-label="${esc(safe)}"><span>${esc(first)} ${esc(middle)} ${lastHtml}</span></span>`;
}
function renderHeader(site,dict,enabled){
 const h=document.querySelector('#siteHeader');if(!h)return;
 const nav=(site.nav?.items||[]).filter(x=>x.visible!==false).sort((a,b)=>(a.order??0)-(b.order??0));
 const lang=getLang(enabled);
 const navLabels={home:dict[lang]?.navHome,about:dict[lang]?.navAbout,research:dict[lang]?.navResearch,publications:dict[lang]?.navPublications,skills:dict[lang]?.navSkills,experience:dict[lang]?.navExperience,education:dict[lang]?.navEducation,contact:dict[lang]?.navContact};
 const menuItems=(site.profileMenuItems||[]).filter(x=>x.visible!==false).sort((a,b)=>(a.order??0)-(b.order??0));
 const menuHtml=menuItems.length?`<div class="future-menu">${menuItems.map(x=>{const target=x.target==='_blank'?' target="_blank" rel="noopener noreferrer"':'';return `<a href="${esc(safeUrl(x.href||'#'))}"${target}>${esc(x.label||'Untitled')}</a>`}).join('')}</div>`:'';
 const app=window.__PORTFOLIO_APPEARANCE||{};h.className=`site-header header-style-${esc(app.headerStyle||'classic')} header-anim-${esc(app.headerAnimation||'none')}`;h.innerHTML=`<div class="container nav">${capBrand(site.nav?.brandText||site.name||'Fahad Badsha Shamim')}<button class="menu-btn" id="menuBtn" aria-label="Open navigation">☰</button><nav class="nav-links" id="navLinks">${nav.map(x=>`<a href="${esc(x.href||('#'+x.id))}">${esc(navLabels[x.id]||x.label)}</a>`).join('')}</nav><div class="nav-actions"><button class="header-icon lang-trigger" id="langTrigger" aria-label="Language" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"></path></svg></button><div class="language-menu" id="languageMenu">${enabled.map(l=>`<button data-lang="${esc(l)}">${esc(dict[l]?.name||l.toUpperCase())}</button>`).join('')}</div><button class="icon-btn theme-btn" id="themeBtn" aria-label="Toggle theme"><span aria-hidden="true">◐</span></button>${menuHtml}</div></div>`;
 h.querySelectorAll('.language-menu button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
 h.querySelector('#langTrigger')?.addEventListener('click',e=>{e.stopPropagation();h.querySelector('#languageMenu').classList.toggle('open')});
 h.querySelector('#menuBtn')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
 h.querySelector('#themeBtn')?.addEventListener('click',()=>document.body.classList.toggle('theme-soft'));
 const onScroll=()=>h.classList.toggle('scrolled',window.scrollY>18); onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
 document.addEventListener('click',()=>h.querySelector('#languageMenu')?.classList.remove('open'));
}
function renderSocial(el,site,contact){
 if(!el)return;
 const icons={
  GitHub:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7A11.3 11.3 0 0 0 8.4 22.8c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.54-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.03 0 0 .97-.31 3.12 1.17A10.9 10.9 0 0 1 12 6.1c.98 0 1.97.13 2.9.38 2.15-1.48 3.11-1.17 3.11-1.17.62 1.57.23 2.74.12 3.03.73.8 1.17 1.82 1.17 3.07 0 4.39-2.67 5.35-5.22 5.64.41.36.78 1.06.78 2.14v3.16c0 .3.2.65.79.54A11.3 11.3 0 0 0 12 .7Z"/></svg>`,
  LinkedIn:`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.1 3.6a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM3.4 9h3.4v11.1H3.4V9Zm5.5 0h3.3v1.52h.05c.46-.88 1.58-1.81 3.26-1.81 3.49 0 4.13 2.3 4.13 5.3v6.09h-3.4v-5.4c0-1.29-.03-2.95-1.8-2.95-1.81 0-2.09 1.4-2.09 2.85v5.5H8.9V9Z"/></svg>`,
  ResearchGate:`<span class="social-text">RG</span>`,
  ORCID:`<span class="social-text">iD</span>`
 };
 el.innerHTML='';
 [['GitHub',site.github||contact.github],['LinkedIn',site.linkedin||contact.linkedin],['ResearchGate',contact.researchgate],['ORCID',contact.orcid]].forEach(([label,url])=>{
  if(url){const a=document.createElement('a');a.className='social';a.href=safeUrl(url);a.target='_blank';a.rel='noopener noreferrer';a.title=label;a.innerHTML=icons[label]||label[0];el.appendChild(a)}
 });
}
