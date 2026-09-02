const hotels=[...(window.SPA_HOTELS||[]),...(window.SPA_CANDIDATES||[])];
const $=id=>document.getElementById(id);
const list=$('list'),search=$('search'),tierFilter=$('tierFilter'),regionFilter=$('regionFilter'),driveFilter=$('driveFilter'),sortFilter=$('sortFilter'),resultCount=$('resultCount'),clearFilters=$('clearFilters');
const tagButtons=[...document.querySelectorAll('[data-tag]')];
let activeTags=new Set(),map,mapReady=false,markers=new Map(),selectedKey=null;

const tierOrder={shortlist:0,value:1,secondary:2,niche:3,leisure:4,forthcoming:5,boundary:6};
const tierNames={shortlist:'Recommended 24',value:'Value / high-secondary',secondary:'Secondary',niche:'Niche format',leisure:'Leisure-led',forthcoming:'Forthcoming',boundary:'3-hour boundary'};
const tierShort={shortlist:'Top',value:'V',secondary:'S',niche:'N',leisure:'L',forthcoming:'F',boundary:'B'};
const keyFor=h=>h.rank?`rank-${h.rank}`:`${h.tier||'other'}-${h.name}`;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const formatDrive=m=>!Number.isFinite(m)?'Drive time not standardised':m<60?`~${m} min`:m%60===0?`~${m/60} hr`:`~${Math.floor(m/60)} hr ${m%60} min`;
const driveText=h=>h.drive||formatDrive(h.driveMins);
const reviewUrl=h=>h.reviewUrl||`https://www.tripadvisor.co.uk/Search?q=${encodeURIComponent(h.name)}`;
const gmap=h=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Newcastle upon Tyne, UK')}&destination=${encodeURIComponent((h.address||h.name+', '+h.area))}`;
const mapped=h=>Number.isFinite(h.lat)&&Number.isFinite(h.lng);
const tierLabel=h=>tierNames[h.tier]||h.tier||'Research candidate';
const scoreText=h=>Number.isFinite(h.score)?`<strong>${h.score.toFixed(0)}</strong><span>/100</span>`:`<span class="pending">${esc(tierLabel(h))}</span>`;
const badgeText=h=>h.rank??tierShort[h.tier]??'•';
const reviewText=h=>Number.isFinite(h.review)?`${h.review.toFixed(1)}/5${h.reviews?` · ${esc(h.reviews)}`:''}`:'Not standardised in the audit';
const defaultLead=h=>h.tier==='shortlist'?'4–8 weeks; longer for premium Saturdays':h.tier==='forthcoming'?'Post-opening availability likely tight':'2–6 weeks; deal-led hotels may work closer to travel';
const defaultPrice=h=>h.tier==='boundary'?'Check live pricing if the drive is acceptable':'Compare direct, SpaSeekers/SpaBreaks and deal channels';
const defaultDesc=h=>h.tier==='secondary'?'Credible hotel-spa retained in the exhaustive research universe, but below the high-quality ranking cutoff.':h.tier==='leisure'?'A researched leisure-led hotel with some spa facilities, retained for completeness rather than destination-spa quality.':h.tier==='niche'?'A credible wellness stay with a format that does not compare cleanly with a conventional communal hotel spa.':h.tier==='boundary'?'A strong spa candidate whose normal driving time sits around the three-hour boundary.':'Research candidate retained for completeness.';
const labelsFor=h=>h.labels?.length?h.labels:[tierLabel(h),h.region,driveText(h)];

