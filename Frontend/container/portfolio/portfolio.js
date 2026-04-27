function initPortfolioCardParticles() {
    const canvases = Array.from(document.querySelectorAll('.portfolio-card-canvas'));
    if (canvases.length === 0) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const colors = ['#b057d5', '#d45b98', '#ff8453', '#4a4869', '#3e285c'];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const systems = canvases
        .map((canvas) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const parent = canvas.parentElement;
            if (!parent) return null;

            const particleCount = 18;
            const particles = [];

            const sys = {
                canvas,
                ctx,
                parent,
                width: 0,
                height: 0,
                particles,
                resize() {
                    const rect = parent.getBoundingClientRect();
                    const w = Math.max(1, Math.floor(rect.width));
                    const h = Math.max(1, Math.floor(rect.height));
                    this.width = w;
                    this.height = h;
                    canvas.width = Math.floor(w * dpr);
                    canvas.height = Math.floor(h * dpr);
                    canvas.style.width = `${w}px`;
                    canvas.style.height = `${h}px`;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                },
            };

            class Particle {
                constructor() {
                    this.reset(true);
                }
                reset(isInit = false) {
                    this.x = Math.random() * sys.width;
                    this.y = isInit ? Math.random() * sys.height : sys.height + 10;
                    this.vy = -(Math.random() * 0.35 + 0.08);
                    this.vx = (Math.random() - 0.5) * 0.25;
                    this.size = Math.random() * 2.2 + 0.5;
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                    this.alpha = Math.random() * 0.45 + 0.08;
                    this.life = Math.random() * 100;
                }
                update() {
                    this.y += this.vy;
                    this.x += this.vx;
                    this.life += 1;
                    this.x += Math.sin(this.life / 60) * 0.25;

                    if (this.y < -10) this.reset(false);
                    if (this.x < -10) this.x = sys.width + 10;
                    if (this.x > sys.width + 10) this.x = -10;
                }
                draw() {
                    const { ctx } = sys;
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.restore();
                }
            }

            sys.resize();
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());

            return sys;
        })
        .filter(Boolean);

    if (systems.length === 0) return;

    const ro = new ResizeObserver(() => {
        systems.forEach((s) => s.resize());
    });
    systems.forEach((s) => ro.observe(s.parent));

    let raf = 0;
    function animate() {
        systems.forEach((s) => {
            s.ctx.clearRect(0, 0, s.width, s.height);
            s.particles.forEach((p) => {
                p.update();
                p.draw();
            });
        });
        raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    window.addEventListener('beforeunload', () => {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioCardParticles);
} else {
    initPortfolioCardParticles();
}

