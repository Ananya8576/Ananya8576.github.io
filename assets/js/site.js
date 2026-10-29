/*
	Profile interactions: theme toggle, role lens, project filters, skills
	inspector, impact counters, copy buttons and the hero k-means plot.
*/
(function () {
	'use strict';

	var root = document.documentElement;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

	function $(sel) { return document.querySelector(sel); }
	function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
	function hasToken(el, attr, token) { return (' ' + (el.getAttribute(attr) || '') + ' ').indexOf(' ' + token + ' ') !== -1; }
	function press(group, active) { group.forEach(function (b) { b.setAttribute('aria-pressed', String(b === active)); }); }
	function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
	function recall(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

	// Theme toggle
	var themeBtn = $('#theme-toggle');

	function isDark() {
		var t = root.getAttribute('data-theme');
		return t ? t === 'dark' : darkQuery.matches;
	}
	function syncThemeIcon() {
		themeBtn.innerHTML = '<svg><use href="#i-' + (isDark() ? 'sun' : 'moon') + '" /></svg>';
		themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
	}
	themeBtn.addEventListener('click', function () {
		var next = isDark() ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		store('theme', next);
		syncThemeIcon();
	});
	syncThemeIcon();
	if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeIcon);

	// Copy buttons
	function copyText(text, toastEl) {
		var ok = function () { toastEl.textContent = 'Copied ' + text; };
		var fail = function () { toastEl.textContent = 'Copy blocked here. Select it: ' + text; };
		try {
			navigator.clipboard.writeText(text).then(ok, fail);
		} catch (e) { fail(); }
	}
	$all('[data-copy]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			copyText(btn.getAttribute('data-copy'), $(btn.getAttribute('data-toast')));
		});
	});

	// Role lens
	var lensButtons = $all('[data-lens]');
	var pitches = $all('[data-pitch]');
	var lensables = $all('.lensable');
	var jobs = $all('details.job');
	var currentRole = 'all';
	var stacks = {
		all: ['Python', 'SQL', 'LLMs', 'NLP', 'Tableau', 'Spark', 'Docker'],
		ml: ['Python', 'LLMs', 'NLP', 'Computer vision', 'TensorFlow / Keras', 'Hugging Face', 'TypeScript', 'Docker'],
		ds: ['Python', 'R', 'SQL', 'Statistical modelling', 'Time series', 'Pandas', 'Tableau'],
		de: ['Python', 'SQL', 'SAS', 'Spark', 'Hadoop', 'PostgreSQL', 'AWS', 'Docker'],
		ba: ['Tableau', 'SQL', 'R', 'Python', 'Sisense', 'Data quality']
	};

	function count(selector, role) {
		return $all(selector).filter(function (el) { return role === 'all' || hasToken(el, 'data-roles', role); }).length;
	}

	function applyLens(role) {
		currentRole = role;
		var on = role !== 'all';
		document.body.classList.toggle('lens-on', on);
		pitches.forEach(function (p) { p.hidden = p.getAttribute('data-pitch') !== role; });
		lensables.forEach(function (el) {
			var match = on && hasToken(el, 'data-roles', role);
			el.classList.toggle('match', match);
			el.classList.toggle('dim', on && !match);
		});
		if (on) jobs.forEach(function (j) { j.open = hasToken(j, 'data-roles', role); });

		$('#fit-call').textContent = 'fit(role="' + role + '")';
		[['jobs', '.job', 'role'], ['projects', '.project', 'project'], ['skills', '.skills .chip', 'skill']].forEach(function (e) {
			var n = count(e[1], role);
			$('#ev-' + e[0]).textContent = n;
			$('#ev-' + e[0] + '-unit').textContent = e[2] + (n === 1 ? '' : 's');
		});
		$('#fit-stack').innerHTML = stacks[role].map(function (s) { return '<li>' + s + '</li>'; }).join('');
		if (window.kmeansFocus) window.kmeansFocus(role);
		store('role', role);
	}

	lensButtons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			press(lensButtons, btn);
			applyLens(btn.getAttribute('data-lens'));
		});
	});

	$('#share-view').addEventListener('click', function () {
		var url = 'https://ananya8576.github.io/' + (currentRole === 'all' ? '' : '?role=' + currentRole) + '#fit';
		copyText(url, $('#share-toast'));
	});

	// Projects filter
	var filterButtons = $all('[data-filter]');
	var projects = $all('.project');

	function applyFilter(tag) {
		var shown = 0;
		projects.forEach(function (p) {
			var visible = tag === 'all' || hasToken(p, 'data-tags', tag);
			p.hidden = !visible;
			if (visible) shown++;
		});
		$('#shown').textContent = shown + ' of ' + projects.length + ' shown';
	}
	filterButtons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			press(filterButtons, btn);
			applyFilter(btn.getAttribute('data-filter'));
		});
	});

	// Skills inspector
	var skillButtons = $all('[data-used]');
	function inspect(btn) {
		press(skillButtons, btn);
		var name = btn.textContent;
		$('#insp-call').textContent = 'skills.inspect("' + name + '")';
		$('#insp-name').textContent = name;
		var list = $('#insp-list');
		list.innerHTML = '';
		btn.getAttribute('data-used').split('|').forEach(function (item) {
			var li = document.createElement('li');
			li.textContent = item;
			list.appendChild(li);
		});
	}
	skillButtons.forEach(function (btn) {
		btn.setAttribute('aria-pressed', 'false');
		btn.addEventListener('click', function () { inspect(btn); });
	});
	if (skillButtons[0]) {
		var python = skillButtons.filter(function (b) { return b.textContent === 'Python'; })[0] || skillButtons[0];
		inspect(python);
	}

	// Impact counters (the final values are already in the HTML)
	if (!reduceMotion && 'IntersectionObserver' in window) {
		var counterObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				counterObserver.unobserve(entry.target);
				var el = entry.target;
				var target = parseFloat(el.getAttribute('data-count'));
				var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
				var suffix = el.getAttribute('data-suffix') || '';
				var start = null;
				(function step(ts) {
					if (start === null) start = ts;
					var t = Math.min((ts - start) / 1200, 1);
					el.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals) + suffix;
					if (t < 1) requestAnimationFrame(step);
				})(performance.now());
			});
		}, { threshold: 0.5 });
		$all('[data-count]').forEach(function (el) { counterObserver.observe(el); });
	}

	// Hero k-means plot
	var canvas = $('#kmeans');
	if (canvas && canvas.getContext) kmeansPlot(canvas, $('#kmeans-status'));

	function kmeansPlot(canvas, statusEl) {
		var ctx = canvas.getContext('2d');
		var blobs = [
			{ role: 'ml', label: 'ML / AI', color: '--c-violet', x: 0.28, y: 0.3 },
			{ role: 'ds', label: 'Data Science', color: '--accent', x: 0.7, y: 0.27 },
			{ role: 'de', label: 'Data Eng', color: '--c-teal', x: 0.3, y: 0.74 },
			{ role: 'ba', label: 'Analytics', color: '--c-amber', x: 0.73, y: 0.7 }
		];
		var K = blobs.length;
		var points = [], centroids = [], from = [], assign = [];
		var iter = 0, phase = 'move', phaseStart = 0, inertia = 0, focus = 'all';
		var colors = {}, W = 0, H = 0, visible = true;

		window.kmeansFocus = function (role) { focus = role; if (reduceMotion) draw(1); };

		function readColors() {
			var cs = getComputedStyle(root);
			['--c-violet', '--accent', '--c-teal', '--c-amber', '--ink', '--ink-3', '--line', '--surface'].forEach(function (k) {
				colors[k] = cs.getPropertyValue(k).trim();
			});
		}

		function gauss() {
			var u = 1 - Math.random(), v = Math.random();
			return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
		}

		function seed() {
			points = [];
			blobs.forEach(function (b) {
				for (var i = 0; i < 46; i++) {
					points.push({ x: b.x + gauss() * 0.075, y: b.y + gauss() * 0.075 });
				}
			});
			// Random, deliberately poor starting centroids so the iterations are visible.
			centroids = [];
			for (var k = 0; k < K; k++) centroids.push({ x: 0.35 + Math.random() * 0.3, y: 0.35 + Math.random() * 0.3 });
			from = centroids.map(function (c) { return { x: c.x, y: c.y }; });
			iter = 0;
			assignPoints();
		}

		function assignPoints() {
			inertia = 0;
			assign = points.map(function (p) {
				var best = 0, bestD = Infinity;
				for (var k = 0; k < K; k++) {
					var dx = p.x - centroids[k].x, dy = p.y - centroids[k].y, d = dx * dx + dy * dy;
					if (d < bestD) { bestD = d; best = k; }
				}
				inertia += bestD;
				return best;
			});
		}

		function updateCentroids() {
			var sums = centroids.map(function () { return { x: 0, y: 0, n: 0 }; });
			points.forEach(function (p, i) { var s = sums[assign[i]]; s.x += p.x; s.y += p.y; s.n++; });
			var shift = 0;
			from = centroids.map(function (c) { return { x: c.x, y: c.y }; });
			centroids = centroids.map(function (c, k) {
				var s = sums[k];
				if (!s.n) return points[Math.floor(Math.random() * points.length)];
				var n = { x: s.x / s.n, y: s.y / s.n };
				shift += Math.abs(n.x - c.x) + Math.abs(n.y - c.y);
				return n;
			});
			return shift;
		}

		// Match each centroid to a focus area (best of the 24 permutations) so colours stay stable.
		function matchBlobs(cs) {
			var best = null, bestCost = Infinity;
			(function permute(arr, used) {
				if (arr.length === K) {
					var cost = 0;
					arr.forEach(function (b, k) { var dx = cs[k].x - blobs[b].x, dy = cs[k].y - blobs[b].y; cost += dx * dx + dy * dy; });
					if (cost < bestCost) { bestCost = cost; best = arr.slice(); }
					return;
				}
				for (var b = 0; b < K; b++) if (!used[b]) { used[b] = true; arr.push(b); permute(arr, used); arr.pop(); used[b] = false; }
			})([], []);
			return best;
		}

		function resize() {
			var rect = canvas.getBoundingClientRect();
			var dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = rect.width; H = rect.height;
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		function draw(t) {
			var cs = centroids.map(function (c, k) { return { x: from[k].x + (c.x - from[k].x) * t, y: from[k].y + (c.y - from[k].y) * t }; });
			var map = matchBlobs(cs);
			var pad = 18;
			function px(x) { return pad + x * (W - pad * 2); }
			function py(y) { return pad + y * (H - pad * 2); }

			ctx.clearRect(0, 0, W, H);

			// Faint grid
			ctx.strokeStyle = colors['--line'];
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (var g = 0; g <= 8; g++) {
				var gx = Math.round(px(g / 8)) + 0.5, gy = Math.round(py(g / 8)) + 0.5;
				ctx.moveTo(gx, py(0)); ctx.lineTo(gx, py(1));
				ctx.moveTo(px(0), gy); ctx.lineTo(px(1), gy);
			}
			ctx.stroke();

			// Points
			points.forEach(function (p, i) {
				var blob = blobs[map[assign[i]]];
				var faded = focus !== 'all' && blob.role !== focus;
				ctx.globalAlpha = faded ? 0.18 : 0.8;
				ctx.fillStyle = colors[blob.color];
				ctx.beginPath();
				ctx.arc(px(p.x), py(p.y), 3.2, 0, Math.PI * 2);
				ctx.fill();
			});
			ctx.globalAlpha = 1;

			// Centroids and labels
			ctx.font = '500 12px "IBM Plex Mono", ui-monospace, monospace';
			ctx.textBaseline = 'middle';
			cs.forEach(function (c, k) {
				var blob = blobs[map[k]];
				var faded = focus !== 'all' && blob.role !== focus;
				var x = px(c.x), y = py(c.y);
				ctx.globalAlpha = faded ? 0.3 : 1;
				ctx.fillStyle = colors['--surface'];
				ctx.strokeStyle = colors[blob.color];
				ctx.lineWidth = 2.5;
				ctx.beginPath();
				ctx.arc(x, y, 7, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();
				if (phase === 'hold' || reduceMotion) {
					var label = blob.label, tw = ctx.measureText(label).width;
					var lx = Math.min(Math.max(x - tw / 2 - 8, 4), W - tw - 20);
					var ly = c.y < 0.5 ? y - 24 : y + 24;
					ctx.fillStyle = colors['--surface'];
					ctx.strokeStyle = colors['--line'];
					ctx.lineWidth = 1;
					ctx.beginPath();
					if (ctx.roundRect) ctx.roundRect(lx, ly - 11, tw + 16, 22, 5); else ctx.rect(lx, ly - 11, tw + 16, 22);
					ctx.fill();
					ctx.stroke();
					ctx.fillStyle = colors['--ink'];
					ctx.fillText(label, lx + 8, ly);
				}
			});
			ctx.globalAlpha = 1;
		}

		function setStatus() {
			statusEl.textContent = 'k-means · k=4 · iter ' + iter + ' · inertia ' + inertia.toFixed(2) + (phase === 'hold' ? ' · converged' : '');
		}

		function frame(now) {
			if (!visible) { requestAnimationFrame(frame); return; }
			var elapsed = now - phaseStart;
			if (phase === 'move') {
				var t = Math.min(elapsed / 650, 1);
				draw(1 - Math.pow(1 - t, 3));
				if (t === 1) { phase = 'pause'; phaseStart = now; assignPoints(); setStatus(); }
			} else if (phase === 'pause') {
				draw(1);
				if (elapsed > 350) {
					var shift = updateCentroids();
					iter++;
					if (shift < 0.002 || iter > 15) { phase = 'hold'; from = centroids.map(function (c) { return { x: c.x, y: c.y }; }); setStatus(); }
					else phase = 'move';
					phaseStart = now;
				}
			} else if (phase === 'hold') {
				draw(1);
				if (elapsed > 4500) { seed(); phase = 'pause'; phaseStart = now; setStatus(); }
			}
			requestAnimationFrame(frame);
		}

		readColors();
		resize();
		seed();
		window.addEventListener('resize', function () { resize(); draw(1); });
		new MutationObserver(function () { readColors(); draw(1); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		if (darkQuery.addEventListener) darkQuery.addEventListener('change', function () { readColors(); draw(1); });

		if (reduceMotion) {
			// Run to convergence and show the final state without animating.
			for (var i = 0; i < 30; i++) { if (updateCentroids() < 0.0005) break; assignPoints(); iter++; }
			from = centroids.map(function (c) { return { x: c.x, y: c.y }; });
			phase = 'hold';
			setStatus();
			draw(1);
			return;
		}

		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(canvas);
		}
		phaseStart = performance.now();
		phase = 'pause';
		setStatus();
		draw(1);
		requestAnimationFrame(frame);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(1); });
	}

	// Initial role: ?role=ml in the URL, else the last one this visitor picked.
	var m = /[?&]role=(\w+)/.exec(location.search);
	var initial = (m && m[1]) || recall('role') || 'all';
	var initialBtn = lensButtons.filter(function (b) { return b.getAttribute('data-lens') === initial; })[0] || lensButtons[0];
	press(lensButtons, initialBtn);
	applyLens(initialBtn.getAttribute('data-lens'));
})();