function tierClass(h){return `tier-${h.tier||'secondary'}`;}
function card(h){
  const alert=h.alert?`<div class="cardalert"><strong>Booking note:</strong> ${esc(h.alert)}</div>`:'';
  const facilities=(h.facilities||[]).length?h.facilities:['Facility detail retained at summary level in the research audit'];
  const official=h.official?`<a href="${esc(h.official)}" target="_blank" rel="noopener">Official site ↗</a>`:'';
  return `<article class="card ${tierClass(h)}" data-key="${esc(keyFor(h))}">
    <div class="cardhead" tabindex="0" role="button" aria-expanded="false">
      <span class="rank">${esc(badgeText(h))}</span>
      <span class="hotelmeta"><span class="name">${esc(h.name)}</span><span class="area">${esc(h.area)} · ${esc(driveText(h))}</span></span>
      <span class="score">${scoreText(h)}</span>
    </div>
    <div class="tierline"><span class="tierpill">${esc(tierLabel(h))}</span>${h.region?`<span>${esc(h.region)}</span>`:''}</div>
    <div class="desc">${esc(h.desc||defaultDesc(h))}</div>
    <div class="facts">
      <div class="fact"><strong>Independent review</strong>${reviewText(h)}</div>
      <div class="fact"><strong>Indicative price</strong>${esc(h.price||defaultPrice(h))}</div>
      <div class="fact"><strong>Booking lead</strong>${esc(h.lead||defaultLead(h))}</div>
      <div class="fact"><strong>Spa model</strong>${esc(h.category||'Hotel spa / wellness candidate')}</div>
    </div>
    <div class="tags">${labelsFor(h).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>
    <div class="actions">
      <button type="button" class="detailsbtn">Facilities + details</button>
      <a class="primary" href="${gmap(h)}" target="_blank" rel="noopener">Directions ↗</a>
      ${official}
      <a href="${reviewUrl(h)}" target="_blank" rel="noopener">Reviews ↗</a>
    </div>
    <div class="details"><ul class="facilities">${facilities.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${alert}</div>
  </article>`;
}

function tierMatch(h,mode){
  if(mode==='all')return true;
  if(mode==='other')return ['secondary','leisure','niche'].includes(h.tier);
  return h.tier===mode;
}
function sorted(a){
  const mode=sortFilter.value;
  return [...a].sort((x,y)=>{
    if(mode==='closest')return (x.driveMins??999)-(y.driveMins??999)||String(x.name).localeCompare(y.name);
    if(mode==='score')return (Number.isFinite(y.score)?y.score:-1)-(Number.isFinite(x.score)?x.score:-1)||(x.rank??999)-(y.rank??999);
    if(mode==='review')return (Number.isFinite(y.review)?y.review:-1)-(Number.isFinite(x.review)?x.review:-1)||(x.rank??999)-(y.rank??999);
    if(mode==='name')return String(x.name).localeCompare(y.name);
    return (tierOrder[x.tier]??9)-(tierOrder[y.tier]??9)||(x.rank??999)-(y.rank??999)||(Number.isFinite(y.score)?y.score:-1)-(Number.isFinite(x.score)?x.score:-1)||(x.driveMins??999)-(y.driveMins??999);
  });
}
function visible(){
  const q=search.value.trim().toLowerCase(),tier=tierFilter.value,region=regionFilter.value,maxDrive=Number(driveFilter.value)||Infinity;
  return sorted(hotels.filter(h=>{
    if(!tierMatch(h,tier))return false;
    if(region!=='all'&&h.region!==region)return false;
    if(Number.isFinite(h.driveMins)&&h.driveMins>maxDrive)return false;
    if(activeTags.size&&![...activeTags].every(t=>(h.tags||[]).includes(t)))return false;
    if(q){
      const blob=`${h.name} ${h.area} ${h.region||''} ${h.address||''} ${driveText(h)} ${h.category||''} ${h.price||''} ${h.desc||''} ${(h.facilities||[]).join(' ')} ${(h.tags||[]).join(' ')} ${labelsFor(h).join(' ')}`.toLowerCase();
      if(!blob.includes(q))return false;
    }
    return true;
  }));
}

