/* HOKU / educational adaptation of the Freeframe Roast coffee-shop template.
 * Catalogue, filters and local demonstration basket. No payment or backend.
 * GA4 and Clarity are NOT installed until real IDs are provided.
 */
(() => {
  'use strict';
  const COFFEES = [
    {id:'ethiopia',country:'ETHIOPIA',origin:'Ефіопія',notes:'Жасмин · персик · чорниця',process:'Натуральна',roast:'Світле',tag:'fruit',price:420,number:'01',desc:'Ароматний, яскравий профіль з квітковими відтінками та фруктовою солодкістю. Для тих, хто любить цікаву фільтр-каву.'},
    {id:'colombia',country:'COLOMBIA',origin:'Колумбія',notes:'Червоне яблуко · карамель · какао',process:'Мита',roast:'Середнє',tag:'balanced',price:450,number:'02',desc:'Збалансований смак із м’якою фруктовою кислотністю та солодким шоколадним післясмаком. Підійде для еспресо й фільтра.'},
    {id:'honduras',country:'HONDURAS',origin:'Гондурас',notes:'Молочний шоколад · слива · горіх',process:'Мита',roast:'Середнє',tag:'chocolate',price:430,number:'03',desc:'Округла, спокійна чашка з відтінками какао, стиглих фруктів і горіхів. Гарний вибір для щоденної кави.'},
    {id:'kenya',country:'KENYA',origin:'Кенія',notes:'Чорна смородина · червоні ягоди',process:'Мита',roast:'Світле',tag:'fruit',price:470,number:'04',desc:'Соковита ягідна кислотність, виразний аромат і чистий післясмак. Найцікавіше розкривається у фільтрі.'},
    {id:'costa-rica',country:'COSTA RICA',origin:'Коста-Рика',notes:'Мед · червоне яблуко · карамель',process:'Хані',roast:'Середнє',tag:'balanced',price:460,number:'05',desc:'Медова солодкість і делікатна фруктовість. Комфортний профіль для тих, хто любить насичену, але не різку каву.'},
    {id:'rwanda',country:'RWANDA',origin:'Руанда',notes:'Малина · чорний чай · цитрус',process:'Мита',roast:'Світле',tag:'fruit',price:460,number:'06',desc:'Легка, чайна чашка з ягодами та яскравим ароматом. Добре підходить для воронки й AeroPress.'},
    {id:'brazil',country:'BRAZIL',origin:'Бразилія',notes:'Фундук · шоколад · коричневий цукор',process:'Натуральна',roast:'Середнє',tag:'chocolate',price:390,number:'07',desc:'М’яка кислотність, виразне тіло та солодкий горіхово-шоколадний профіль. Вдалий варіант для еспресо з молоком.'}
  ];
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const format = n => `${Number(n).toLocaleString('uk-UA')} ₴`;
  const grid = $('#product-grid');
  let filter = 'all';
  const KEY = 'hoku-roast-demo-cart-v1';
  let stored = {};
  try {stored=JSON.parse(localStorage.getItem(KEY)||'{}')||{}} catch(e) {stored={}}
  const cart = {};
  Object.entries(stored).forEach(([id,qty])=>{
    if(COFFEES.some(c=>c.id===id) && Number.isInteger(qty) && qty>0 && qty<=20) cart[id]=qty;
  });
  const coffee = id => COFFEES.find(c=>c.id===id);
  const basketValue = () => COFFEES.reduce((acc,c)=>acc+c.price*(cart[c.id]||0),0);
  const basketItems = () => COFFEES.filter(c=>cart[c.id]).map(c=>({item_id:c.id,item_name:c.origin,price:c.price,quantity:cart[c.id]}));
  const count = () => Object.values(cart).reduce((a,v)=>a+v,0);
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){} }
  function track(event,params={}){
    // Event dispatch makes it possible to test the funnel locally.
    // External analytics receive events only after their real IDs are connected.
    if(typeof window.gtag==='function') window.gtag('event',event,params);
    document.dispatchEvent(new CustomEvent('hoku:analytics',{detail:{event,params}}));
  }
  function showToast(message){
    const toast=$('#toast');toast.textContent=message;toast.classList.add('show');
    clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2800);
  }
  function card(c){
    const a=document.createElement('article');a.className='product-card';a.dataset.id=c.id;
    a.innerHTML=`<div class="product-image">
      <span class="product-tag">ORIGIN / ${c.number}</span>
      <button class="image-detail" type="button" data-detail="${c.id}" aria-label="Детальніше про каву ${c.origin}">
        <img loading="lazy" src="assets/img/bag-${c.id}.webp" alt="Матова темно-коричнева пачка HOKU ${c.country} з бежевою етикеткою, 250 г" width="720" height="900">
      </button>
    </div>
    <div class="product-details"><p class="product-origin">КРАЇНА / ${c.origin.toUpperCase()}</p>
      <h3><button type="button" class="product-title-button" data-detail="${c.id}">${c.country}</button></h3>
      <p class="product-notes">${c.notes}</p>
      <div class="product-meta"><span>${c.roast} обсмаження</span><span>250 г</span></div>
      <div class="product-buy"><strong>${format(c.price)}</strong><button class="add-button" type="button" data-add="${c.id}" aria-label="Додати ${c.origin} до кошика">+</button></div>
    </div>`;
    return a;
  }
  function render(){
    const list=COFFEES.filter(c=>filter==='all'||c.tag===filter);
    grid.replaceChildren(...list.map(card));
    $('#filter-result').textContent=`Знайдено ${list.length} сортів кави`;
    track('view_item_list',{item_list_id:'hoku_origins',items:list.map(c=>({item_id:c.id,item_name:c.origin,price:c.price}))});
  }
  $('#filters').addEventListener('click',e=>{
    const btn=e.target.closest('[data-filter]');if(!btn)return;
    filter=btn.dataset.filter;
    $$('#filters .filter').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    render();track('select_content',{content_type:'coffee_filter',item_id:filter});
  });
  function updateBadge(){ $('#cart-count').textContent=count(); }
  function add(id){
    const c=coffee(id);if(!c)return;
    if((cart[id]||0)>=20){showToast('Максимум 20 пачок одного сорту');return}
    cart[id]=(cart[id]||0)+1;persist();updateBadge();showToast(`${c.origin}: додано до кошика`);
    track('add_to_cart',{currency:'UAH',value:c.price,items:[{item_id:c.id,item_name:c.origin,price:c.price,quantity:1}]});
  }
  const details=$('#details-backdrop');let selected=null,lastFocus=null;
  function openDetails(id){
    const c=coffee(id);if(!c)return;selected=c;lastFocus=document.activeElement;
    $('#details-title').textContent=c.country;
    const p=$('#details-photo');p.src=`assets/img/bag-${c.id}.webp`;p.alt=`Пакування HOKU ${c.origin}, 250 г`;
    $('#details-notes').textContent=c.notes;
    $('#details-meta').innerHTML=`<div><dt>Походження</dt><dd>${c.origin}</dd></div><div><dt>Обробка</dt><dd>${c.process}</dd></div><div><dt>Обсмаження</dt><dd>${c.roast}</dd></div><div><dt>Маса</dt><dd>250 г</dd></div>`;
    $('#details-description').textContent=c.desc;
    $('#details-price').textContent=format(c.price);
    details.hidden=false;document.body.classList.add('overlay-open');$('#details-close').focus();
    track('view_item',{currency:'UAH',value:c.price,items:[{item_id:c.id,item_name:c.origin,price:c.price}]});
  }
  function closeDetails(){ details.hidden=true;document.body.classList.remove('overlay-open');if(lastFocus)lastFocus.focus(); }
  grid.addEventListener('click',e=>{const b=e.target.closest('[data-detail],[data-add]');if(!b)return;if(b.hasAttribute('data-add'))add(b.dataset.add);else openDetails(b.dataset.detail)});
  $('#details-add').addEventListener('click',()=>{if(!selected)return;add(selected.id);closeDetails();});
  $('#details-close').addEventListener('click',closeDetails);
  details.addEventListener('click',e=>{if(e.target===details)closeDetails()});
  const backdrop=$('#cart-backdrop'),panel=$('#cart-panel');
  let cartFocus=null;
  function renderCart(){
    const list=$('#cart-list');list.replaceChildren();
    COFFEES.filter(c=>cart[c.id]).forEach(c=>{
      const el=document.createElement('div');el.className='cart-item';
      el.innerHTML=`<div class="cart-item-name"><strong>${c.origin}</strong><small>${format(c.price)} · 250 г</small></div><div class="cart-controls"><button data-minus="${c.id}" type="button" aria-label="Прибрати одну пачку ${c.origin}">−</button><span>${cart[c.id]}</span><button data-plus="${c.id}" type="button" aria-label="Додати одну пачку ${c.origin}">+</button></div>`;
      list.append(el);
    });
    if(!count()){const p=document.createElement('p');p.className='cart-empty';p.textContent='Кошик поки порожній. Додай будь-яку каву з каталогу.';list.append(p);}
    $('#cart-total').textContent=format(basketValue());
    $('#checkout').disabled=!count();
  }
  function openCart(){cartFocus=document.activeElement;renderCart();panel.hidden=false;backdrop.hidden=false;document.body.classList.add('overlay-open');$('#cart-toggle').setAttribute('aria-expanded','true');$('#cart-close').focus();track('view_cart',{currency:'UAH',value:basketValue(),items:basketItems()});}
  function closeCart(){panel.hidden=true;backdrop.hidden=true;document.body.classList.remove('overlay-open');$('#cart-toggle').setAttribute('aria-expanded','false');if(cartFocus)cartFocus.focus();}
  $('#cart-toggle').addEventListener('click',openCart);
  $('#cart-close').addEventListener('click',closeCart);
  backdrop.addEventListener('click',closeCart);
  $('#cart-list').addEventListener('click',e=>{
    const b=e.target.closest('[data-plus],[data-minus]');if(!b)return;
    const id=b.dataset.plus||b.dataset.minus, delta=b.hasAttribute('data-plus')?1:-1;
    cart[id]=Math.max(0,Math.min(20,(cart[id]||0)+delta));if(!cart[id])delete cart[id];
    persist();updateBadge();renderCart();
  });
  const checkout=$('#checkout-backdrop');
  function startCheckout(){
    if(!count())return;
    track('begin_checkout',{currency:'UAH',value:basketValue(),items:basketItems()});
    closeCart();checkout.hidden=false;document.body.classList.add('overlay-open');
    $('#checkout-title').textContent='ТЕСТОВА ЗАЯВКА';
    $('#checkout-description').textContent='Це лише завершальний крок демонстраційного замовлення. Гроші не списуються, контактні та платіжні дані не збираються.';
    $('#finish-checkout').hidden=false;$('#finish-checkout').focus();
  }
  function closeCheckout(){checkout.hidden=true;document.body.classList.remove('overlay-open');$('#cart-toggle').focus();}
  $('#checkout').addEventListener('click',startCheckout);
  $('#checkout-close').addEventListener('click',closeCheckout);
  checkout.addEventListener('click',e=>{if(e.target===checkout)closeCheckout()});
  $('#finish-checkout').addEventListener('click',()=>{
    if(!count())return;
    const value=basketValue(),items=basketItems();
    track('generate_lead',{currency:'UAH',value,lead_source:'educational_demo',items});
    track('demo_order_complete',{currency:'UAH',value,items});
    Object.keys(cart).forEach(id=>delete cart[id]);persist();updateBadge();
    $('#checkout-title').textContent='ТЕСТ ЗАВЕРШЕНО';
    $('#checkout-description').textContent='Демонстраційну воронку завершено. Реальне замовлення не створювалося, оплата не проводилася.';
    $('#finish-checkout').hidden=true;showToast('Навчальну заявку завершено');
  });
  // Keyboard escape and basic modal focus containment
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(!checkout.hidden)closeCheckout();else if(!details.hidden)closeDetails();else if(!panel.hidden)closeCart();
    }
    if(e.key==='Tab'){
      const activeDialog=!checkout.hidden?checkout.querySelector('[role="dialog"]'):!details.hidden?details.querySelector('[role="dialog"]'):!panel.hidden?panel:null;
      if(!activeDialog)return;
      const focusables=Array.from(activeDialog.querySelectorAll('button:not([disabled]):not([hidden]),a[href],input:not([disabled])')).filter(el=>el.getClientRects().length);
      if(!focusables.length)return;
      const first=focusables[0],last=focusables[focusables.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  const menu=$('#main-nav'),menuButton=$('#menu-toggle');
  menuButton.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрити меню':'Відкрити меню');
  });
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
  $('#hero-shop').addEventListener('click',()=>track('select_content',{content_type:'hero_cta',item_id:'catalog'}));
  render();updateBadge();
})();
