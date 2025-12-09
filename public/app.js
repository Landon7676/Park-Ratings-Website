// app.js — frontend logic
const api = (path, opts = {}) =>
    fetch('/api' + path, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
    }).then(r => r.json());

const parksEl = document.getElementById('parks');
const detailsEl = document.getElementById('details');
const parkForm = document.getElementById('park-form');
const editParkForm = document.getElementById('edit-park-form');
const parkDetailsSection = document.getElementById('park-details');
const parksListSection = document.getElementById('parks-list');
const backBtn = document.getElementById('back');
const addParkModal = new bootstrap.Modal(document.getElementById('add-park-modal'));
const editParkModal = new bootstrap.Modal(document.getElementById('edit-park-modal'));

// Filter inputs
const searchInput = document.getElementById('searchInput');
const cityFilterInput = document.getElementById('cityFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Keep a copy of all parks for filtering
let allParks = [];

// MOCK DATA for testing without backend / DB (optional; not used by loadParks now)
const MOCK_PARKS = [
    {
        id: 1,
        name: 'Central Park',
        city: 'New York',
        description: 'Big city park with lots of trees.',
        imageURL: '',
        avg_rating: 4.5,
        reviews_count: 12
    },
    {
        id: 2,
        name: 'Campus Green',
        city: 'Dearborn',
        description: 'Small but nice campus park.',
        imageURL: '',
        avg_rating: 4.0,
        reviews_count: 5
    },
    {
        id: 3,
        name: 'Riverside Park',
        city: 'Ann Arbor',
        description: 'Park near the river with walking trails.',
        imageURL: '',
        avg_rating: 3.8,
        reviews_count: 8
    }
];

function escapeHtml(str) {
    if (typeof str !== 'string') {
        return '';
    }
    return str.replace(/[&<>"']/g, function (match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}

function renderParks(parks) {
    parksEl.innerHTML = '';

    if (!parks.length && allParks.length) {
        parksEl.innerHTML = '<p class="text-center text-muted">No parks match your filters.</p>';
        return;
    }

    if (!parks.length && !allParks.length) {
        parksEl.innerHTML = '<p class="text-center">No parks yet. Add one!</p>';
        return;
    }

    const placeholder =
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_16a3784a229%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_16a3784a229%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2299.421875%22%20y%3D%2296.3%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';

    parks.forEach(p => {
        const parkCard = document.createElement('div');
        parkCard.className = 'col-md-4 mb-4';
        parkCard.innerHTML = `
            <div class="card park h-100">
                <img src="${escapeHtml(p.imageURL) || placeholder}" class="card-img-top park-image" alt="Park Image">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(p.name)}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(p.city || '')}</h6>
                    <p class="card-text">${escapeHtml(p.description || '')}</p>
                    <p class="card-text mt-auto">
                        <span class="badge bg-primary">⭐ ${Number(p.avg_rating).toFixed(1)}</span>
                        <span class="ms-2">${p.reviews_count} reviews</span>
                    </p>
                    <button data-id="${p.id}" class="btn btn-secondary view mt-2">View Details</button>
                    <button data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-city="${escapeHtml(p.city || '')}" data-description="${escapeHtml(p.description || '')}" data-imageurl="${escapeHtml(p.imageURL || '')}" class="btn btn-warning edit-park-btn mt-2">Edit</button>
                </div>
            </div>
        `;
        parksEl.appendChild(parkCard);
    });

    document
        .querySelectorAll('.view')
        .forEach(b => b.addEventListener('click', e => openPark(e.target.dataset.id)));

    document.querySelectorAll('.edit-park-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const parkId = e.target.dataset.id;
            const parkName = e.target.dataset.name;
            const parkCity = e.target.dataset.city;
            const parkDescription = e.target.dataset.description;
            const parkImageURL = e.target.dataset.imageurl;

            document.getElementById('edit-park-id').value = parkId;
            document.getElementById('edit-name').value = parkName;
            document.getElementById('edit-city').value = parkCity;
            document.getElementById('edit-description').value = parkDescription;
            document.getElementById('edit-imageURL').value = parkImageURL;

            const editModal = new bootstrap.Modal(document.getElementById('edit-park-modal'));
            editModal.show();
        });
    });
}

function applyFilters() {
    if (!allParks.length) {
        renderParks([]);
        return;
    }

    const search = (searchInput?.value || '').toLowerCase();
    const city = (cityFilterInput?.value || '').toLowerCase();

    const filtered = allParks.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const parkCity = (p.city || '').toLowerCase();

        const matchesSearch =
            !search ||
            name.includes(search) ||
            desc.includes(search);

        const matchesCity =
            !city ||
            parkCity.includes(city);

        return matchesSearch && matchesCity;
    });

    renderParks(filtered);
}


