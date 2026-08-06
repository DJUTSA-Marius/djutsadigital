/* =========================================================
   DJUTSA DIGITAL — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initLoader();
    initCursor();
    initThreeJS();
    initGSAP();
    initNavigation();
    initJourneyLine();
    initDevConsole();
    initCommandPalette();
    initRecruiterMode();
    initSkillOrbs();
    initCardTracking();
    initContactForm();
    initMobileMenu();
    initProjectImages();
    initThemeWatcher();
});

function initLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 2200);
}

function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const ring = document.getElementById('cursor-ring');
    const dot = document.getElementById('cursor-dot');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function animate() {
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
        requestAnimationFrame(animate);
    }
    animate();
    document.querySelectorAll('a, button, .skill-orb, .dd-card, .tech-card, .project-card, .cert-card, .exp-card, .palette-item').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    document.addEventListener('mousedown', () => ring.classList.add('click'));
    document.addEventListener('mouseup', () => ring.classList.remove('click'));
}

function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sphereGeo = new THREE.IcosahedronGeometry(2, 2);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x3B82F6, wireframe: true, transparent: true, opacity: 0.15 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x22D3EE, transparent: true, opacity: 0.6 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(59,130,246,0.4)');
    grad.addColorStop(0.5, 'rgba(34,211,238,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending }));
    glowSprite.scale.set(8, 8, 1);
    scene.add(glowSprite);

    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 12;
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x3B82F6, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.08 });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particlesCount * particlesCount * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    camera.position.z = 6;
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    let scrollIntensity = 0;
    window.addEventListener('scroll', () => {
        scrollIntensity = Math.min(window.scrollY / window.innerHeight, 1);
    }, { passive: true });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.005;
        targetX += (mouseX * 0.5 - targetX) * 0.02;
        targetY += (mouseY * 0.5 - targetY) * 0.02;
        sphere.rotation.x = time + targetY * 0.5;
        sphere.rotation.y = time * 0.8 + targetX * 0.5;
        core.rotation.x = -time * 0.5;
        core.rotation.y = time * 0.3;
        core.scale.setScalar(1 + Math.sin(time * 3) * 0.1 + scrollIntensity * 0.3);
        coreMat.opacity = 0.4 + scrollIntensity * 0.4;
        glowSprite.position.set(targetX, targetY, 0);
        glowSprite.material.opacity = 0.3 + scrollIntensity * 0.3;
        particles.rotation.y = time * 0.05;
        const positions = particles.geometry.attributes.position.array;
        let lineIdx = 0;
        const maxDist = 1.5;
        for (let i = 0; i < particlesCount; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            positions[ix] += Math.sin(time + i) * 0.002;
            positions[iy] += Math.cos(time + i * 0.5) * 0.002;
            for (let j = i + 1; j < particlesCount; j++) {
                const jx = j * 3, jy = j * 3 + 1, jz = j * 3 + 2;
                const dx = positions[ix] - positions[jx];
                const dy = positions[iy] - positions[jy];
                const dz = positions[iz] - positions[jz];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < maxDist) {
                    linePositions[lineIdx++] = positions[ix];
                    linePositions[lineIdx++] = positions[iy];
                    linePositions[lineIdx++] = positions[iz];
                    linePositions[lineIdx++] = positions[jx];
                    linePositions[lineIdx++] = positions[jy];
                    linePositions[lineIdx++] = positions[jz];
                }
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, lineIdx / 3);
        lineGeo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
        return;
    }
    gsap.to('.hero-element', { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 2.3 });
    document.querySelectorAll('.reveal').forEach(el => {
        gsap.to(el, {
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    });
}

function initNavigation() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        const current = window.scrollY;
        if (current > 100) nav.querySelector('.glass').style.padding = '0';
        else nav.querySelector('.glass').style.padding = '';
    }, { passive: true });
}

function initJourneyLine() {
    const progress = document.getElementById('journey-progress');
    const nodes = document.querySelectorAll('.journey-node');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (scrollTop / docHeight) * 100;
        progress.style.height = pct + '%';
        nodes.forEach(node => {
            const nodeTop = parseFloat(node.style.top);
            if (pct >= nodeTop - 5) node.classList.add('active');
            else node.classList.remove('active');
        });
    }, { passive: true });
}

function initDevConsole() {
    const consoleEl = document.getElementById('dev-console');
    const output = document.getElementById('console-output');
    const input = document.getElementById('console-input');
    const closeBtn = document.getElementById('close-console');
    let history = [], histIdx = -1;

    const commands = {
        help: () => `Commandes disponibles :<br>  about — Présentation<br>  skills — Compétences<br>  experiences — Expériences en entreprise<br>  certifications — Certifications obtenues<br>  projects — Projets<br>  contact — Coordonnées<br>  restaurant — Étude de cas restaurant<br>  cv — Télécharger CV<br>  clear — Effacer`,
        about: () => `Marius DJUTSA — Développeur Full Stack<br>Cameroun • Mobile • Web • Desktop<br>Passionné par l'excellence technique et le design.`,
        skills: () => `Flutter/Dart • React/Next.js • Java • TypeScript<br>Firebase • MySQL • Figma • UML/Merise`,
        experiences: () => `Expériences :<br>• Développeur Full Stack — Entreprise XYZ (2024-Présent)<br>• Stagiaire Mobile — Tech Solutions (Juin-Sept 2023)<br>• Stagiaire Web — Agence CréaWeb (Mars-Juin 2023)<br>• Projet Fin d'Études — Partenaire Université (2022-2023)<br><br>Attestations disponibles pour toutes les expériences.`,
        certifications: () => `Certifications :<br>• Responsive Web Design — freeCodeCamp (Validée)<br>• JavaScript Algorithms & Data Structures — freeCodeCamp (En cours)<br>• Google Cloud Digital Leader — Google (À venir)`,
        projects: () => `1. Gestion de Restaurant (Flutter/Firebase)<br>2. E-Commerce Mobile (Flutter/Stripe)<br>3. Dashboard Analytics (React/D3.js)`,
        contact: () => `Email: djutsamarius@gmail.com<br>Tél: +237 688 850 245<br>LinkedIn / GitHub: @mariusdjutsa`,
        restaurant: () => `Projet phare : Gestion de Restaurant<br>• Flutter + Firebase<br>• Architecture MVC<br>• Synchro temps réel<br>• Interface intuitive`,
        cv: () => {
            const link = document.createElement('a');
            link.href = 'djutsa-digital-cv.pdf';
            link.download = 'djutsa-digital-cv.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            return `Téléchargement du CV lancé (djutsa-digital-cv.pdf)...`;
        },
        clear: () => {
            output.innerHTML = '';
            return '';
        }
    };

    function log(msg, type = 'out') {
        if (!msg) return;
        const div = document.createElement('div');
        div.className = type;
        div.innerHTML = msg;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            if (!cmd) return;
            history.push(cmd);
            histIdx = history.length;
            log('<span class="text-dd-accent2">$ ' + cmd + '</span>', 'cmd');
            if (commands[cmd]) log(commands[cmd]());
            else log('Commande inconnue : ' + cmd + '<br>Tapez "help" pour la liste.', 'err');
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                input.value = history[histIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                input.value = history[histIdx];
            } else {
                histIdx = history.length;
                input.value = '';
            }
        }
    });

    closeBtn.addEventListener('click', () => consoleEl.classList.remove('active'));
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            consoleEl.classList.toggle('active');
            if (consoleEl.classList.contains('active')) setTimeout(() => input.focus(), 100);
        }
    });
    window.closeConsole = () => consoleEl.classList.remove('active');
}

function initCommandPalette() {
    const palette = document.getElementById('cmd-palette');
    const input = document.getElementById('palette-input');
    const list = document.getElementById('palette-list');
    const items = Array.from(list.querySelectorAll('.palette-item'));
    let selectedIdx = 0;

    function updateSelection() {
        items.forEach((item, i) => item.classList.toggle('selected', i === selectedIdx));
        if (items[selectedIdx]) items[selectedIdx].scrollIntoView({ block: 'nearest' });
    }

    function execute(item) {
        const action = item.dataset.action;
        if (action === 'goto') {
            const target = document.getElementById(item.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'recruiter') {
            document.getElementById('recruiter-mode').classList.add('active');
        }
        palette.classList.remove('active');
        input.value = '';
        filterItems('');
    }

    function filterItems(query) {
        const q = query.toLowerCase();
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? 'flex' : 'none';
        });
        selectedIdx = 0;
        updateSelection();
    }

    input.addEventListener('input', () => filterItems(input.value));
    input.addEventListener('keydown', (e) => {
        const visible = items.filter(i => i.style.display !== 'none');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIdx = (selectedIdx + 1) % visible.length;
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIdx = (selectedIdx - 1 + visible.length) % visible.length;
            updateSelection();
        } else if (e.key === 'Enter') {
            execute(visible[selectedIdx]);
        } else if (e.key === 'Escape') {
            palette.classList.remove('active');
        }
    });

    items.forEach((item, i) => {
        item.addEventListener('mouseenter', () => {
            selectedIdx = i;
            updateSelection();
        });
        item.addEventListener('click', () => execute(item));
    });

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            palette.classList.toggle('active');
            if (palette.classList.contains('active')) setTimeout(() => input.focus(), 50);
        } else if (e.key === 'Escape') {
            palette.classList.remove('active');
        }
    });
    palette.addEventListener('click', (e) => {
        if (e.target === palette) palette.classList.remove('active');
    });
}

function initRecruiterMode() {
    const mode = document.getElementById('recruiter-mode');
    document.getElementById('btn-recruiter').addEventListener('click', () => mode.classList.add('active'));
    document.getElementById('btn-recruiter-mobile').addEventListener('click', () => mode.classList.add('active'));
    document.getElementById('close-recruiter').addEventListener('click', () => mode.classList.remove('active'));
    window.closeRecruiter = () => mode.classList.remove('active');
}

function initSkillOrbs() {
    const skillData = {
        mobile: { title: 'Développement Mobile', items: ['Flutter', 'Dart', 'Java (Android)', 'React Native', 'Kotlin'] },
        web: { title: 'Développement Web', items: ['React / Next.js', 'TypeScript', 'HTML5 / CSS3', 'Tailwind CSS', 'Node.js'] },
        desktop: { title: 'Développement Desktop', items: ['Java (Swing/JavaFX)', 'C# (.NET)', 'Flutter Desktop', 'Electron', 'Visual Basic'] },
        uxui: { title: 'Design UX/UI', items: ['Figma', 'Adobe XD', 'Prototypage', 'Design System', 'Adobe Photoshop / Illustrator'] },
        database: { title: 'Bases de Données', items: ['MySQL', 'PostgreSQL', 'Firebase (NoSQL)', 'SQLite', 'MongoDB Basics'] },
        modeling: { title: 'Modélisation', items: ['UML', 'Merise', 'Diagrammes de classes', 'MCD/MLD/MPD', 'Architecture logicielle'] }
    };
    const panel = document.getElementById('skill-details');
    const title = document.getElementById('skill-title');
    const content = document.getElementById('skill-content');

    document.querySelectorAll('.skill-orb').forEach(orb => {
        orb.addEventListener('click', () => {
            const key = orb.dataset.skill;
            const data = skillData[key];
            if (!data) return;
            title.textContent = data.title;
            content.innerHTML = data.items.map(item =>
                `<div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <i data-lucide="check-circle-2" class="w-5 h-5 text-dd-accent flex-shrink-0"></i>
                    <span class="text-sm">${item}</span>
                </div>`
            ).join('');
            panel.classList.remove('hidden');
            lucide.createIcons();
            gsap.fromTo(panel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        });
    });
}

function initCardTracking() {
    document.querySelectorAll('.dd-card, .cert-card, .exp-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        status.textContent = 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.';
        status.className = 'text-center text-sm text-dd-success mt-4';
        status.classList.remove('hidden');
        form.reset();
        setTimeout(() => status.classList.add('hidden'), 5000);
    });
}

function initMobileMenu() {
    const btn = document.getElementById('btn-mobile-menu');
    const menu = document.getElementById('mobile-menu');
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));
}

/* =========================================================
   Gestion des images des études de cas (upload après réalisation)
   Les images sont stockées en local (localStorage, base64)
   afin que Marius puisse les ajouter lui-même une fois le
   projet terminé, sans toucher au code.
   ========================================================= */
