/*
	Interactive recruiter profile (index.html): role lens, project filters,
	skills explorer, typed role line, impact counters and copy-to-clipboard.
*/
(function() {
	'use strict';

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function $all(selector, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(selector));
	}

	function setPressed(buttons, active) {
		buttons.forEach(function(b) { b.setAttribute('aria-pressed', b === active ? 'true' : 'false'); });
	}

	function hasToken(el, attr, token) {
		return (' ' + (el.getAttribute(attr) || '') + ' ').indexOf(' ' + token + ' ') !== -1;
	}

	// Role lens: highlight items relevant to the chosen role, fade the rest.
	var lensButtons = $all('[data-lens]');
	var pitches = $all('[data-pitch]');
	var lensItems = $all('.lens-item');
	var jobs = $all('details.job');

	function applyLens(role) {
		var active = role !== 'all';
		document.body.classList.toggle('lens-active', active);

		pitches.forEach(function(p) { p.hidden = p.getAttribute('data-pitch') !== role; });

		lensItems.forEach(function(el) {
			var match = active && hasToken(el, 'data-roles', role);
			el.classList.toggle('match', match);
			el.classList.toggle('dim', active && !match);
		});

		// Open the roles that are relevant so recruiters see the detail immediately.
		if (active) jobs.forEach(function(j) { j.open = hasToken(j, 'data-roles', role); });

		try { localStorage.setItem('profile-lens', role); } catch (e) {}
	}

	lensButtons.forEach(function(btn) {
		btn.addEventListener('click', function() {
			setPressed(lensButtons, btn);
			applyLens(btn.getAttribute('data-lens'));
		});
	});

	// Allow sharing a tailored view, e.g. index.html?role=ml
	var initialRole = null;
	var match = /[?&]role=(\w+)/.exec(window.location.search);
	if (match) initialRole = match[1];
	if (!initialRole) { try { initialRole = localStorage.getItem('profile-lens'); } catch (e) {} }
	var initialBtn = lensButtons.filter(function(b) { return b.getAttribute('data-lens') === initialRole; })[0];
	if (initialBtn && initialRole !== 'all') {
		setPressed(lensButtons, initialBtn);
		applyLens(initialRole);
	}

	// Project filters.
	var filterButtons = $all('[data-filter]');
	var projects = $all('.project');
	var countEl = document.querySelector('.project-count');

	function applyFilter(tag) {
		var shown = 0;
		projects.forEach(function(p) {
			var visible = tag === 'all' || hasToken(p, 'data-tags', tag);
			p.hidden = !visible;
			if (visible) shown++;
		});
		if (countEl) countEl.textContent = 'Showing ' + shown + ' of ' + projects.length + ' projects';
	}

	filterButtons.forEach(function(btn) {
		btn.addEventListener('click', function() {
			setPressed(filterButtons, btn);
			applyFilter(btn.getAttribute('data-filter'));
		});
	});
	applyFilter('all');

	// Skills explorer: show where each skill was used.
	var skillButtons = $all('[data-evidence]');
	var evidenceEl = document.querySelector('.skill-evidence');

	skillButtons.forEach(function(btn) {
		btn.setAttribute('aria-pressed', 'false');
		btn.addEventListener('click', function() {
			setPressed(skillButtons, btn);
			evidenceEl.innerHTML = '';
			var name = document.createElement('strong');
			name.textContent = btn.textContent;
			evidenceEl.appendChild(name);
			evidenceEl.appendChild(document.createTextNode(': ' + btn.getAttribute('data-evidence')));
		});
	});

	// Typed role line.
	var typed = document.querySelector('.typed');
	if (typed && !reduceMotion) {
		var roles = typed.getAttribute('data-roles').split('|');
		var roleIndex = 0, charIndex = roles[0].length, deleting = true;

		var tick = function() {
			var delay;

			if (deleting) {
				charIndex--;
				delay = 45;
				if (charIndex === 0) {
					deleting = false;
					roleIndex = (roleIndex + 1) % roles.length;
					delay = 300;
				}
			} else {
				charIndex++;
				delay = 90;
				if (charIndex === roles[roleIndex].length) {
					deleting = true;
					delay = 2000;
				}
			}

			typed.textContent = roles[roleIndex].slice(0, charIndex);
			setTimeout(tick, delay);
		};

		setTimeout(tick, 2000);
	}

	// Impact counters animate once when scrolled into view.
	var counters = $all('[data-count]');

	function runCounter(el) {
		var target = parseFloat(el.getAttribute('data-count'));
		var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
		var suffix = el.getAttribute('data-suffix') || '';
		var start = null, duration = 1400;

		function step(ts) {
			if (start === null) start = ts;
			var t = Math.min((ts - start) / duration, 1);
			var eased = 1 - Math.pow(1 - t, 3);
			el.textContent = (target * eased).toFixed(decimals) + suffix;
			if (t < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	if (!reduceMotion && 'IntersectionObserver' in window) {
		var observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					runCounter(entry.target);
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.6 });
		counters.forEach(function(c) { observer.observe(c); });
	}

	// Copy email.
	var copyBtn = document.querySelector('[data-copy]');
	var copyStatus = document.querySelector('.copy-status');

	if (copyBtn) {
		copyBtn.addEventListener('click', function() {
			var text = copyBtn.getAttribute('data-copy');
			var done = function() { copyStatus.textContent = 'Copied ' + text + ' to your clipboard.'; };

			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(text).then(done, function() { copyStatus.textContent = text; });
			} else {
				copyStatus.textContent = text;
			}
		});
	}
})();