function updateMeta(a){
  const mappedCount=a.filter(mapped).length;
  resultCount.textContent=`${a.length} shown · ${mappedCount} mapped`;
  const badge=$('mapbadge');if(badge)badge.textContent=`${a.length} shown · ${mappedCount} mapped · numbered pins = ranked top 24`;
}
function render(){
  const a=visible();
  list.innerHTML=a.length?a.map(card).join(''):`<div class="empty">No spa hotels match that combination. Clear one or more filters and try again.</div>`;
  updateMeta(a);
  if(mapReady){
    const keys=new Set(a.filter(mapped).map(keyFor));
    markers.forEach((m,k)=>keys.has(k)?m.addTo(map):m.remove());
  }
  list.querySelectorAll('.card').forEach(el=>{
    const key=el.dataset.key,head=el.querySelector('.cardhead'),btn=el.querySelector('.detailsbtn');
    const select=()=>selectHotel(key,false);
    head.addEventListener('click',select);
    head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    btn.addEventListener('click',e=>{e.stopPropagation();const open=el.classList.toggle('open');head.setAttribute('aria-expanded',String(open));btn.textContent=open?'Hide facilities':'Facilities + details';});
    el.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));
  });
  if(selectedKey){const el=[...list.querySelectorAll('.card')].find(c=>c.dataset.key===selectedKey);el?.classList.add('selected');}
}
function selectHotel(key,scroll=true){
  selectedKey=key;
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('selected',c.dataset.key===key));
  const marker=markers.get(key),h=hotels.find(x=>keyFor(x)===key);
  if(mapReady&&marker&&h&&mapped(h)){map.setView([h.lat,h.lng],Math.max(map.getZoom(),10),{animate:true});marker.openPopup();}
  if(scroll){const el=[...list.querySelectorAll('.card')].find(c=>c.dataset.key===key);el?.scrollIntoView({behavior:'smooth',block:'nearest'});}
}
function fitVisible(){
  if(!mapReady)return;
  const a=visible().filter(mapped);
  if(!a.length)return;
  if(a.length===1){map.setView([a[0].lat,a[0].lng],10);return;}
  map.fitBounds(a.map(h=>[h.lat,h.lng]),{padding:[38,38],maxZoom:10});
}
function changed(){render();fitVisible();}
[tierFilter,regionFilter,driveFilter,sortFilter].forEach(el=>el.addEventListener('change',changed));
search.addEventListener('input',changed);
tagButtons.forEach(btn=>btn.addEventListener('click',()=>{const tag=btn.dataset.tag;activeTags.has(tag)?activeTags.delete(tag):activeTags.add(tag);btn.classList.toggle('active',activeTags.has(tag));changed();}));
clearFilters.addEventListener('click',()=>{tierFilter.value='shortlist';regionFilter.value='all';driveFilter.value='0';sortFilter.value='recommended';search.value='';activeTags.clear();tagButtons.forEach(b=>b.classList.remove('active'));changed();});

function mapFailed(){ $('fallback').hidden=false; }
function initMap(){
  if(mapReady||!window.L)return;
  try{
    map=L.map('map',{zoomControl:true,scrollWheelZoom:true,preferCanvas:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    hotels.filter(mapped).forEach(h=>{
      const key=keyFor(h),klass=`marker-${h.tier||'secondary'}`;
      const icon=L.divIcon({className:'',html:`<div class="num-marker ${klass}">${esc(badgeText(h))}</div>`,iconSize:[32,32],iconAnchor:[16,16]});
      const m=L.marker([h.lat,h.lng],{icon,title:h.name});
      const score=Number.isFinite(h.score)?`<strong>${h.score.toFixed(0)}/100</strong> · `:`<strong>${esc(tierLabel(h))}</strong> · `;
      m.bindPopup(`<div class="popup"><h3>${h.rank?'#'+h.rank+' ':''}${esc(h.name)}</h3><p>${score}${Number.isFinite(h.review)?h.review.toFixed(1)+'/5 · ':''}${esc(driveText(h))}</p><p>${esc(h.category||'Hotel spa candidate')}</p><a href="${gmap(h)}" target="_blank" rel="noopener">Directions from Newcastle ↗</a></div>`);
      m.on('click',()=>selectHotel(key,true));markers.set(key,m);
    });
    mapReady=true;$('fallback').hidden=true;render();fitVisible();setTimeout(()=>map.invalidateSize(),150);
  }catch(e){mapFailed();}
}
function loadScript(src,fallback){
  const s=document.createElement('script');s.src=src;s.crossOrigin='';s.onload=initMap;
  s.onerror=()=>{if(fallback){const f=document.createElement('script');f.src=fallback;f.onload=initMap;f.onerror=mapFailed;document.body.appendChild(f);}else mapFailed();};document.body.appendChild(s);
}

// Default to the editorial high-quality shortlist; every researched candidate remains one filter away.
render();
loadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
