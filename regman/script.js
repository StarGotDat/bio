document.addEventListener('DOMContentLoaded', function () {

    // ── Dev tools protection ──
    document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && 'acxv'.includes(e.key.toLowerCase())) { e.preventDefault(); return false; }
        if (e.key === 'F12' ||
            (e.ctrlKey && 'ijus'.includes(e.key.toLowerCase())) ||
            (e.ctrlKey && e.shiftKey && 'ijc'.includes(e.key.toLowerCase()))) {
            e.preventDefault(); return false;
        }
    });
    document.addEventListener('selectstart', e => { e.preventDefault(); return false; });
    document.addEventListener('dragstart', e => { e.preventDefault(); return false; });
    if (window.top !== window.self) window.top.location = window.self.location;

    // ── Copy Discord ──
    window.copyDiscord = function () {
        navigator.clipboard.writeText('theregualrman').then(function () {
            const tooltip = document.getElementById('discord-copied');
            if (tooltip) {
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 1500);
            }
        });
    };

    // ── View counter ──
    const viewApi = 'https://2rich.xyz/api/views';
    const VIEW_OFFSET = 432;
    async function fetchViewCount() {
        const el = document.getElementById('view-count');
        try {
            const res = await fetch(viewApi, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const count = (data.views !== undefined ? data.views : 0) + VIEW_OFFSET;
            el.textContent = count.toLocaleString();
            el.setAttribute('aria-label', `View count: ${count.toLocaleString()}`);
        } catch {
            el.textContent = VIEW_OFFSET.toLocaleString();
            el.setAttribute('aria-label', `View count: ${VIEW_OFFSET}`);
        }
    }
    fetchViewCount();

    // ══════════════════════════════════════════════
    //  BACKGROUND PARTICLE SYSTEM
    // ══════════════════════════════════════════════
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.fadeDirection * 0.003;
                if (this.opacity <= 0.05 || this.opacity >= 0.55) this.fadeDirection *= -1;
                if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 58, 237, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateBg() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            drawLines();
            requestAnimationFrame(animateBg);
        }
        animateBg();
    }

    // ══════════════════════════════════════════════
    //  C++ MOUSE SPARKLE TRAIL
    // ══════════════════════════════════════════════
    const sparkleCanvas = document.getElementById('sparkles');
    if (sparkleCanvas) {
        const sCtx = sparkleCanvas.getContext('2d');
        let sW, sH;
        const sparkles = [];
        let mouseX = -100, mouseY = -100;
        let lastSpawn = 0;

        // C++ themed symbols that sparkle from the cursor
        const cppSymbols = [
            '++', '::', '{}', '<>', '//', '<<', '>>', '&&', '||',
            '*', '#', '~', '->', '=>', '!=', '==', '[]', '()',
            'int', 'void', 'std', 'new', 'ptr', 'cpp', 'null',
            '#include', 'template', 'class', 'const', 'auto',
            '0x', '&', ';', '/**/'
        ];

        function resizeSparkle() {
            sW = sparkleCanvas.width = window.innerWidth;
            sH = sparkleCanvas.height = window.innerHeight;
        }
        resizeSparkle();
        window.addEventListener('resize', resizeSparkle);

        class Sparkle {
            constructor(x, y) {
                this.x = x + (Math.random() - 0.5) * 20;
                this.y = y + (Math.random() - 0.5) * 20;
                this.vx = (Math.random() - 0.5) * 1.2;
                this.vy = -Math.random() * 1.2 - 0.2;
                this.gravity = 0.015;
                this.opacity = 1;
                this.decay = Math.random() * 0.005 + 0.004;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.03;
                this.scale = Math.random() * 0.5 + 0.5;

                // Randomly choose: symbol text or glowing dot
                if (Math.random() > 0.35) {
                    this.type = 'symbol';
                    this.symbol = cppSymbols[Math.floor(Math.random() * cppSymbols.length)];
                    this.fontSize = Math.random() * 8 + 10;
                } else {
                    this.type = 'dot';
                    this.radius = Math.random() * 3 + 1;
                }

                // Color palette — purples and cyans like a code editor
                const colors = [
                    [124, 58, 237],   // purple
                    [167, 139, 250],  // light purple
                    [139, 92, 246],   // violet
                    [96, 165, 250],   // blue
                    [34, 211, 238],   // cyan
                    [248, 113, 113],  // red (for keywords)
                    [74, 222, 128],   // green (for strings)
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.vy += this.gravity;
                this.y += this.vy;
                this.opacity -= this.decay;
                this.rotation += this.rotSpeed;
                this.scale *= 0.997;
                return this.opacity > 0;
            }

            draw() {
                sCtx.save();
                sCtx.translate(this.x, this.y);
                sCtx.rotate(this.rotation);
                sCtx.scale(this.scale, this.scale);
                sCtx.globalAlpha = Math.max(0, this.opacity);

                const [r, g, b] = this.color;

                if (this.type === 'symbol') {
                    // Glow effect
                    sCtx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
                    sCtx.shadowBlur = 8;

                    sCtx.font = `bold ${this.fontSize}px 'Consolas', 'Fira Code', 'Courier New', monospace`;
                    sCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    sCtx.textAlign = 'center';
                    sCtx.textBaseline = 'middle';
                    sCtx.fillText(this.symbol, 0, 0);
                } else {
                    // Glowing dot
                    sCtx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
                    sCtx.shadowBlur = 12;

                    sCtx.beginPath();
                    sCtx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    sCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    sCtx.fill();
                }

                sCtx.restore();
            }
        }

        // Track mouse
        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateSparkles(timestamp) {
            sCtx.clearRect(0, 0, sW, sH);

            // Spawn new sparkles on mouse move (throttled)
            if (timestamp - lastSpawn > 30 && mouseX > 0 && mouseY > 0) {
                const count = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < count; i++) {
                    sparkles.push(new Sparkle(mouseX, mouseY));
                }
                lastSpawn = timestamp;
            }

            // Update and draw
            for (let i = sparkles.length - 1; i >= 0; i--) {
                if (!sparkles[i].update()) {
                    sparkles.splice(i, 1);
                } else {
                    sparkles[i].draw();
                }
            }

            requestAnimationFrame(animateSparkles);
        }
        requestAnimationFrame(animateSparkles);
    }

    // ══════════════════════════════════════════════
    //  ENTER OVERLAY + VIDEO/AUDIO
    // ══════════════════════════════════════════════
    const overlay = document.getElementById('enter-overlay');
    const video = document.getElementById('bg-video');

    // Start video muted immediately (browsers allow muted autoplay)
    if (video) {
        video.muted = true;
        video.play().catch(() => {});
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            // Unmute video audio on real click
            if (video) {
                video.muted = false;
                video.volume = 0.3;
                video.play().catch(() => {});
            }
            // Fade out overlay
            overlay.classList.add('hidden');
        });
    }

    // ══════════════════════════════════════════════
    //  SUBTLE CARD PARALLAX
    // ══════════════════════════════════════════════
    const card = document.getElementById('profile-card');
    if (card) {
        document.addEventListener('mousemove', function (e) {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 60;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        document.addEventListener('mouseleave', function () {
            card.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
        card.style.transition = 'transform 0.15s ease-out';
        card.style.transformStyle = 'preserve-3d';
    }
});
