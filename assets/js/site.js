/*
	Portfolio interactions: typed headline, swinging staff pass, project
	filters, counters, copy email, scroll-linked nav and timeline, terminal.
*/
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var EMAIL = 'ananyagupta99200@gmail.com';
	var RESUME = 'assets/files/Ananya_Gupta_Resume2026.pdf';

	function $(sel, root) { return (root || document).querySelector(sel); }
	function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

	// Typed headline word
	var typed = $('.typed');
	if (typed && !reduceMotion) {
		var words = typed.getAttribute('data-words').split('|');
		var wi = 0, ci = words[0].length, deleting = true;
		var step = function () {
			var delay;
			if (deleting) {
				ci--;
				delay = 55;
				if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
			} else {
				ci++;
				delay = 110;
				if (ci === words[wi].length) { deleting = true; delay = 2200; }
			}
			typed.textContent = words[wi].slice(0, ci);
			setTimeout(step, delay);
		};
		setTimeout(step, 2400);
	}

	// Top bar: hide the logo once the page scrolls
	var topbar = $('#topbar');
	function onScrollTop() { topbar.classList.toggle('scrolled', window.scrollY > 120); }
	window.addEventListener('scroll', onScrollTop, { passive: true });
	onScrollTop();

	// Staff pass: a damped pendulum you can drag, and click to flip
	var pass = $('#pass');
	if (pass) staffPass(pass);

	function staffPass(el) {
		var stage = el.parentElement;
		var theta = reduceMotion ? 0 : 0.16, omega = 0;
		var dragging = false, moved = 0, downAt = 0, lastTheta = 0, lastT = 0;
		var K = 16, DAMP = 1.5, MAX = 1.1;

		function pivot() {
			var r = stage.getBoundingClientRect();
			return { x: r.left + stage.clientWidth / 2, y: r.top + el.offsetTop };
		}
		function render() { el.style.transform = 'rotate(' + (-theta) + 'rad)'; }
		function angleFrom(e) {
			var p = pivot();
			var a = Math.atan2(e.clientX - p.x, Math.max(e.clientY - p.y, 40));
			return Math.max(-MAX, Math.min(MAX, a));
		}
		function flip() {
			var on = !el.classList.contains('flipped');
			el.classList.toggle('flipped', on);
			el.setAttribute('aria-pressed', String(on));
		}

		el.addEventListener('pointerdown', function (e) {
			if (e.button !== 0) return;
			dragging = true; moved = 0; downAt = performance.now();
			lastTheta = theta; lastT = downAt;
			el.setPointerCapture(e.pointerId);
			el.classList.add('dragging');
		});
		el.addEventListener('pointermove', function (e) {
			if (!dragging) return;
			moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
			var now = performance.now();
			var next = angleFrom(e);
			var dt = Math.max((now - lastT) / 1000, 0.001);
			omega = (next - lastTheta) / dt;
			theta = next; lastTheta = next; lastT = now;
			render();
		});
		function release(e) {
			if (!dragging) return;
			dragging = false;
			el.classList.remove('dragging');
			if (moved < 6 && performance.now() - downAt < 450) { omega = 0; flip(); }
			omega = Math.max(-8, Math.min(8, omega));
		}
		el.addEventListener('pointerup', release);
		el.addEventListener('pointercancel', release);
		el.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
			if (e.key === 'ArrowLeft') omega += 1.5;
			if (e.key === 'ArrowRight') omega -= 1.5;
		});

		var prev = performance.now();
		function tick(now) {
			var dt = Math.min((now - prev) / 1000, 0.033);
			prev = now;
			if (!dragging) {
				omega += (-K * Math.sin(theta) - DAMP * omega) * dt;
				theta += omega * dt;
				if (Math.abs(theta) < 0.0005 && Math.abs(omega) < 0.0005) { theta = 0; omega = 0; }
				render();
			}
			requestAnimationFrame(tick);
		}
		render();
		requestAnimationFrame(tick);
	}

	// Project filters
	var filterButtons = $all('[data-filter]');
	var projects = $all('.project');
	var countEl = $('#count');
	function applyFilter(tag) {
		var shown = 0;
		projects.forEach(function (p) {
			var hit = tag === 'all' || (' ' + p.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') !== -1;
			p.hidden = !hit;
			if (hit) shown++;
		});
		countEl.textContent = shown + (shown === 1 ? ' project' : ' projects');
	}
	filterButtons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
			applyFilter(btn.getAttribute('data-filter'));
		});
	});
	applyFilter('all');

	// "See projects" on each skill card filters the work grid and scrolls to it
	$all('[data-see]').forEach(function (btn) {
		var tag = btn.getAttribute('data-see');
		var n = projects.filter(function (p) { return (' ' + p.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') !== -1; }).length;
		btn.textContent = 'See ' + n + (n === 1 ? ' project' : ' projects');
		btn.addEventListener('click', function () {
			var target = filterButtons.filter(function (b) { return b.getAttribute('data-filter') === tag; })[0];
			if (target) target.click();
			$('#work').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
		});
	});

	// Counters (final values are already in the HTML)
	if (!reduceMotion && 'IntersectionObserver' in window) {
		var countObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				countObserver.unobserve(entry.target);
				var el = entry.target, target = +el.getAttribute('data-count');
				var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
				var start = performance.now();
				(function frame(now) {
					var t = Math.min((now - start) / 1100, 1);
					el.textContent = pre + Math.round(target * (1 - Math.pow(1 - t, 3))) + suf;
					if (t < 1) requestAnimationFrame(frame);
				})(start);
			});
		}, { threshold: 0.6 });
		$all('[data-count]').forEach(function (el) { countObserver.observe(el); });
	}

	// Copy email
	function copy(text, done, fail) {
		try { navigator.clipboard.writeText(text).then(done, fail); } catch (e) { fail(); }
	}
	$all('[data-copy]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var toast = $('#toast');
			copy(btn.getAttribute('data-copy'),
				function () { toast.textContent = 'Copied to your clipboard'; },
				function () { toast.textContent = 'Copy is blocked here. Select the address instead.'; });
		});
	});

	// Dock: highlight the section in view
	var dockLinks = $all('.dock nav a');
	var sections = dockLinks.map(function (a) { return $(a.getAttribute('href')); });
	function onScrollDock() {
		var y = window.scrollY + window.innerHeight * 0.4, current = 0;
		sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
		dockLinks.forEach(function (a, i) { a.setAttribute('aria-current', String(i === current)); });
	}
	window.addEventListener('scroll', onScrollDock, { passive: true });
	onScrollDock();

	// Journey: fill the line as you scroll, reveal cards as they arrive
	var tl = $('#timeline'), fill = tl && $('.fill', tl), items = $all('.tl-item');
	function onScrollTimeline() {
		if (!tl) return;
		var r = tl.getBoundingClientRect();
		var progress = (window.innerHeight * 0.6 - r.top) / r.height;
		fill.style.height = Math.max(0, Math.min(1, progress)) * 100 + '%';
	}
	window.addEventListener('scroll', onScrollTimeline, { passive: true });
	window.addEventListener('resize', onScrollTimeline);
	onScrollTimeline();
	if ('IntersectionObserver' in window && !reduceMotion) {
		var reveal = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('in'); });
		}, { rootMargin: '0px 0px -12% 0px' });
		items.forEach(function (it) { reveal.observe(it); });
	} else {
		items.forEach(function (it) { it.classList.add('in'); });
	}

	// Terminal
	var term = $('#terminal'), out = $('#term-out'), input = $('#term-input'), form = $('#term-form');
	var history = [], hIndex = 0, booted = false;

	var FILES = {
		'about.txt': 'about', 'experience.md': 'experience', 'projects.md': 'projects',
		'skills.json': 'skills', 'impact.csv': 'impact', 'contact.txt': 'contact'
	};
	var COMMANDS = {
		help: function () {
			return [
				'<span class="hl">Available commands</span>',
				'  whoami        who is Ananya?',
				'  experience    roles, newest first',
				'  projects      selected projects with links',
				'  skills        the toolkit',
				'  impact        numbers worth knowing',
				'  education     degree and leadership',
				'  contact       how to reach me',
				'  resume        download the resume',
				'  ls, cat       look around',
				'  clear, exit'
			].join('\n');
		},
		whoami: function () {
			return '<span class="hl">Ananya Gupta</span>\nIT Engineer and AI Lead for Micron IT, Micron Technology · Singapore\nI build GenAI agents, ML models and the data pipelines under them.\nB.Sc. (Hons) Data Science & Analytics, NUS 2024.';
		},
		about: function () { return COMMANDS.whoami(); },
		experience: function () {
			return [
				'<span class="hl">2024 – now</span>  IT Engineer · AI Lead       Micron Technology',
				'            10+ production AI agents, 50%+ productivity, +60% inventory throughput',
				'<span class="hl">2024</span>        Data / ML Intern            Warden (fintech, stealth)',
				'            LLM extraction and summarisation of financial documents',
				'<span class="hl">2023</span>        Data Science Intern         OCBC Bank',
				'            ETL automation +200% efficiency, forecasting, Tableau',
				'<span class="hl">2021 – 22</span>   Data Analysis & Ops Intern  Nugit',
				'            Automated client reporting, 91% client renewal rate'
			].join('\n');
		},
		projects: function () {
			var list = [
				['Dating-scam detection (96% accuracy)', 'https://github.com/Ananya8576/DSA4263_Dating_Fraud'],
				['NLI with GPT-2 explanations', 'https://github.com/Ananya8576/CS4248_NLI'],
				['Text summarisation: RNN/LSTM/GRU/Transformer', 'https://github.com/Ananya8576/Text-Summarisation-and-Simplification'],
				['Agent-based simulation for Construcshare', 'https://github.com/Ananya8576/dsa3101-2220-09-construc'],
				['Spark ML for bank schemes', 'https://github.com/Ananya8576/PySpark-ML'],
				['Variational autoencoders', 'https://github.com/Ananya8576/Variational-Autoencoders']
			];
			return list.map(function (p) { return '• ' + esc(p[0]) + '\n  <a href="' + p[1] + '" target="_blank" rel="noopener">' + esc(p[1].replace('https://', '')) + '</a>'; }).join('\n');
		},
		skills: function () {
			return '{\n  <span class="hl">"ai_ml"</span>: ["LLMs", "multi-model agents", "NLP", "computer vision", "deep learning", "TensorFlow/Keras", "Hugging Face"],\n  <span class="hl">"languages"</span>: ["Python", "SQL", "C#", "R", "SAS", "Java", "TypeScript"],\n  <span class="hl">"data"</span>: ["Spark", "Hadoop", "ETL", "Docker", "Git", "Fivetran"],\n  <span class="hl">"platforms"</span>: ["AWS", "PostgreSQL", "MSSQL", "Oracle", "Firebase"],\n  <span class="hl">"bi"</span>: ["Power BI", "Tableau", "Splunk", "Sisense"]\n}';
		},
		impact: function () {
			return 'metric,value,where\nproduction_ai_agents,10+,Micron\nproductivity_gain,50%+,Micron\ninventory_throughput,+60%,Micron\netl_efficiency,+200%,OCBC\nscam_detection_accuracy,96%,NUS\nclient_renewal_rate,91%,Nugit\nstudents_reached,800+,NUS Stats & DS Society';
		},
		education: function () {
			return 'National University of Singapore, 2020 – 2024\nB.Sc. (Hons) Data Science & Analytics, Second Major in Innovation & Design\nDean\'s List AY2023/24 Sem 1 · Academic Donated Bursary Award 2021\nVice President, NUS Statistics & Data Science Society · Marketing Director, NUS GRC';
		},
		contact: function () {
			return 'email     ' + EMAIL + '\nlinkedin  <a href="https://www.linkedin.com/in/ananyagupta8576/" target="_blank" rel="noopener">linkedin.com/in/ananyagupta8576</a>\ngithub    <a href="https://github.com/Ananya8576" target="_blank" rel="noopener">github.com/Ananya8576</a>';
		},
		resume: function () { return 'Resume: <a href="' + RESUME + '" target="_blank" rel="noopener">Ananya_Gupta_Resume2026.pdf</a>'; },
		ls: function () { return Object.keys(FILES).join('   ') + '   Ananya_Gupta_Resume2026.pdf'; },
		cat: function (arg) {
			if (!arg) return 'usage: cat <file>. Try "ls".';
			if (/resume/i.test(arg)) return COMMANDS.resume();
			var cmd = FILES[arg];
			return cmd ? COMMANDS[cmd]() : 'cat: ' + esc(arg) + ': No such file. Try "ls".';
		},
		sudo: function (arg) {
			if (/hire/i.test(arg || '')) return '[sudo] password for recruiter: ********\n<span class="hl">Access granted.</span> Next step: email ' + EMAIL;
			return 'Nice try. Only "sudo hire ananya" is allowed here.';
		},
		clear: function () { out.innerHTML = ''; return null; },
		exit: function () { closeTerm(); return null; }
	};
	COMMANDS.exp = COMMANDS.experience;
	COMMANDS.cv = COMMANDS.resume;

	function print(html, cls) {
		var div = document.createElement('div');
		if (cls) div.className = cls;
		div.innerHTML = html;
		out.appendChild(div);
		out.scrollTop = out.scrollHeight;
	}
	function run(raw) {
		var line = raw.trim();
		print('<span class="prompt">ananya@portfolio:~$</span> <span class="cmd">' + esc(line) + '</span>');
		if (!line) return;
		history.push(line); hIndex = history.length;
		var parts = line.split(/\s+/), name = parts[0].toLowerCase(), arg = parts.slice(1).join(' ');
		var fn = COMMANDS[name];
		var result = fn ? fn(arg) : 'command not found: ' + esc(name) + '. Type "help".';
		if (result !== null) print(result, fn ? '' : 'dim');
	}
	function openTerm() {
		if (typeof term.showModal === 'function') term.showModal(); else term.setAttribute('open', '');
		if (!booted) {
			booted = true;
			print('<span class="dim">Welcome to Ananya\'s portfolio shell. Type "help", or tap a command below.</span>');
			run('whoami');
		}
		input.focus();
	}
	function closeTerm() { if (term.open) term.close ? term.close() : term.removeAttribute('open'); }

	$('#term-open').addEventListener('click', openTerm);
	$('#term-close').addEventListener('click', closeTerm);
	term.addEventListener('click', function (e) { if (e.target === term) closeTerm(); });
	form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
	input.addEventListener('keydown', function (e) {
		if (e.key === 'ArrowUp' && hIndex > 0) { hIndex--; input.value = history[hIndex]; e.preventDefault(); }
		if (e.key === 'ArrowDown') { hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] || ''; e.preventDefault(); }
		if (e.key === 'Tab') {
			e.preventDefault();
			var match = Object.keys(COMMANDS).filter(function (c) { return c.indexOf(input.value) === 0; });
			if (match.length === 1) input.value = match[0];
		}
	});
	$('#term-hints').innerHTML = ['whoami', 'experience', 'projects', 'skills', 'impact', 'contact', 'sudo hire ananya'].map(function (c) {
		return '<button type="button">' + c + '</button>';
	}).join('');
	$('#term-hints').addEventListener('click', function (e) {
		var b = e.target.closest('button');
		if (b) { run(b.textContent); input.focus(); }
	});
	// Backtick opens the terminal from anywhere
	document.addEventListener('keydown', function (e) {
		if (e.key === '`' && !term.open && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openTerm(); }
	});
})();
