// app.js — frontend logic
const api = (path, opts = {}) => fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());


const parksEl = document.getElementById('parks');
const detailsEl = document.getElementById('details');
const parkForm = document.getElementById('park-form');
const parkDetailsSection = document.getElementById('park-details');
const parksListSection = document.getElementById('parks-list');
const backBtn = document.getElementById('back');


async function loadParks() {
    parksEl.innerHTML = '<p>Loading...</p>';
    try {
        const parks = await api('/parks');
        if (!parks.length) { parksEl.innerHTML = '<p>No parks yet.</p>'; return; }
        parksEl.innerHTML = '';
        parks.forEach(p => {
            const div = document.createElement('div');
            div.className = 'park';
            div.innerHTML = `
<h3>${escapeHtml(p.name)}</h3>
<small>${escapeHtml(p.city || '')}</small>
<p>${escapeHtml(p.description || '')}</p>
<p>⭐ ${Number(p.avg_rating).toFixed(1)} • ${p.reviews_count} reviews</p>
<button data-id="${p.id}" class="view">View</button>
`;
            parksEl.appendChild(div);
        });
        document.querySelectorAll('.view').forEach(b => b.addEventListener('click', e => openPark(e.target.dataset.id)));
    } catch (err) {
        parksEl.innerHTML = '<p>Error loading parks</p>';
    }
}


parkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(parkForm);
    const body = { name: fd.get('name'), city: fd.get('city'), description: fd.get('description') };
    try {
        await api('/parks', { method: 'POST', body: JSON.stringify(body) });
        parkForm.reset();
        loadParks();
    } catch (err) { alert('Error adding park'); }
});


async function openPark(id) {
    try {
        const { park, reviews } = await api(`/parks/${id}`);
        parksListSection.classList.add('hidden');
        parkDetailsSection.classList.remove('hidden');
        detailsEl.innerHTML = `
<h2>${escapeHtml(park.name)}</h2>
<small>${escapeHtml(park.city || '')}</small>
<p>${escapeHtml(park.description || '')}</p>