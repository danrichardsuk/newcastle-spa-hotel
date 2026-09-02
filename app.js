const hotels=window.SPA_HOTELS||[];
const $=id=>document.getElementById(id),list=$('list'),search=$('search'),chips=[...document.querySelectorAll('.chip')];
let active='all',map,mapReady=false,markers=new Map(),selectedKey=null;
const keyFor=h=>h.rank?`rank-${h.rank}`:`status-${h.status}-${h.name}`;
const gmap=h=>`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Newcastle upon Tyne, UK')}&destination=${encodeURIComponent(h.name.replace(' · Aurelius Spa','')+', '+h.address)}`;
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const scoreText=h=>Number.isFinite(h.score)?`${h.score.toFixed(1)}<span>/100</span>`:`<span class="pending">Forthcoming</span>`;
const rankText=h=>h.rank??'F';
const reviewText=h=>Number.isFinite(h.review)?`${h.review.toFixed(1)}/5 · ${esc(h.reviews)} reviews`:'Independent rating refresh pending';

function card(h){
  const alert=h.alert?`<div class="cardalert"><strong>Booking note:</strong> ${esc(h.alert)}</div>`:'';
  const forthcoming=h.status==='forthcoming';
  return `<article class="card${forthcoming?' forthcoming':''}" data-key="${esc(keyFor(h))}">
    <div class="cardhead" tabindex="0" role="button" aria-expanded="false">
      <span class="rank">${rankText(h)}</span>
      <span class="hotelmeta"><span class="name">${esc(h.name)}</span><span class="area">${esc(h.area)} · ${esc(h.drive)}</span></span>
      <span class="score">${scoreText(h)}</span>
    </div>
    <div class="desc">${esc(h.desc)}</div>
    <div class="facts">
      <div class="fact"><strong>Independent review</strong>${reviewText(h)}</div>
      <div class="fact"><strong>Indicative price</strong>${esc(h.price)}</div>
      <div class="fact"><strong>Booking lead</strong>${esc(h.lead)}</div>
      <div class="fact"><strong>Category</strong>${esc(h.category)}</div>
    </div>
    <div class="tags">${h.labels.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>
    <div class="actions">
      <button type="button" class="detailsbtn">Facilities + details</button>
      <a class="primary" href="${gmap(h)}" target="_blank" rel="noopener">Directions ↗</a>
      <a href="${h.official}" target="_blank" rel="noopener">Official site ↗</a>
      <a href="${h.reviewUrl}" target="_blank" rel="noopener">Reviews ↗</a>
    </div>
    <div class="details"><ul class="facilities">${h.facilities.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${alert}</div>
  </article>`;
}

function visible(){
  const q=search.value.trim().toLowerCase();
  return hotels.filter(h=>(active==='all'||h.tags.includes(active))&&(!q||`${h.name} ${h.area} ${h.address} ${h.drive} ${h.category} ${h.price} ${h.lead} ${h.desc} ${h.facilities.join(' ')} ${h.labels.join(' ')}`.toLowerCase().includes(q)));
}

function render(){
  const a=visible();
  list.innerHTML=a.length?a.map(card).join(''):`<div class="empty">No spa hotels match those filters.</div>`;
  if(mapReady){
    const keys=new Set(a.map(keyFor));
    markers.forEach((m,k)=>keys.has(k)?m.addTo(map):m.remove());
  }
  list.querySelectorAll('.card').forEach(el=>{
    const key=el.dataset.key,head=el.querySelector('.cardhead'),btn=el.querySelector('.detailsbtn');
    const select=()=>selectHotel(key,false);
    head.addEventListener('click',select);
    head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const open=el.classList.toggle('open');
      head.setAttribute('aria-expanded',String(open));
      btn.textContent=open?'Hide facilities':'Facilities + details';
    });
    el.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.stopPropagation()));
  });
  if(selectedKey) document.querySelector(`.card[data-key="${CSS.escape(selectedKey)}"]`)?.classList.add('selected');
}

function selectHotel(key,scroll=true){
  selectedKey=key;
  document.querySelectorAll('.card').forEach(c=>c.classList.toggle('selected',c.dataset.key===key));
  const marker=markers.get(key),h=hotels.find(x=>keyFor(x)===key);
  if(mapReady&&marker&&h){map.setView([h.lat,h.lng],Math.max(map.getZoom(),10),{animate:true});marker.openPopup();}
  if(scroll) document.querySelector(`.card[data-key="${CSS.escape(key)}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest'});
}

chips.forEach(ch=>ch.addEventListener('click',()=>{
  active=ch.dataset.filter;
  chips.forEach(x=>x.classList.toggle('active',x===ch));
  render();
  if(mapReady) fitVisible();
}));
search.addEventListener('input',()=>{render();if(mapReady)fitVisible();});

function fitVisible(){
  const a=visible();
  if(!a.length)return;
  map.fitBounds(a.map(h=>[h.lat,h.lng]),{padding:[38,38],maxZoom:10});
}

function mapFailed(){ $('fallback').hidden=false; }
function initMap(){
  if(mapReady||!window.L)return;
  try{
    map=L.map('map',{zoomControl:true,scrollWheelZoom:true,preferCanvas:true});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    hotels.forEach(h=>{
      const key=keyFor(h),isForthcoming=h.status==='forthcoming';
      const icon=L.divIcon({className:'',html:`<div class="num-marker${isForthcoming?' forthcoming-marker':''}">${rankText(h)}</div>`,iconSize:[35,35],iconAnchor:[17,17]});
      const m=L.marker([h.lat,h.lng],{icon,title:h.name});
      const score=Number.isFinite(h.score)?`<strong>${h.score.toFixed(1)}/100</strong> · `:'<strong>Forthcoming</strong> · ';
      m.bindPopup(`<div class="popup"><h3>${h.rank?'#'+h.rank+' ':''}${esc(h.name)}</h3><p>${score}${Number.isFinite(h.review)?h.review.toFixed(1)+'/5 · ':''}${esc(h.drive)}</p><p>${esc(h.category)}</p><a href="${gmap(h)}" target="_blank" rel="noopener">Directions from Newcastle ↗</a></div>`);
      m.on('click',()=>selectHotel(key,true));
      markers.set(key,m);m.addTo(map);
    });
    mapReady=true;$('fallback').hidden=true;fitVisible();setTimeout(()=>map.invalidateSize(),150);
  }catch(e){mapFailed();}
}
function loadScript(src,fallback){
  const s=document.createElement('script');s.src=src;s.crossOrigin='';s.onload=initMap;
  s.onerror=()=>{if(fallback){const f=document.createElement('script');f.src=fallback;f.onload=initMap;f.onerror=mapFailed;document.body.appendChild(f);}else mapFailed();};
  document.body.appendChild(s);
}

render();
loadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