async function loadParks() {
    parksEl.innerHTML =
        '<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    try {
        const parks = await api('/parks');
        allParks = parks || [];
        applyFilters();
    } catch (err) {
        console.error('Error loading parks:', err);
        parksEl.innerHTML = '<p class="text-center text-danger">Error loading parks.</p>';
    }
}

parkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(parkForm);
    const body = {
        name: fd.get('name'),
        city: fd.get('city'),
        description: fd.get('description'),
        imageURL: fd.get('imageURL')
    };
    try {
        await api('/parks', { method: 'POST', body: JSON.stringify(body) });
        parkForm.reset();
        addParkModal.hide();
        loadParks();
    } catch (err) {
        alert('Error adding park');
    }
});

editParkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(editParkForm);
    const id = fd.get('id');
    const body = {
        name: fd.get('name'),
        city: fd.get('city'),
        description: fd.get('description'),
        imageURL: fd.get('imageURL')
    };
    try {
        await api(`/parks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        editParkForm.reset();
        editParkModal.hide();
        loadParks();
    } catch (err) {
        alert('Error editing park');
    }
});

async function openPark(id) {
    try {
        const { park, reviews } = await api(`/parks/${id}`);
        parksListSection.classList.add('hidden');
        parkDetailsSection.classList.remove('hidden');

        let reviewsHtml = '<h4 class="mt-4">Reviews</h4>';
        if (reviews.length) {
            reviews.forEach(r => {
                reviewsHtml += `
                    <div class="review card mb-3">
                        <div class="card-body">
                            <p class="card-text">${escapeHtml(r.comment)}</p>
                            <p class="card-text"><small class="text-muted">Rating: ${r.rating}/5</small></p>
                            <button data-id="${r.id}" class="btn btn-danger btn-sm delete-review-btn">Delete</button>
                        </div>
                    </div>
                `;
            });
        } else {
            reviewsHtml += '<p>No reviews yet.</p>';
        }

        const placeholder =
            'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_16a3784a229%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_16a3784a229%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2299.421875%22%20y%3D%2296.3%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
        detailsEl.innerHTML = `
            <div class="card">
                <img src="${escapeHtml(park.imageURL) || placeholder}" class="card-img-top park-image" alt="Park Image">
                <div class="card-body">
                    <h2 class="card-title">${escapeHtml(park.name)}</h2>
                    <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(park.city || '')}</h6>
                    <p class="card-text">${escapeHtml(park.description || '')}</p>
                    <button data-id="${park.id}" class="btn btn-danger delete-park-btn">Delete Park</button>
                </div>
            </div>
            ${reviewsHtml}
            <hr>
            <h5>Leave a Review</h5>
            <form id="review-form">
                <input type="hidden" name="park_id" value="${park.id}">
                <div class="mb-3">
                    <label for="rating" class="form-label">Rating</label>
                    <select class="form-select" id="rating" name="rating" required>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                        <option value="1">1</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="comment" class="form-label">Comment</label>
                    <textarea class="form-control" id="comment" name="comment" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Review</button>
            </form>
        `;

        document.querySelectorAll('.delete-review-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const reviewId = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this review?')) {
                    try {
                        await api(`/reviews/${reviewId}`, { method: 'DELETE' });
                        openPark(id); // Refresh park details and reviews
                    } catch (err) {
                        alert('Error deleting review');
                    }
                }
            });
        });

        document.querySelector('.delete-park-btn').addEventListener('click', async (e) => {
            const parkId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this park? This will also delete all reviews for this park.')) {
                try {
                    await api(`/parks/${parkId}`, { method: 'DELETE' });
                    parkDetailsSection.classList.add('hidden');
                    parksListSection.classList.remove('hidden');
                    loadParks();
                } catch (err) {
                    alert('Error deleting park');
                }
            }
        });

    } catch (err) {
        detailsEl.innerHTML = '<p class="text-danger">Error loading park details.</p>';
    }
}

backBtn.addEventListener('click', () => {
    parkDetailsSection.classList.add('hidden');
    parksListSection.classList.remove('hidden');
    loadParks();
});

// Wire up filter inputs
if (searchInput && cityFilterInput && clearFiltersBtn) {
    searchInput.addEventListener('input', applyFilters);
    cityFilterInput.addEventListener('input', applyFilters);
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        cityFilterInput.value = '';
        applyFilters();
    });
}

// Initial load
loadParks();