function initProjectImages() {
    const STORAGE_PREFIX = 'dd-project-image-';
    const slots = document.querySelectorAll('.project-image-slot');

    slots.forEach(slot => {
        const id = slot.dataset.projectId;
        if (!id) return;
        const input = slot.querySelector('.project-image-input');
        const addBtn = slot.querySelector('.project-image-add');
        const removeBtn = slot.querySelector('.project-image-remove');

        // Charger l'image sauvegardée si elle existe
        try {
            const saved = localStorage.getItem(STORAGE_PREFIX + id);
            if (saved) applyImage(slot, saved);
        } catch (err) {
            console.warn('Impossible de lire le stockage local :', err);
        }

        if (addBtn && input) {
            addBtn.addEventListener('click', () => input.click());
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                    alert('Merci de sélectionner un fichier image.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = reader.result;
                    applyImage(slot, dataUrl);
                    try {
                        localStorage.setItem(STORAGE_PREFIX + id, dataUrl);
                    } catch (err) {
                        console.warn('Stockage local plein ou indisponible :', err);
                    }
                };
                reader.readAsDataURL(file);
                input.value = '';
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                slot.classList.remove('has-image');
                slot.style.backgroundImage = '';
                try {
                    localStorage.removeItem(STORAGE_PREFIX + id);
                } catch (err) { /* noop */ }
            });
        }
    });

    function applyImage(slot, dataUrl) {
        slot.style.backgroundImage = `url("${dataUrl}")`;
        slot.classList.add('has-image');
    }
}

/* =========================================================
   Thème système : le portfolio suit automatiquement le thème
   clair/sombre du système d'exploitation (prefers-color-scheme).
   Cette fonction se contente de rafraîchir les icônes lucide
   au changement de thème (certaines classes de couleur Tailwind
   dépendent de variables CSS qui se mettent déjà à jour seules).
   ========================================================= */
function initThemeWatcher() {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
        // Les variables CSS se rechargent automatiquement via la media query.
        // On force juste un repaint des icônes pour éviter tout artefact visuel.
        if (window.lucide) lucide.createIcons();
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
}
