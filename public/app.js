// app.js — frontend logic
const api = (path, opts = {}) => fetch('/api' + path, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

const parksEl = document.getElementById('parks');
const detailsEl = document.getElementById('details');
const parkForm = document.getElementById('park-form');
const parkDetailsSection = document.getElementById('park-details');
const parksListSection = document.getElementById('parks-list');
const backBtn = document.getElementById('back');
const addParkModal = new bootstrap.Modal(document.getElementById('add-park-modal'));

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

async function loadParks() {
    parksEl.innerHTML = '<div class="d-flex justify-content-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    try {
        const parks = await api('/parks');
        if (!parks.length) {
            parksEl.innerHTML = '<p class="text-center">No parks yet. Add one!</p>';
            return;
        }
        parksEl.innerHTML = '';
        parks.forEach(p => {
            const parkCard = document.createElement('div');
            parkCard.className = 'col-md-4 mb-4';
            parkCard.innerHTML = `
                <div class="card park h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${escapeHtml(p.name)}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(p.city || '')}</h6>
                        <p class="card-text">${escapeHtml(p.description || '')}</p>
                        <p class="card-text mt-auto">
                            <span class="badge bg-primary">⭐ ${Number(p.avg_rating).toFixed(1)}</span>
                            <span class="ms-2">${p.reviews_count} reviews</span>
                        </p>
                        <button data-id="${p.id}" class="btn btn-secondary view mt-2">View Details</button>
                    </div>
                </div>
            `;
            parksEl.appendChild(parkCard);
        });
        document.querySelectorAll('.view').forEach(b => b.addEventListener('click', e => openPark(e.target.dataset.id)));
    } catch (err) {
        parksEl.innerHTML = '<p class="text-center text-danger">Error loading parks.</p>';
    }
}

parkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(parkForm);
    const body = { name: fd.get('name'), city: fd.get('city'), description: fd.get('description') };
    try {
        await api('/parks', { method: 'POST', body: JSON.stringify(body) });
        parkForm.reset();
        addParkModal.hide();
        loadParks();
    } catch (err) {
        alert('Error adding park');
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
                        </div>
                    </div>
                `;
            });
        } else {
            reviewsHtml += '<p>No reviews yet.</p>';
        }

        detailsEl.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h2 class="card-title">${escapeHtml(park.name)}</h2>
                    <h6 class="card-subtitle mb-2 text-muted">${escapeHtml(park.city || '')}</h6>
                    <p class="card-text">${escapeHtml(park.description || '')}</p>
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

        document.getElementById('review-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const body = {
                park_id: fd.get('park_id'),
                rating: fd.get('rating'),
                comment: fd.get('comment')
            };
            try {
                await api('/reviews', { method: 'POST', body: JSON.stringify(body) });
                openPark(id); // Refresh park details and reviews
            } catch (err) {
                alert('Error submitting review');
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

// Initial load
loadParks();
