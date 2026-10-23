(() => {
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('.site-nav');
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.querySelector('i').textContent = isOpen ? 'Close' : 'Menu';
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.querySelector('i').textContent = 'Menu';
    }));
  }
  document.querySelectorAll('.current-year').forEach((year) => { year.textContent = new Date().getFullYear(); });

  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    const params = new URLSearchParams(window.location.search);
    const requestedInterest = params.get('interest');
    const interestField = contactForm.querySelector('#interest');
    if (requestedInterest && interestField.querySelector(`option[value="${requestedInterest}"]`)) interestField.value = requestedInterest;
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formMessage = document.querySelector('#form-message');
      if (!contactForm.checkValidity()) {
        formMessage.textContent = 'Please complete the required fields, confirm the privacy notice and use a valid email address.';
        formMessage.style.color = '#9b3023'; contactForm.reportValidity(); return;
      }
      const values = new FormData(contactForm);
      const subject = `YCH enquiry: ${values.get('subject')}`;
      const body = [`Name: ${values.get('name')}`, `Email: ${values.get('email')}`, `Enquiry type: ${values.get('interest')}`, `Subject: ${values.get('subject')}`, '', 'Message:', values.get('message')].join('\n');
      formMessage.textContent = 'Opening your email app with this enquiry. Please review and send the email there.';
      formMessage.style.color = '#0b5f5a';
      window.location.href = `mailto:youthcareerhubtanzania@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const setupSimpleDirectory = ({ itemSelector, searchSelector, categorySelector, emptySelector, countSelector, label }) => {
    const items = [...document.querySelectorAll(itemSelector)];
    const search = document.querySelector(searchSelector);
    const category = document.querySelector(categorySelector);
    const empty = document.querySelector(emptySelector);
    const count = document.querySelector(countSelector);
    if (!items.length || !search || !category || !empty || !count) return;
    const update = () => {
      const term = search.value.trim().toLowerCase();
      const selectedCategory = category.value;
      const visible = items.filter((item) => {
        const matches = item.textContent.toLowerCase().includes(term) && (selectedCategory === 'all' || item.dataset.category === selectedCategory);
        item.hidden = !matches; return matches;
      });
      count.textContent = `${visible.length} ${label}${visible.length === 1 ? '' : 's'} shown`;
      empty.hidden = visible.length !== 0;
    };
    search.addEventListener('input', update); category.addEventListener('change', update); update();
  };
  setupSimpleDirectory({ itemSelector: '[data-programme]', searchSelector: '#programme-search', categorySelector: '#programme-category', emptySelector: '#programme-empty', countSelector: '#programme-count', label: 'programme area' });
  setupSimpleDirectory({ itemSelector: '[data-resource]', searchSelector: '#resource-search', categorySelector: '#resource-category', emptySelector: '#resource-empty', countSelector: '#resource-count', label: 'guide' });

  const setupEventDirectory = () => {
    const grid = document.querySelector('#event-grid');
    if (!grid || !window.YCHContent?.events) return;
    const events = window.YCHContent.events;
    const search = document.querySelector('#event-search'); const category = document.querySelector('#event-category'); const year = document.querySelector('#event-year'); const status = document.querySelector('#event-status'); const count = document.querySelector('#event-count'); const empty = document.querySelector('#event-empty'); const reset = document.querySelector('#event-reset'); const loadMore = document.querySelector('#event-load-more');
    let limit = 4;
    const addOptions = (select, values) => values.forEach(([value, label]) => { select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`); });
    addOptions(category, [...new Map(events.map((event) => [event.category, event.categoryLabel])).entries()]);
    addOptions(year, [...new Set(events.map((event) => event.year))].map((value) => [value, value]));
    addOptions(status, [...new Map(events.map((event) => [event.status, event.statusLabel])).entries()]);
    const filtered = () => events.filter((event) => {
      const haystack = `${event.title} ${event.categoryLabel} ${event.description}`.toLowerCase();
      return (!search.value.trim() || haystack.includes(search.value.trim().toLowerCase())) && (category.value === 'all' || event.category === category.value) && (year.value === 'all' || event.year === year.value) && (status.value === 'all' || event.status === status.value);
    });
    const render = () => {
      const results = filtered();
      grid.innerHTML = results.slice(0, limit).map((event) => `<article class="event-card"><a class="event-card-image" href="event.html?id=${encodeURIComponent(event.id)}"><img loading="lazy" src="${escapeHtml(event.cover)}" alt="${escapeHtml(event.coverAlt)}"><span>${escapeHtml(event.statusLabel)}</span></a><div class="event-card-copy"><p>${escapeHtml(event.categoryLabel)} <i>·</i> ${escapeHtml(event.year)}</p><h3><a href="event.html?id=${encodeURIComponent(event.id)}">${escapeHtml(event.title)}</a></h3><span>${escapeHtml(event.dateLabel)}</span><a class="text-arrow" href="event.html?id=${encodeURIComponent(event.id)}">View gallery <b>→</b></a></div></article>`).join('');
      count.textContent = `${results.length} ${results.length === 1 ? 'activity' : 'activities'} found`;
      empty.hidden = results.length !== 0; loadMore.hidden = results.length <= limit;
    };
    [search, category, year, status].forEach((input) => input.addEventListener(input === search ? 'input' : 'change', () => { limit = 4; render(); }));
    loadMore.addEventListener('click', () => { limit += 4; render(); });
    reset.addEventListener('click', () => { search.value = ''; category.value = 'all'; year.value = 'all'; status.value = 'all'; limit = 4; render(); search.focus(); });
    render();
  };
  setupEventDirectory();

  const setupEventDetail = () => {
    const target = document.querySelector('#event-detail');
    if (!target || !window.YCHContent?.events) return;
    const eventId = new URLSearchParams(window.location.search).get('id');
    const event = window.YCHContent.events.find((entry) => entry.id === eventId);
    if (!event) { target.innerHTML = `<section class="not-found-inline"><div class="shell"><p class="eyebrow"><span></span> ACTIVITY NOT FOUND</p><h1>This activity is not<br><em>available.</em></h1><p>It may not have been published, or the link may be incorrect.</p><a class="button button-dark" href="events.html">Return to activities <span>→</span></a></div></section>`; return; }
    document.title = `${event.title} | Youth Career Hub`;
    target.innerHTML = `<section class="event-detail-hero"><div class="shell"><a class="back-link" href="events.html">← All events &amp; activities</a><div class="event-detail-grid"><div><p class="eyebrow"><span></span> ${escapeHtml(event.statusLabel)} · ${escapeHtml(event.categoryLabel)}</p><h1>${escapeHtml(event.title)}</h1><p class="lead">${escapeHtml(event.description)}</p><dl class="event-meta"><div><dt>Date</dt><dd>${escapeHtml(event.dateLabel)}</dd></div><div><dt>Location</dt><dd>${escapeHtml(event.location)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(event.statusLabel)}</dd></div></dl><button class="share-button" id="share-event" type="button">Share this page <span>↗</span></button><p class="share-message" id="share-message" aria-live="polite"></p></div><div class="event-detail-cover"><img src="${escapeHtml(event.cover)}" alt="${escapeHtml(event.coverAlt)}"><span>Illustrative stock image</span></div></div></div></section><section class="event-story section-pad"><div class="shell event-story-grid"><div><p class="section-kicker">/ RECORD DETAILS</p><h2 class="display-heading">What belongs in<br>a <em>trusted record.</em></h2></div><div><p>This sample page proves the gallery and content structure. Before publishing a real activity, replace every sample field with confirmed information and ensure all participant photos are authorised.</p><ul>${event.activities.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></div></section><section class="event-gallery-section section-pad"><div class="shell"><div class="section-top"><div><p class="section-kicker">/ PHOTO GALLERY</p><h2 class="display-heading">Images with<br><em>context.</em></h2></div><p class="section-side-copy">Select a photo to view it larger. Captions and alt text are part of each image record.</p></div><div class="event-gallery">${event.photos.map((photo, index) => `<button class="gallery-thumb" type="button" data-photo-index="${index}"><img loading="lazy" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}"><span>View image ↗</span></button>`).join('')}</div></div></section>`;
    const dialog = document.querySelector('#gallery-dialog'); const image = document.querySelector('#gallery-image'); const caption = document.querySelector('#gallery-caption'); let index = 0;
    const showImage = (nextIndex) => { index = (nextIndex + event.photos.length) % event.photos.length; const photo = event.photos[index]; image.src = photo.src; image.alt = photo.alt; caption.textContent = photo.caption; };
    target.querySelectorAll('.gallery-thumb').forEach((thumb) => thumb.addEventListener('click', () => { showImage(Number(thumb.dataset.photoIndex)); dialog.showModal(); }));
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close()); dialog.querySelector('.dialog-prev').addEventListener('click', () => showImage(index - 1)); dialog.querySelector('.dialog-next').addEventListener('click', () => showImage(index + 1)); dialog.addEventListener('click', (clickEvent) => { if (clickEvent.target === dialog) dialog.close(); });
    const shareButton = document.querySelector('#share-event'); const shareMessage = document.querySelector('#share-message');
    shareButton.addEventListener('click', async () => {
      const payload = { title: event.title, text: 'Youth Career Hub activity page', url: window.location.href };
      try { if (navigator.share) { await navigator.share(payload); shareMessage.textContent = 'Sharing options opened.'; } else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); shareMessage.textContent = 'Page link copied to your clipboard.'; } else shareMessage.textContent = 'Copy the address from your browser to share this page.'; } catch { shareMessage.textContent = 'Sharing was cancelled or is unavailable in this browser.'; }
    });
  };
  setupEventDetail();

  const backToTop = document.querySelector('#back-to-top');
  if (backToTop) { const toggleBackToTop = () => { backToTop.classList.toggle('visible', window.scrollY > 500); }; window.addEventListener('scroll', toggleBackToTop, { passive: true }); backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); toggleBackToTop(); }
})();
