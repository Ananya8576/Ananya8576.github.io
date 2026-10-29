/*
	Streaming-style profile: content data, row rendering, detail modal,
	search, nav state, copy-to-clipboard and the billboard network canvas.
*/
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var RESUME = 'assets/files/Ananya_Gupta_Resume2026.pdf';

	// Poster artwork per genre: two gradient colours, a texture and a background glyph.
	var GENRES = {
		micron: { a1: '#8a0a1c', a2: '#ff2d48', motif: 'repeating-radial-gradient(circle at 100% 0, #fff 0 1px, transparent 1px 14px)', size: 'auto', glyph: 'AI' },
		genai: { a1: '#4a0d63', a2: '#d6249f', motif: 'radial-gradient(#fff 1px, transparent 1.6px)', size: '14px 14px', glyph: 'λ' },
		ml: { a1: '#19206e', a2: '#4f6bff', motif: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', size: '22px 22px', glyph: 'Σ' },
		data: { a1: '#04464a', a2: '#13c2b3', motif: 'repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 10px)', size: 'auto', glyph: '{}' },
		viz: { a1: '#5a3300', a2: '#ffb000', motif: 'linear-gradient(90deg, #fff 2px, transparent 2px)', size: '12px 100%', glyph: '%' },
		web: { a1: '#0b2a55', a2: '#3a86ff', motif: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', size: '16px 16px', glyph: '</>' },
		career: { a1: '#3d0b0b', a2: '#e3122c', motif: 'repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 12px)', size: 'auto', glyph: 'S' },
		edu: { a1: '#0b4231', a2: '#2ad19b', motif: 'radial-gradient(#fff 1px, transparent 1.6px)', size: '16px 16px', glyph: '∂' },
		skill: { a1: '#262626', a2: '#5c5c5c', motif: 'radial-gradient(#fff 1px, transparent 1.6px)', size: '12px 12px', glyph: '+' }
	};

	var L = {
		report: function (href) { return { label: 'Report', href: href, icon: 'doc' }; },
		code: function (href, label) { return { label: label || 'Code', href: href, icon: 'code' }; },
		resume: { label: 'Résumé', href: RESUME, icon: 'download' }
	};

	var ITEMS = {
		// Current role
		'm-genai': {
			title: 'Pioneering GenAI at Micron IT', genre: 'micron', year: '2024 – Present', sub: 'Micron Technology', rating: 'AI Lead', live: true, flag: 'Now<br>Live',
			desc: 'As AI Lead for Micron IT, I design, build and globally scale the organisation\'s AI initiatives. I represent the IT department\'s AI strategy and roadmap at CEO level, and champion global adoption and governance of AI.',
			stack: ['GenAI', 'LLMs', 'AI agents'], genres: ['AI strategy', 'Governance', 'Leadership'], links: [L.resume]
		},
		'm-agents': {
			title: '10+ Production AI Agents', genre: 'micron', year: '2024 – Present', sub: 'Micron Technology', rating: 'GenAI', metric: '10+', live: true,
			desc: 'I led a cross-functional AI program that put more than 10 production agents into daily use across all manufacturing sites. Multi-model agents and intelligent troubleshooting, built on state-of-the-art models and frameworks, drove productivity gains of more than 50%.',
			stack: ['Multi-model agents', 'LLMs', 'Intelligent troubleshooting'], genres: ['GenAI', 'Agents', 'Manufacturing'], links: [L.resume]
		},
		'm-dash': {
			title: 'Enterprise Dashboards for Every Fab', genre: 'micron', year: '2024 – Present', sub: 'Micron Technology', rating: 'BI', live: true,
			desc: 'I built and deployed enterprise-wide visualisation dashboards used across all manufacturing sites, improving decision visibility and accelerating operational excellence.',
			stack: ['Splunk', 'Power BI', 'Tableau'], genres: ['Analytics', 'Operations'], links: [L.resume]
		},
		'm-inv': {
			title: 'Inventory Acceleration', genre: 'micron', year: '2024 – Present', sub: 'Micron Technology', rating: 'Automation', metric: '+60%', live: true,
			desc: 'Automation and workflow redesign across multiple tracks increased inventory management throughput by 60%.',
			stack: ['Automation', 'Workflow design'], genres: ['Operations', 'Process'], links: [L.resume]
		},
		'm-infra': {
			title: 'Automation & Data Center Ops', genre: 'micron', year: '2024 – Present', sub: 'Micron Technology', rating: 'L3', live: true,
			desc: 'I built automation workflows across IT and finance operations for L3 engineering, including global Windows Server administration, while leading infrastructure operations for one of the largest data center operations, keeping it highly available and performant.',
			stack: ['Windows Server', 'Automation', 'Infrastructure'], genres: ['Engineering', 'Reliability'], links: [L.resume]
		},

		// Career seasons
		's4': {
			title: 'Season 4: Micron Technology', genre: 'career', glyph: '4', year: 'Jul 2024 – Present', sub: 'IT Engineer · AI Lead', rating: 'Now', live: true, progress: 55, flag: 'Now<br>Live',
			desc: 'The current season. I lead GenAI for Micron IT, from strategy presented at CEO level to agents running in every manufacturing site, while engineering the automation and infrastructure underneath.',
			stack: ['GenAI', 'AI agents', 'Splunk', 'Power BI', 'Tableau', 'Windows Server'], genres: ['AI', 'Engineering', 'Leadership'],
			episodes: [
				['Pioneering GenAI', 'Designed, built and globally scaled Micron IT\'s AI initiatives as AI Lead, and presented the AI strategy and roadmap at CEO level.'],
				['Multi-model agents', 'Drove productivity gains of more than 50% with multi-model agents and intelligent troubleshooting.'],
				['10+ agents in production', 'Led a cross-functional AI program deploying 10+ production agents used daily across all manufacturing sites.'],
				['Dashboards for every site', 'Built enterprise-wide dashboards in Splunk, Power BI and Tableau for all manufacturing sites.'],
				['Inventory acceleration', 'Increased inventory management throughput by 60% through automation and workflow redesign.'],
				['Automation & infrastructure', 'Built automation for IT and finance operations at L3, including global Windows Server administration, and led infrastructure operations for one of the largest data center operations.']
			],
			links: [L.resume]
		},
		's3': {
			title: 'Season 3: Warden', genre: 'career', glyph: '3', year: 'Jan – Mar 2024', sub: 'Data / ML Intern · fintech start-up', rating: 'LLM', progress: 100,
			desc: 'A stealth-mode fintech start-up, where I built LLM features that read long financial documents and turned them into recommendations.',
			stack: ['LLMs', 'TypeScript', 'Node.js', 'Yarn', 'Docker', 'AlphaVantage', 'Xignite'], genres: ['GenAI', 'Fintech'],
			episodes: [
				['LLM document intelligence', 'Built an LLM pipeline to extract and summarise key financial information, such as tax details and stock holdings, from long documents, enriched with market-data APIs to generate recommendations.'],
				['Shipping it to users', 'Built the front-end interface with Node.js, Yarn and Docker so extracted information synced for end users.']
			],
			links: [L.resume]
		},
		's2': {
			title: 'Season 2: OCBC Bank', genre: 'career', glyph: '2', year: 'May – Dec 2023', sub: 'Data Science Intern', rating: 'DS', progress: 100,
			desc: 'Data science at one of Southeast Asia\'s largest banks: forecasting models, automated ETL and Tableau dashboards for the wealth and digital segments.',
			stack: ['Python', 'SQL', 'SAS', 'VBA', 'Tableau'], genres: ['Data science', 'Banking'],
			episodes: [
				['Forecasting performance', 'Built statistical forecasting and time-series correlation models on historical data to track performance against targets.'],
				['ETL automation, +200%', 'Automated ETL with Python, SQL, VBA and SAS, improving pipeline efficiency by 200% and raising the accuracy of global metrics.'],
				['Designing the data mart', 'Defined database schemas and data dictionaries to standardise reporting structures and key metrics.'],
				['Dashboards end to end', 'Delivered Tableau dashboards from data ingestion to real-time visualisations for consumer segments.'],
				['The hackathon', 'Recognised by department heads for product ideation and prototyping at the FRANKPreneurship Design Thinking Hackathon 2023.']
			],
			links: [L.resume]
		},
		's1': {
			title: 'Season 1: Nugit', genre: 'career', glyph: '1', year: 'Dec 2021 – Jul 2022', sub: 'Data Analysis & Operations Intern', rating: 'BI', progress: 100,
			desc: 'A SaaS marketing-analytics company, where I automated reporting for enterprise clients and kept their data accurate.',
			stack: ['Tableau', 'R', 'SQL', 'Java', 'APIs'], genres: ['Analytics', 'SaaS'],
			episodes: [
				['Automated client reports', 'Turned raw CSV files and API feeds into interactive reports for clients including J&J and Kellogg\'s, using Tableau and R.'],
				['91% renewal rate', 'Daily data cleaning and back-end and front-end accuracy checks supported a 91% client renewal rate.'],
				['Shipping custom metrics', 'Worked with Product and Engineering to troubleshoot bugs and deploy custom metrics in SQL and Java; resolved 100+ user data issues.']
			],
			links: [L.resume]
		},

		// AI & ML projects
		'p-scam': {
			title: 'Detecting Online Dating Scams', genre: 'genai', year: '2024', sub: 'NUS course project', rating: 'CV + NLP', metric: '96%', flag: 'Top<br>10',
			desc: 'A model that flags scam dating profiles from both profile images and text, to reduce the financial and emotional risk to victims. It reached 96% accuracy.',
			stack: ['Python', 'Computer vision', 'NLP', 'Classification'], genres: ['Machine learning', 'Trust & safety'],
			links: [L.report('assets/files/OnlineDatingScam_Report.pdf'), L.code('https://github.com/Ananya8576/DSA4263_Dating_Fraud')]
		},
		'p-nli': {
			title: 'NLI with AI-Generated Explanations', genre: 'genai', year: '2024', sub: 'NUS course project', rating: 'LLM',
			desc: 'Trained several GPT-2 variants to compare machine-generated explanations with human-annotated ones for natural language inference, scored on accuracy, precision, F1 and BLEU.',
			stack: ['Python', 'GPT-2', 'NLP'], genres: ['LLMs', 'Research'],
			links: [L.report('assets/files/NLI_Final_Report.pdf'), L.code('https://github.com/Ananya8576/CS4248_NLI')]
		},
		'p-sum': {
			title: 'Text Summarisation & Simplification', genre: 'ml', year: '2022', sub: 'NUS course project', rating: 'NLP',
			desc: 'Trained RNN, LSTM, GRU and Transformer models and compared their summaries of research papers, using precision and recall plus qualitative measures such as brevity.',
			stack: ['Python', 'Transformers', 'LSTM', 'GRU', 'RNN'], genres: ['Deep learning', 'NLP'],
			links: [L.report('assets/files/TextSummarisationAndSimplification.pdf'), L.code('https://github.com/Ananya8576/Text-Summarisation-and-Simplification')]
		},
		'p-vae': {
			title: 'Variational Autoencoders', genre: 'ml', year: '', sub: 'Project', rating: 'GenAI',
			desc: 'Implemented and analysed variational autoencoders, a generative deep learning model that learns a latent space it can sample new data from.',
			stack: ['Python', 'Deep learning', 'Jupyter'], genres: ['Generative models'],
			links: [L.report('assets/files/VariationalAutoencoders.pdf'), L.code('https://github.com/Ananya8576/Variational-Autoencoders/blob/main/VAE_PythonCode.ipynb')]
		},
		'p-chess': {
			title: 'AI Agents for Chess', genre: 'ml', year: '', sub: 'Project', rating: 'AI',
			desc: 'Search-based AI agents for path finding, goal finding and adversarial chess play.',
			stack: ['Python', 'Search algorithms'], genres: ['Classical AI', 'Games'],
			links: [L.code('https://github.com/Ananya8576/path-finding', 'Path'), L.code('https://github.com/Ananya8576/n-pieces-goal-finding', 'Goal'), L.code('https://github.com/Ananya8576/GameOfChess', 'Chess')]
		},

		// Data, engineering & product projects
		'p-spark': {
			title: 'Spark ML for Bank Schemes', genre: 'data', year: '', sub: 'Project', rating: 'Big data',
			desc: 'Distributed machine learning on banking data with PySpark.',
			stack: ['PySpark', 'Spark ML'], genres: ['Big data', 'Machine learning'],
			links: [L.code('https://github.com/Ananya8576/PySpark-ML')]
		},
		'p-hadoop': {
			title: 'Hadoop MapReduce: Top-k Words', genre: 'data', year: '', sub: 'Project', rating: 'Big data',
			desc: 'A MapReduce job that finds the most frequent words in large text data.',
			stack: ['Hadoop', 'MapReduce'], genres: ['Big data'],
			links: [L.code('https://github.com/Ananya8576/Topk_WordCount')]
		},
		'p-db': {
			title: 'Database System for Crowdfunding', genre: 'data', year: '', sub: 'NUS course project', rating: 'SQL',
			desc: 'Relational schema, constraints and stored procedures for a crowdfunding platform.',
			stack: ['SQL', 'Schema design', 'Stored procedures'], genres: ['Databases'],
			links: [L.report('assets/files/DataBase_Project1&2.pdf'), L.code('https://github.com/Ananya8576/Database_Systems/blob/main/Proc.sql')]
		},
		'p-abm': {
			title: 'Transaction Simulation for Construcshare', genre: 'viz', year: '2023', sub: 'NUS course project', rating: 'Simulation',
			desc: 'An agent-based simulation built from scratch in Python that mimics e-commerce transactions at Construcshare, to test how feature changes affect engagement.',
			stack: ['Python', 'APIs', 'Git', 'Docker'], genres: ['Data science', 'Simulation'],
			links: [L.report('assets/files/construc_techreport.pdf'), L.code('https://github.com/Ananya8576/dsa3101-2220-09-construc')]
		},
		'p-viz': {
			title: 'Data Visualisations in R', genre: 'viz', year: '', sub: 'Project', rating: 'Viz',
			desc: 'A collection of exploratory and explanatory charts built in R.',
			stack: ['R'], genres: ['Visualisation', 'Storytelling'],
			links: [L.code('https://github.com/Ananya8576/DataVisualisations')]
		},
		'p-ehr': {
			title: 'Post-Discharge Information Manager', genre: 'web', year: '2022', sub: 'NUS project', rating: 'Health',
			desc: 'A web app and authoring tool that pulls data from the hospital database and organises it so discharged patients get complete, clear information on time.',
			stack: ['React.js', 'Firebase', 'Java', 'HTML/CSS'], genres: ['Healthcare', 'Web apps'],
			links: [L.report('assets/files/Post-DischargeInformationManagement.pdf'), L.code('https://github.com/EIM319')]
		},
		'p-2fa': {
			title: '2FA Password Manager', genre: 'web', year: '2021', sub: 'NUS Orbital project', rating: 'Security',
			desc: 'A two-factor password manager that stores passcodes securely and auto-fills them with a single click.',
			stack: ['PostgreSQL', 'JavaScript', 'HTML/CSS'], genres: ['Security', 'Web apps'],
			links: [L.code('https://github.com/Ananya8576/lowkey')]
		},

		// Education & leadership
		'e-nus': {
			title: 'NUS: Data Science & Analytics', genre: 'edu', year: '2020 – 2024', sub: 'B.Sc. (Honours)', rating: 'Degree',
			desc: 'Bachelor of Science (Honours) at the National University of Singapore, majoring in Data Science and Analytics with a Second Major in Innovation and Design.',
			stack: ['Machine Learning', 'AI', 'NLP', 'Statistical Modelling', 'Big Data Systems', 'Data Structures & Algorithms', 'Data Visualisation'], genres: ['Education'],
			episodes: [['Dean\'s List', 'AY2023/24 Semester 1.'], ['Academic Donated Bursary Award', '2021.']]
		},
		'e-sds': {
			title: 'Statistics & Data Science Society', genre: 'edu', year: '2021 – 2024', sub: 'Vice President, NUS', rating: 'VP', metric: '800+',
			desc: 'As Vice President, I judged and led the Annual Data Analytics Competition and industry events with Grab, AI Singapore and Shopee for 800+ students from NUS and beyond, and managed cross-functional teams with the President and the NUS Statistics Department.',
			stack: ['Leadership', 'Event management', 'Judging'], genres: ['Leadership', 'Community']
		},
		'e-grc': {
			title: 'Marketing Director, NUS GRC', genre: 'edu', year: '', sub: 'NUS GRC Group', rating: 'Lead',
			desc: 'Marketing Director for the NUS GRC Group during my degree.',
			stack: ['Marketing', 'Leadership'], genres: ['Leadership']
		},
		'e-hack': {
			title: 'FRANKPreneurship Hackathon', genre: 'edu', year: '2023', sub: 'OCBC Design Thinking Hackathon', rating: 'Award',
			desc: 'Recognised by OCBC department heads for innovative product ideation and a prototype at the FRANKPreneurship Design Thinking Hackathon 2023.',
			stack: ['Design thinking', 'Prototyping'], genres: ['Product']
		},

		// Skills
		'k-genai': {
			title: 'GenAI & Agents', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['LLMs', 'Multi-model agents', 'Intelligent troubleshooting', 'Document extraction', 'NLP', 'Hugging Face'],
			desc: 'Where I\'ve used these:',
			episodes: [['Micron Technology', '10+ production AI agents across all manufacturing sites; 50%+ productivity gains.'], ['Warden', 'LLM extraction and summarisation of financial documents.'], ['NUS', 'GPT-2 explanations for NLI; summarisation models.']]
		},
		'k-ml': {
			title: 'Machine Learning', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['Computer vision', 'Deep learning', 'Transformers', 'VAEs', 'TensorFlow / Keras', 'Statistical modelling', 'Simulation'],
			desc: 'Where I\'ve used these:',
			episodes: [['OCBC Bank', 'Forecasting and time-series correlation models.'], ['NUS', 'Scam detection at 96% accuracy; RNN, LSTM, GRU and Transformer benchmarks; VAEs; agent-based simulation.']]
		},
		'k-de': {
			title: 'Data Engineering', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['ETL', 'Apache Spark', 'Hadoop', 'Data modelling', 'Docker', 'Git', 'Fivetran', 'Automation'],
			desc: 'Where I\'ve used these:',
			episodes: [['Micron Technology', 'Automation workflows for IT and finance operations; +60% inventory throughput.'], ['OCBC Bank', 'ETL automation that improved efficiency by 200%; data mart schemas.'], ['NUS', 'Spark ML and Hadoop MapReduce projects.']]
		},
		'k-bi': {
			title: 'BI & Visualisation', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['Power BI', 'Tableau', 'Splunk', 'Sisense', 'Matplotlib', 'Seaborn'],
			desc: 'Where I\'ve used these:',
			episodes: [['Micron Technology', 'Enterprise dashboards across all manufacturing sites.'], ['OCBC Bank', 'End-to-end Tableau dashboards.'], ['Nugit', 'Automated client reports in Tableau and R.']]
		},
		'k-db': {
			title: 'Databases & Cloud', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['AWS', 'PostgreSQL', 'MSSQL', 'Oracle', 'Firebase', 'Windows Server'],
			desc: 'Where I\'ve used these:',
			episodes: [['Micron Technology', 'Global Windows Server administration and data center operations.'], ['OCBC Bank', 'Enterprise data warehouse.'], ['NUS', 'PostgreSQL and Firebase applications.']]
		},
		'k-lang': {
			title: 'Programming', genre: 'skill', kind: 'skill', rating: 'Skill',
			chips: ['Python', 'C#', 'SQL', 'R', 'SAS', 'Java', 'TypeScript', 'VBA'],
			desc: 'Python and SQL every day, with C#, TypeScript, Java, R, SAS and VBA where the job calls for them.',
			episodes: [['Micron Technology', 'AI agents, automation and dashboards.'], ['Warden', 'TypeScript LLM pipeline.'], ['OCBC Bank', 'Python, SQL, VBA and SAS ETL.']]
		},

		// About
		'about': {
			title: 'Ananya Gupta', genre: 'micron', glyph: 'A', year: 'Singapore', sub: 'IT Engineer · AI Lead', rating: 'Profile', live: true,
			desc: 'I\'m an AI Lead and data scientist who likes the whole stack: models, agents, pipelines and the dashboards people use to decide. I graduated from NUS in Data Science & Analytics in 2024 and joined Micron Technology, where I now lead GenAI for IT. I\'m open to conversations about AI, data science and data engineering roles.',
			stack: ['GenAI', 'Python', 'SQL', 'Power BI', 'Tableau', 'Spark'], genres: ['AI', 'Data science', 'Engineering'],
			side: [['Based in', 'Singapore'], ['Languages', 'English and Hindi (fluent), Mandarin (intermediate)'], ['Email', 'ananyagupta99200@gmail.com']],
			episodes: [
				['Micron Technology, 2024 – now', 'IT Engineer and AI Lead. 10+ production AI agents, 50%+ productivity gains.'],
				['Warden, 2024', 'Data / ML Intern. LLM document extraction for fintech.'],
				['OCBC Bank, 2023', 'Data Science Intern. Forecasting, +200% ETL efficiency, Tableau.'],
				['Nugit, 2021 – 2022', 'Data Analysis & Operations Intern. 91% client renewal rate.'],
				['NUS, 2020 – 2024', 'B.Sc. (Hons) Data Science & Analytics. Dean\'s List.']
			],
			links: [L.resume, { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ananyagupta8576/', icon: 'info' }, L.code('https://github.com/Ananya8576', 'GitHub')]
		}
	};

	var TOP10 = [
		['Production AI agents', '10+', 'm-agents'],
		['Productivity gains', '50%+', 'm-agents'],
		['Inventory throughput', '+60%', 'm-inv'],
		['ETL efficiency at OCBC', '200%', 's2'],
		['Scam detection accuracy', '96%', 'p-scam'],
		['Client renewal at Nugit', '91%', 's1'],
		['AI strategy at CEO level', 'CEO', 'm-genai'],
		['Students reached', '800+', 'e-sds'],
		['Sites on my dashboards', 'ALL', 'm-dash'],
		['Dean\'s List', 'AY23', 'e-nus']
	];

	var ROWS = [
		{ id: 'row-micron', title: 'Now Streaming: Micron Technology', note: 'IT Engineer · AI Lead · Jul 2024 – present', items: ['m-genai', 'm-agents', 'm-dash', 'm-inv', 'm-infra'] },
		{ id: 'row-top10', title: 'Top 10 Achievements', note: 'Select one for the story', top10: true },
		{ id: 'row-career', title: 'Career: The Series', note: '4 seasons', items: ['s4', 's3', 's2', 's1'] },
		{ id: 'row-ai', title: 'AI & ML Originals', items: ['p-scam', 'p-nli', 'p-sum', 'p-vae', 'p-chess'] },
		{ id: 'row-data', title: 'Data, Engineering & Product', items: ['p-spark', 'p-hadoop', 'p-db', 'p-abm', 'p-viz', 'p-ehr', 'p-2fa'] },
		{ id: 'row-skills', title: 'The Toolkit', note: 'Skills, and where I\'ve used them', items: ['k-genai', 'k-ml', 'k-de', 'k-bi', 'k-db', 'k-lang'], skills: true },
		{ id: 'row-edu', title: 'Documentaries: Education & Leadership', items: ['e-nus', 'e-sds', 'e-hack', 'e-grc'] }
	];

	function $(sel, root) { return (root || document).querySelector(sel); }
	function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function icon(name) { return '<svg aria-hidden="true"><use href="#i-' + name + '" /></svg>'; }

	function artHTML(item) {
		var g = GENRES[item.genre];
		var style = '--a1:' + g.a1 + ';--a2:' + g.a2 + ';--motif:' + g.motif + ';--motif-size:' + g.size;
		return '<span class="art" style="' + style + '"><span class="glyph">' + esc(item.glyph || g.glyph) + '</span></span>';
	}

	function metaLine(item) {
		return (item.live ? '<span class="live">Now streaming</span>' : '') +
			(item.year ? '<span>' + esc(item.year) + '</span>' : '') +
			(item.rating ? '<span class="rating">' + esc(item.rating) + '</span>' : '');
	}

	function cardHTML(id) {
		var item = ITEMS[id];
		if (item.kind === 'skill') {
			return '<button class="card skill-card" type="button" data-open="' + id + '">' + artHTML(item) +
				'<h3>' + esc(item.title) + '</h3>' +
				'<ul class="chips">' + item.chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></button>';
		}
		var hasProgress = typeof item.progress === 'number';
		return '<button class="card' + (hasProgress ? ' has-progress' : '') + '" type="button" data-open="' + id + '" aria-label="' + esc(item.title) + '">' +
			artHTML(item) +
			'<span class="badge" aria-hidden="true">AG</span>' +
			(item.flag ? '<span class="flag" aria-hidden="true">' + item.flag + '</span>' : (item.metric ? '<span class="metric" aria-hidden="true">' + esc(item.metric) + '</span>' : '')) +
			'<span class="ct" aria-hidden="true">' + esc(item.title) + '</span>' +
			'<span class="hover" aria-hidden="true"><span class="ht">' + esc(item.title) + '</span><span class="hm">' + metaLine(item) + '</span>' + esc(item.sub || '') + '</span>' +
			(hasProgress ? '<span class="progress" aria-hidden="true"><i style="width:' + item.progress + '%"></i></span>' : '') +
			'</button>';
	}

	function top10HTML(entry, i) {
		var target = ITEMS[entry[2]];
		return '<li><span class="rank" aria-hidden="true">' + (i + 1) + '</span>' +
			'<button class="card" type="button" data-open="' + entry[2] + '" aria-label="Number ' + (i + 1) + ': ' + esc(entry[0]) + ', ' + esc(entry[1]) + '">' +
			artHTML({ genre: target.genre, glyph: ' ' }) +
			'<span class="badge" aria-hidden="true">AG</span>' +
			'<span class="metric" aria-hidden="true">' + esc(entry[1]) + '</span>' +
			'<span class="ct" aria-hidden="true">' + esc(entry[0]) + '</span>' +
			'<span class="hover" aria-hidden="true"><span class="ht">' + esc(entry[0]) + '</span>' + esc(target.sub || '') + '</span>' +
			'</button></li>';
	}

	// Render rows
	var rowsEl = $('#rows');
	rowsEl.innerHTML = ROWS.map(function (row) {
		var cards = row.top10 ? TOP10.map(top10HTML).join('') : row.items.map(function (id) { return '<li>' + cardHTML(id) + '</li>'; }).join('');
		return '<section class="row' + (row.top10 ? ' top10' : '') + '" id="' + row.id + '" aria-labelledby="' + row.id + '-h">' +
			'<h2 class="pad-x" id="' + row.id + '-h">' + esc(row.title) + (row.note ? ' <small>' + esc(row.note) + '</small>' : '') + '</h2>' +
			'<div class="row-viewport">' +
			'<button class="arrow prev" type="button" aria-label="Scroll ' + esc(row.title) + ' left" disabled>' + icon('left') + '</button>' +
			'<ul class="track pad-x">' + cards + '</ul>' +
			'<button class="arrow next" type="button" aria-label="Scroll ' + esc(row.title) + ' right">' + icon('right') + '</button>' +
			'</div></section>';
	}).join('');

	// Row arrows
	Array.prototype.forEach.call(document.querySelectorAll('.row-viewport'), function (vp) {
		var track = $('.track', vp), prev = $('.prev', vp), next = $('.next', vp);
		function update() {
			prev.disabled = track.scrollLeft < 8;
			next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
		}
		prev.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' }); });
		next.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' }); });
		track.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		update();
	});

	// Modal
	var modal = $('#modal'), mContent = $('#m-content'), lastFocus = null;

	function openItem(id) {
		var item = ITEMS[id];
		if (!item) return;
		lastFocus = document.activeElement;
		var links = (item.links || []).map(function (l) {
			var cls = l.icon === 'download' || l === item.links[0] ? 'btn play small' : 'btn info small';
			return '<a class="' + cls + '" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + icon(l.icon) + esc(l.label) + '</a>';
		}).join('');
		var side = (item.side || []).map(function (s) { return '<p>' + esc(s[0]) + ': <span>' + esc(s[1]) + '</span></p>'; }).join('');
		if (item.stack) side += '<p>Built with: <span>' + item.stack.map(esc).join(', ') + '</span></p>';
		if (item.chips && !item.stack) side += '<p>Includes: <span>' + item.chips.map(esc).join(', ') + '</span></p>';
		if (item.genres) side += '<p>Genres: <span>' + item.genres.map(esc).join(', ') + '</span></p>';
		if (item.sub) side += '<p>Role: <span>' + esc(item.sub) + '</span></p>';
		var eps = item.episodes ? '<div class="episodes"><h3>' + (item.kind === 'skill' ? 'Seen in' : id === 'about' ? 'Episodes so far' : 'Episodes') +
			' <small>' + esc(item.title) + '</small></h3><ol>' +
			item.episodes.map(function (e, i) {
				return '<li><span class="no">' + (i + 1) + '</span><div><p class="et">' + esc(e[0]) + '</p><p class="es">' + esc(e[1]) + '</p></div></li>';
			}).join('') + '</ol></div>' : '';

		mContent.innerHTML =
			'<div class="m-hero">' + artHTML(item) + '<div><h2 id="m-title">' + esc(item.title) + '</h2><div class="m-links">' + links + '</div></div></div>' +
			'<div class="m-body"><div><p class="meta">' + metaLine(item) + (item.metric ? '<span class="hd">' + esc(item.metric) + '</span>' : '') + '</p>' +
			'<p class="m-desc">' + esc(item.desc) + '</p></div><div class="m-side">' + side + '</div>' + eps + '</div>';

		if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
		modal.scrollTop = 0;
		$('#m-close').focus();
	}
	function closeModal() {
		if (modal.open) modal.close ? modal.close() : modal.removeAttribute('open');
	}
	modal.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });
	modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
	$('#m-close').addEventListener('click', closeModal);

	document.addEventListener('click', function (e) {
		var opener = e.target.closest('[data-open]');
		if (opener) openItem(opener.getAttribute('data-open'));
	});

	// Search
	var searchBox = $('#search'), searchInput = $('#search-input'), results = $('#results');
	var searchable = Object.keys(ITEMS).filter(function (id) { return id !== 'about'; });
	function haystack(item) {
		return [item.title, item.sub, item.desc, item.year].concat(item.stack || [], item.genres || [], item.chips || [], (item.episodes || []).map(function (e) { return e.join(' '); })).join(' ').toLowerCase();
	}
	$('#search-btn').addEventListener('click', function () {
		searchBox.classList.toggle('open');
		if (searchBox.classList.contains('open')) searchInput.focus();
	});
	searchInput.addEventListener('input', function () {
		var q = searchInput.value.trim().toLowerCase();
		var searching = q.length > 0;
		rowsEl.hidden = searching;
		$('.billboard').hidden = searching;
		results.hidden = !searching;
		if (!searching) return;
		var hits = searchable.filter(function (id) { return haystack(ITEMS[id]).indexOf(q) !== -1; });
		$('#results-title').innerHTML = 'Results for <b>' + esc(searchInput.value.trim()) + '</b>: ' + hits.length + ' title' + (hits.length === 1 ? '' : 's');
		$('#results-grid').innerHTML = hits.map(function (id) { return '<li>' + cardHTML(id) + '</li>'; }).join('');
		$('#results-empty').hidden = hits.length > 0;
	});
	searchInput.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); searchInput.blur(); searchBox.classList.remove('open'); }
	});

	// Nav turns solid once the billboard scrolls away
	var nav = $('#nav');
	function navState() { nav.classList.toggle('solid', window.scrollY > 40 || !results.hidden); }
	window.addEventListener('scroll', navState, { passive: true });
	searchInput.addEventListener('input', navState);
	navState();

	// Copy email
	Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
		btn.addEventListener('click', function () {
			var text = btn.getAttribute('data-copy'), toast = $('#toast');
			try {
				navigator.clipboard.writeText(text).then(
					function () { toast.textContent = 'Copied ' + text; },
					function () { toast.textContent = 'Copy is blocked here. The address is ' + text; });
			} catch (err) { toast.textContent = 'Copy is blocked here. The address is ' + text; }
		});
	});

	// Open a title from the link, e.g. #t-s4
	var m = /^#t-([\w-]+)$/.exec(location.hash);
	if (m && ITEMS[m[1]]) openItem(m[1]);

	// Billboard: a slowly firing neural network
	var canvas = $('#net');
	if (canvas && canvas.getContext) network(canvas);

	function network(canvas) {
		var ctx = canvas.getContext('2d'), W, H, nodes = [], edges = [], pulses = [], visible = true;
		var LAYERS = [4, 6, 7, 6, 3];

		function build() {
			var rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = rect.width; H = rect.height;
			canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			nodes = []; edges = [];
			var x0 = W * 0.05, x1 = W * (W < 900 ? 0.95 : 0.6);
			LAYERS.forEach(function (n, li) {
				var x = x0 + (x1 - x0) * li / (LAYERS.length - 1);
				for (var i = 0; i < n; i++) {
					nodes.push({ x: x, y: H * 0.15 + (H * 0.6) * (i + 0.5) / n, layer: li, glow: 0 });
				}
			});
			nodes.forEach(function (a, ai) {
				nodes.forEach(function (b, bi) { if (b.layer === a.layer + 1) edges.push([ai, bi]); });
			});
		}

		function draw() {
			ctx.clearRect(0, 0, W, H);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#ffffff0f';
			ctx.beginPath();
			edges.forEach(function (e) { var a = nodes[e[0]], b = nodes[e[1]]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); });
			ctx.stroke();
			pulses.forEach(function (p) {
				var a = nodes[p.e[0]], b = nodes[p.e[1]];
				var x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
				var tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.18), ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.18);
				var grad = ctx.createLinearGradient(tx, ty, x, y);
				grad.addColorStop(0, '#e3122c00'); grad.addColorStop(1, '#e3122ccc');
				ctx.strokeStyle = grad; ctx.lineWidth = 2;
				ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
			});
			nodes.forEach(function (n) {
				ctx.fillStyle = n.glow > 0.05 ? 'rgba(227,18,44,' + (0.35 + n.glow * 0.65) + ')' : '#ffffff26';
				ctx.beginPath(); ctx.arc(n.x, n.y, 3 + n.glow * 3, 0, Math.PI * 2); ctx.fill();
			});
		}

		function fire(fromNode) {
			edges.forEach(function (e, ei) {
				if (e[0] === fromNode && Math.random() < 0.35) pulses.push({ e: e, t: 0, speed: 0.012 + Math.random() * 0.01 });
			});
		}

		var last = 0;
		function tick(now) {
			if (visible) {
				if (now - last > 900) {
					last = now;
					var inputs = nodes.filter(function (n) { return n.layer === 0; });
					fire(nodes.indexOf(inputs[Math.floor(Math.random() * inputs.length)]));
				}
				pulses = pulses.filter(function (p) {
					p.t += p.speed;
					if (p.t >= 1) { var n = nodes[p.e[1]]; n.glow = 1; if (pulses.length < 60) fire(p.e[1]); return false; }
					return true;
				});
				nodes.forEach(function (n) { n.glow *= 0.95; });
				draw();
			}
			requestAnimationFrame(tick);
		}

		build();
		draw();
		window.addEventListener('resize', function () { build(); draw(); });
		if (reduceMotion) return;
		if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
		requestAnimationFrame(tick);
	}
})();
