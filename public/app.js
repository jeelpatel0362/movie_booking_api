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
  return await res.json().catch(()=>({ error: 'Invalid response' }));
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

function showLogWithImage(message, imageUrl) {
  const logDiv = document.getElementById("log");
  
  // Clear previous content
  logDiv.innerHTML = "";

  // Add message
  const msg = document.createElement("p");
  msg.textContent = message;
  logDiv.appendChild(msg);

  // Add image
  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Response Image";
    img.style.maxWidth = "100%";
    img.style.marginTop = "10px";
    logDiv.appendChild(img);
  }
}

// Example usage:
showLogWithImage("🎬 “Cinema is a matter of what’s in the frame and what’s out.”", "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFRUVFRUVFxcXGBgYFRUVFxUWFhgVFRcYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQFy0dHR0tLS0tLSstLSstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALQBGAMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAQIDBAUGBwj/xABGEAABAwIDBAcEBwYEBQUAAAABAAIRAyEEEjEFQVFhBhMicYGRoTJS0fAHFEJiscHhFSNTcpLSM0Oi8TSCg7LiFkSjwtP/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAArEQEBAAIBAwIEBQUAAAAAAAAAAQIREiExQQNRE2FxgRQiQmLwBDKhwdH/2gAMAwEAAhEDEQA/APLdi4E169OiHBpqPawEmAC4gSeV1pdK9gjCVupFenX7IJdSkta64yk7yIGnFc+FM10rLsjLUhar1KmCpHUGAfa9FNjFfIKHiQreIY3gVBZXbNiohWKtMaqIkKs6MCVyWUBURolOcklEIClciUqBkolLKJRACglAKCiklEoRKIUFBKAkQEolCECyiUJJQEolCUBABCEoRSKaiLpgUgdChHoX0d4qhTxDDXPYBEg3Xon0idKsG+kKdJ4MXLmtgchxXgFLFEJ9XHuO9Z41va/tStmdIIhCx+uQro3FgKxTCga1WKRUbdL0d2T1hA1JXUba6CVGUesyEDeud6L7VFJwnivWtpdPsM/CuZBzFuWN08Vi0rwPHYUgkKkcP3ea3dquDnEhZxwbuHqB+K1KmlEU90jzVetQhXX4U8v6h8Urm5hBIndeVdpYzCzmmhT1aJGpHmoSzmFpgOamQpWcJUZagbCc0JI5pWKoZCE54umoABK5ASuCBiEqAEQqanOTUUqAEQnFA0oQlAQAalT4hJHNFNgJzQgNSiyDY2T0dr16b6tOk9zKftuDSWt33Og4rMxFODC6HYXTbE4ShVw9FwbTrAh4LQdW5SRIsS2093ALmq1SVItMKaSgpFWSgoSBKiNMBPaoA5PBWXXa3Sr5VY+tmIlZwUoKml21tnszFd8/oBUdgziLERmA35RvXm2CxOU2XbYbp3X+rnDh3YIjnG8TwWKrjMVg4NyB5/kFnvpAH2h6/Bdvgdg1MUHFlNzouSLkLmto4Hq3FrmmRz/RWVKzK1PMOYVB7Oa0KpAMgHz/AEUFdgIzDxW4zVOE5zZEpD3J1M7lWUUICfUbB0TPBUK8Jiliyj8ECN1SvSt1S1AiI0rQjwT2BAxyRL4IjkgVo3pCU91tE2OSBFK1sXSU28k+53KKbY8VI2mDpKnoUCT7P4ruqPQWqMF9bIaKZ3zeJiY4Spa1I5bZPRupXo16zHU4w7c72OfFQsFy5jPtARdYdRX8c0Ax896oOSJUaQlOIRC0yakTkiBAhASoi8FIFCHJTWgrLacJ6hY8HRPzI0larNKpEKm1ymaobekdB+nH1NrhkDg+ONiNPxTMBg6uOruNMdpxLrRbf4LE6B7Gr4is4UGUKjqbC8sxGbq3CQ37N5GadRovSqu3TgXt/dUQ8MDX9WzKzNAzZQItMwSJWbiu3lXSvZtehUcyqTI3f7Lly4g7yvWdt/SBSqOJrYOg8kRmdTY5x8XNt5rFwOymY97zhcFLmAFwEBgzEwcryGnQ8dEibeePoE3bfkJkeCgLTxK9a/8AQuLERggeYNFpHfBH5qvivo3xb7/VXMPEVKfqM61tl5o2jnFjcboue5VnMPP58V6OPoyx4NqGmh62mP8A7JMX9GuOcJ+rw7lUpQe/tq7HnmHEmJ1+eKie2DEn58V3J+jTaIv1H/yUv7k7G/R5j3QRh4Oh/eUo7/bTlDThGtuL7/nen4lkHwXWt+j3HgiaG/36f9yMZ0FxxdIoGP56f9ycoacZHNTVGZWgbyuoodBcaDLqBgffp/3JtfoTjyZ6j/XT/uTlDTk1MynAzHwHFdRR6DY0XNAk7hnpx3ntJ1ToRj3X+r/66X9ycoacgVIyjvNh3hdjS6CY0X+r5jzfSAHhnupx0K2gf/bgf89I+mdOUNOHc6e5W8DhcxG4HfK7Gn0ExoM/VQe+pRHo1yo19r1cJVdScxrKlMwRDTBgEXFjYgqb32G5tvoVUwdClWeWxUEgAydJv4ELJxPTCv1Aw/WHqgZDZt5J2L6Z4iuGCo7Pks3MAY7rK5s+pWxk0XVS3OC0GLAnQkDVSRduGxNbMVXLVqdINkuwuIqUHOD3UyAXAQCS0G096zHLaGEJhT3JhVQ0pEpKRGQEICEErSllNGqlNPgVGokoaKQlMZYJHFFTsKna5UA9TmrCi7d19GO2Pq+MDps9jqZ8Yj1AWx0txeeo4rzzZmKhwI1C6XG4vOJ4hEc9tV116z9Bg7eL/lofjVXkG0nXXr/0EXfi/wCWh+NZC9nrOVNLVMU0hGFdzFA9ituULws1VGoxVqlNX6irVAs1qM+pTVaowLQqdyq1SY4d8fFZVUNNN6lTuY73vQJonv8AH4BBGKSmbQSgAdotE6TF721IVim7iCPEfFAxlBTsoJ7QD+n6KOtiSIADp7h+aomFBfPH0oMy7TxI+8z1oUivoOlVrH/LEcyPyXz/APSuD+1MTIAJNIwLj/h6S3h3Rz+DK63o1i+rcHcFyGCK1aVeGnuW0VukeLNXEVKh1cZWS4qTGVO0q7nKgJTUShENKEpQQiGhCUIVFgBSSITEErLR8ppQEiBpTpSwpaYQifA2E8Vt0q0tWLTKvUX2UVV2k+69U+hDaTKb8TmeAXHDgA6u/wAaYHISfBeTbRMld79EmDD6mIqS4upChlyuYJzmsCDnIERzmESvcdp7bYzMwDM+B2biQ4G4MQVSwnSGa3UOblIYIn7RhrpB0gtM94IXO43aTadRlao5rMrMhYxoqVKkz2S4OHZE2gWMlXdnUDi6f1gHIcuVupcMoLSIc1pHam+htqFNo1mdKKOZrHZw57Q5gy/4n2Tl8QdYtdU8T0mDntZTHtudTJd7THNIBsJB1tdYuIc2jUp1XuYHhmSLOysBBLAGHsmYuedimDZLs7cRTY2ZpPJmA/K10kZgMuaRvUVtVuk9JrnMJBc1+Q7rgHM7fNwmN6RU3Am9gZ0IzBuaBF41vG5cVturTdUD25Qcxc8tkudmBzAmMoiYHdpdQ4zBtfVFOkeqlsl7nmJghzBa7spFucqaHXv6RtFR7X2aOrym9y+Nd0CbkaLKx+289N9Nrg5xBc62jM2UDXXNafum17czjSTQa7rWtqsFQGlEuJBytAgxdrfUKH6tRo9UWvd+8dlqzLYYHNgSQBGpkcE0rp6m181OjJyuqPaGi8dl4ae6WytehtGZiT7VjEiHZfxXEVcNlZhn2LqdR5eacvGTMCwEjQDM835orYrrHhkjK/NMl4H+I9zfZBjXhNxyU0Ovp7UuHFwLWvM3i7Q61+YCc/aOag97HFxyvykFw9ka8lyNWi4ODX1Orcy2rurcC2CScvtQZ3XnRWMFWBpsph7WNYQc3WgF7gWz2SBDd/kmjboeju22Pw4LiX1GgB2pJccxaCeJj8Fpv2m0PDMvacC7SdI13zfguQ2rh2uruqU8SKLiGmpMOa8hoHZa24iN/Hgomu6us6oMc2/ZI6uo8Q4NMNdGlhfv0V0O8O1iJs0RPZ36Tfh+h4Lwv6VK2faNV1rikbcqTR+S65u1ACSKlIFx7TnMrBxMntE5IPG3ErgOm7mnFOcyoKgLWkuALQXEEuABANjbRaxiMzBlW3vsqOFKne5aFXEiVA4Ky8qJwVRGAhKgoEQhIgAhCERYlIkKFGjkJJQgcCpWlQgqQFBZY5WKblTYVM1yghx7rrtvovIzYjT/ACRf/q2XB45y2uhrn56gZWNKcmhIn2uBvEnzVvYexnMN3qmuruaHHKIGt4sBN1zjdoVqftYxzuWRjvUMJVPau16tVmUPJnW2UEEEHQArA6CptdkNP2XuyA5gBME8NLeqz9qbbFOrRpBgcajy11/ZgDS1/aHkuP8AqrwAARAOYCTrb4BQ4nD1HOzEyeM9wEcLADwTQ6/Zm1uvFTsZclV9M3M2dYlsW7JG/WVNVc3h6rjNnvq0XOc2O0ZcM1nGZvb5krSdtur/AAR4O/RNDXc7l6qKuJGixzt10/4Te4Ok/gonbXMEOBEzqLC1gCPm6aGsaQ4gKRlON49FzlHG3Bd2uU/jfuW5SqyAYF9155bkFtpG8t8gndYBoR4D4Ks15G4BRF45eagvHEmIlwHjCjsftHyVEvtEj+opW1ufrI/FUXh/NPkuF6Y/8Sf5WfgV1Zqu/Bcd0ncTWk+4381rHuKWE1WgcIXvaxgAJ94hrQb6udYDvWXh3QVY2pUmPD81RG9piSDHNRFWsSbHvH/aqhVQiRCECIQkQAQgIREpQkQilSpEiByeCo04FFStKkDlA0p0qKHtnUwp8LLJh7bxry8eaiwjmio3rPYntTOngonuueEmO6UNNini6g0qtHdm/uUox9b+O31/uWFmUrZTSSbbP7Qq/wAZn9P/AJJrsbV/jM/p/VZIBlBCi8Wk7FVP4zfL9VC+o461WnvH6qkW77FJkPJDjVoz/Eb/AE/qhtRw0qgdw/VVGtlGQzCpxXevdvqNPe385lSU8dUb7NYDkAY9Ss5zCg0z8yhxraG3K2+ow97PgUz9r1ffZr7p8tVkNp8/x+CQN8E6HGtd+2Kp+2z+k/FRP2pUP22f0n4rNLP90OYfmU6Gq027aqiwcz+k/FZ+NxBqPzuLZgCwgQPFKyswUnD/ADM7S0x9mLjTRQuxbjbs3t7LfgiWI9DZFd8gJiJjmqiZ1aRHGPRRykLgf958kIBIUIQCRCEAEICEQ8oV5uHZvI/1JTh8twQ5sxzHes8nb4VUQnZDwV4OadWDwJCKhymBpqNNE2vwvmptokpwp+HerNS4BAvpYa8LDxSnDPI9h0jkfgm2vhzwrlnyEReFpjYzyLupg6wXgEcirLtlU2NBeC47yyo2J7gDAWeUdJ6OV8aYRplwtqEynRJ5d9l1dPCtc3NSowQYlxF+4mLqcYExmcypMXDHNy+RklTm1+E35cszDePddTfVzvEen4repspOtSpHNwJJkDXQhSN2WTdzagB+y0T6k2U5uk/p/Zzhp7vnvmU5tD5t8V0Dm0m9locHcDmE/wCopW7Pc6HOD4sQLZhxBJIsnJfw7nRRk6iB87yn1aECZ+fNdI9jGAdktGgkSB3w+yrOw2d1wYBkgRcyQGyY4HwKclvoa+rGo4SwuPMfFMdh4qZZi2u6PNdOCPcd8/8AMqOKpDrmuAtkB035ju1lJkZehJIza2AlphzSRcARJjhdMwmHDhqB3wPxK6VlYD5H/wCizHUeqfLPZOl9Pukg9+/SFJkuXoyWVl1sHkMzLTvBBg8CAVM/Z4IkPaD3tHgbrdbiGvbDhIO4kCe6XT4qsKRZek6Rc5S4E+hunKnwMZ84xqeHE5XwD4ERuvefBNqYNo0e1w1i+bwkQts4wPhrmZz4Dy4eaU0ngdgERoC4EK8k+DL26udfhGOE5sp+dQGqnVwjhp2uYB/MLpajTP7xhzcgNO+6QUhFql/vOn0AWpk5Zf08rluqPBSjgt9+GOWSA+fd/H2bqt+zmkGxZulxPwV5OX4ezsyWtF9yQs7yVeOzjoHtJ5E39FD9UqAHsm/JXbF9OzwqupRe6Zl4KxkLScwg8wm5yTCu2LjEBCRWCQNAmgZuQ3ptnihCFOWt+QUK7Tiv4bBue6LNA1c6zR8fBaLNkWI66lBHF2uoOidjcG4mWxxjMLHkqtCs1ntszO4GwHhvK47t7PoTDHHpYlZsQyP3tNw3hpId3CRCtF1CwOHBi3tPn8VFT2jSkfuBPLX0WhkJucMe/MJ/7lLb5dMccf0/9/0mw2FpjRtOmSIkVXZ2+chRNw9Wb4hsb4qXjks/E7NqTLWOjhIMeqXDbOcJNRj4H2WxJ7zuCn3b5eOK7j6zJAqUs0aHrCZH829PwWIDhlptdTA3h4ABPGdSqLq+HjKW1RB4tkeYSOq4cgD96N+rdfJNHPrvcaDG1yRNZsb+2DbuTauDptOftmDMNew+g3LLr4N1iwPc06HKZ9E7B4Z+aXB7Wi57Jk8gN5TScuurF47Sbo1xBPFrI7jDUgo1n2eAAd/YaR4SD4JnV0Qc2SsN+n/ioT9X96r5j4Iu75v+WiygWiB1gPvZqWaOGtgqlfEFpympVa77xBHoqmIotjNTc4gag6jnZNpsdUbAuWkQeRsZPDQq6ZuXiJ6LnPJBkuktdxgg3PGCFcOcWDao7gy5jU63Vc9UJE1JMSWiJgRw0+KYG0uNb0+CLOiw9z4v1oHMNI8QAiueyDvyxy1nvi6gDW/Ye9rt2Y2PLRPqSWmwAOUcwTIPhr5KLvoWiSRIc6P+m0HuBvClykiCSQfvU/NUWUmG73Ok6NbuG5TjB0/dreX6ITf8qrimPpkugawDYiPyP6qWjjLhvac77uUCeVlZp0GCRkqkHjpxnRUa+AeyYDiDoYMxqZ4FXuxZlj1i7VYHe0DPHPTB7rKs+hUbam8AcMwmefFVMMwaunKPMngrYq0f4fqfir2N8uvb+fRH9eLLPLy7f2oA5J7Hsf2skcy+J9FZbQY+4oE2iZOnmosZswuEsplpG6bEcpOqnReOX1QVw+ZbVAHAuNuVgm1Kpa2T+84nOfw4Io7Iqz2mGO8eWqmrnqzDqLRPEAyO/eqxq970UGYsEw2mJP3ikqUjue0csxMeitjFgaU2eQSOwhqiW0wDuIgDuPFXbHG2d9qr2NiJa7vJ1VN1QA+w2VfGxK3uj+pvxVsbJeNKbe8kEq7kZ+Hnl419mH1ANy7LO6JR1bQIz+i1MXQey7qbY4iCO5UqlQGxaPCysrnlhMVN9PgZQrOHwT3m0RxNkK7jE9LK9ZGi3CVgfZd8+KXFYOoYdkM6G3qo/r7+KcNoP4rn1er8mtdUNJzqd4IdoJFwN8fPFL9cf7xUzq+cQVRcIMKs3p2vRaGNf7xTm45/vKPCZR2nCQNBxPPkFfG1+DWx3BS/RrG++WlXFdoZ9+hTMK8N7ZExEA6Fx490T5K9+1/ut8kn7VHuN8gnX2WzHe9ojter7ycNsVfeUg2mDYtHkFUxdMe00QN4TU9lty1uZbWRter7ybiHdY3PvGvcqAKu4KqG5i7SIjiTuTWiZ3LpaMDd0QYIIPdCst2k5nZptho0tc8zzUf7WO6ycNrFTXyalk7ZH/tipwHkl/a7+Sb+1SlG1Cpr5Ncv3HtxfWdl410PAptWc0RaxJ3DUEeZJQ6HjM2zhfvSYuoS1xbEENnjJkD1lFvbqipVsvb1c4mOTdE8bQeoqrO3lH2QG+Qv+asU8axlg0HmQqmNvvoo2i/intx7ko2mPdHkE9u0x7oU+zpL+5S2gQQHgRJOb+aNfEfgq1FsnuutsbS5JKj2VBlIAJ0PNNs305buVQGJdxThiX+8VDEEg6iyUFVN1ap1ah0k9wKdVp1HtLXNJ3ixsdyKOOIEBTt2iVHSas61jt2fVP8Alu8lfp4WsLBpA7x8VcGOKeMYUtqY+njPLNruqNMOkfO5RHEu94rVq1Q8ZXCR6g8Qsaq2CRwKRnOXHtTnVyQQTINiCqdPZNV2gtOpICnlXaOIK1vXZz4zO/mQt2ZWFgB5hCujFlCzuunDD3rnixGRCF0eI+i26TFs7XgEITyt/tBZYdybkQhEGRAYhCBQ1XcI2QQdIKRCldMO6nlUtRvZaO8+Mx+SEKsTyjDE7IkQhDgxPDEIUai1ghDwnvEHLuNQDwDwR+KEKXu6/pV6fsvO8x6m6Y1iEIz7HtapGsQhGokaxT02pEKOmKPHt7Z5wfQKMt7JQhGb3p9Nima1CEah4apGMQhRuJadMFRYrBNLpk3A4fBCFIuU3DBs1nF3mPgp2YBvE+nwQhNpMYkGBbz+fBCEKbb1H//Z");


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
