const logEl = document.getElementById('log');
const content = document.getElementById('content');
const tabs = document.getElementById('tabs');

const resources = {
  users: {
    title: 'Users',
    fields: [
      {key:'name', label:'Name', type:'text', required:true},
      {key:'email', label:'Email', type:'text', required:true},
      {key:'password', label:'Password', type:'text', required:true}
    ],
    list: ['id','name','email']
  },
  movies: {
    title: 'Movies',
    fields: [
      {key:'title', label:'Title', type:'text', required:true},
      {key:'duration', label:'Duration (mins)', type:'number', required:true},
      {key:'genre', label:'Genre', type:'text'}
    ],
    list: ['id','title','duration','genre']
  },
  theaters: {
    title: 'Theaters',
    fields: [
      {key:'name', label:'Name', type:'text', required:true},
      {key:'location', label:'Location', type:'text', required:true}
    ],
    list: ['id','name','location']
  },
  showtimes: {
    title: 'Showtimes',
    fields: [
      {key:'movie_id', label:'Movie ID', type:'number', required:true},
      {key:'theater_id', label:'Theater ID', type:'number', required:true},
      {key:'show_time', label:'Show Time', type:'datetime-local', required:true}
    ],
    list: ['id','movie_id','theater_id','show_time']
  },
  bookings: {
    title: 'Bookings',
    fields: [
      {key:'user_id', label:'User ID', type:'number', required:true},
      {key:'showtime_id', label:'Showtime ID', type:'number', required:true},
      {key:'seats', label:'Seats', type:'number', required:true}
    ],
    list: ['id','user_id','showtime_id','seats']
  },
  payments: {
    title: 'Payments',
    fields: [
      {key:'booking_id', label:'Booking ID', type:'number', required:true},
      {key:'amount', label:'Amount', type:'number', required:true},
      {key:'status', label:'Status', type:'text'}
    ],
    list: ['id','booking_id','amount','status']
  }
};

function setLog(data){
  try { logEl.textContent = JSON.stringify(data, null, 2); }
  catch(e){ logEl.textContent = String(data); }
}

function tabButton(key, title){
  const b = document.createElement('button');
  b.textContent = title;
  b.onclick = () => showResource(key);
  b.id = `tab-${key}`;
  tabs.appendChild(b);
}

Object.entries(resources).forEach(([k, v]) => tabButton(k, v.title));

function clearActive(){
  [...tabs.children].forEach(b => b.classList.remove('active'));
}

function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}

async function api(resource, action, payload = null, query = ''){
  const url = `${resource}/${action}.php${query ? '?' + query : ''}`;
  const opts = { method: 'GET' };
  if (action === 'create' || action === 'update'){
    opts.method = action === 'create' ? 'POST' : 'PUT';
    opts.headers = {'Content-Type':'application/json'};
    opts.body = JSON.stringify(payload || {});
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(()=>({ raw: 'Non-JSON response' }));
  setLog({url, ...data});
  return data;
}

function buildCreateForm(key){
  const cfg = resources[key];
  const form = el('div', {class:'card'});
  form.appendChild(el('h2', {}, [ `Create ${cfg.title.slice(0,-1)}` ]));
  const grid = el('div', {class:'grid'});
  cfg.fields.forEach(f => {
    const w = el('div', {}, [
      el('h3', {}, [f.label]),
      el('input', {type:f.type, id:`${key}-${f.key}`, placeholder:f.label})
    ]);
    grid.appendChild(w);
  });
  form.appendChild(grid);
  const actions = el('div', {class:'controls'}, [
    el('button', {class:'primary', onclick: async ()=>{
      const payload = {};
      cfg.fields.forEach(f => { payload[f.key] = document.getElementById(`${key}-${f.key}`).value; });
      const resp = await api(key, 'create', payload);
      loadList(key);
    }}, [ 'Create' ]),
    el('button', {onclick: ()=>{
      cfg.fields.forEach(f => { document.getElementById(`${key}-${f.key}`).value=''; });
    }}, [ 'Clear' ])
  ]);
  form.appendChild(actions);
  return form;
}

async function loadList(key){
  const tableWrap = document.getElementById(`list-${key}`);
  if (!tableWrap) return;
  const data = await api(key, 'read_all');
  const rows = Array.isArray(data) ? data : (data.rows || []);

  const table = el('table');
  const thead = el('thead');
  const trh = el('tr');
  resources[key].list.concat(['actions']).forEach(h => trh.appendChild(el('th', {}, [h])));
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = el('tbody');
  rows.forEach(r => {
    const tr = el('tr');
    resources[key].list.forEach(col => tr.appendChild(el('td', {}, [String(r[col] ?? '')])));
    const actions = el('td');
    const delBtn = el('button', {class:'warn', onclick: async ()=>{
      await api(key, 'delete', null, `id=${r.id}`);
      loadList(key);
    }}, [ 'Delete' ]);
    const editBtn = el('button', {onclick: async ()=>{
   
      const payload = { id: r.id };
      resources[key].fields.forEach(f => {
        if (f.key === 'password' && key === 'users') return; 
        const val = prompt(`Update ${f.label}`, r[f.key] ?? '');
        if (val !== null) payload[f.key] = val;
      });
      await api(key, 'update', payload);
      loadList(key);
    }}, [ 'Edit' ]);
    actions.appendChild(editBtn);
    actions.appendChild(document.createTextNode(' '));
    actions.appendChild(delBtn);
    tr.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  tableWrap.innerHTML = '';
  tableWrap.appendChild(table);
}

function buildReadSingle(key){
  const box = el('div', {class:'card'});
  box.appendChild(el('h2', {}, [ `Read Single ${resources[key].title.slice(0,-1)}` ]));
  const row = el('div', {class:'controls'}, [
    el('input', {type:'number', id:`single-${key}-id`, placeholder:'ID'}),
    el('button', {onclick: async ()=>{
      const id = document.getElementById(`single-${key}-id`).value;
      if (!id) return alert('Enter an id');
      await api(key, 'read_single', null, `id=${id}`);
    }}, [ 'Fetch' ])
  ]);
  box.appendChild(row);
  return box;
}

function buildSection(key){
  const wrap = el('div');
  wrap.appendChild(buildCreateForm(key));
  wrap.appendChild(buildReadSingle(key));

  const listCard = el('div', {class:'card'});
  listCard.appendChild(el('h2', {}, [ `${resources[key].title} List` ]));
  listCard.appendChild(el('div', {id:`list-${key}`}, [ el('div', {}, ['Loading...']) ]));
  wrap.appendChild(listCard);

  loadList(key);
  return wrap;
}

function showResource(key){
  clearActive();
  const active = document.getElementById(`tab-${key}`);
  if (active) active.classList.add('active');

  content.innerHTML = '';
  const section = el('div');
  section.appendChild(buildSection(key));
  content.appendChild(section);
}


showResource('users');
document.getElementById('tab-users').classList.add('active');
