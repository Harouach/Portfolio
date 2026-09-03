(function () {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var particles = [];
    var width, height, dpr;
    var dotColor = '255,255,255';
    var lineColor = '255,0,0';
    var maxDist = 140;
    var colorReadCounter = 0;

    function hexToRgb(hex) {
        hex = hex.trim().replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        var num = parseInt(hex, 16);
        return (num >> 16 & 255) + ',' + (num >> 8 & 255) + ',' + (num & 255);
    }

    function readColors() {
        var styles = getComputedStyle(document.documentElement);
        var accent = styles.getPropertyValue('--accent-red').trim();
        var text = styles.getPropertyValue('--text-white').trim();
        if (accent) lineColor = hexToRgb(accent);
        if (text) dotColor = hexToRgb(text);
    }

    function particleCount() {
        var area = width * height;
        return Math.min(90, Math.max(30, Math.round(area / 16000)));
    }

    function createParticles() {
        var count = particleCount();
        particles = [];
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25
            });
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createParticles();
    }

    function step() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            p.x = Math.max(0, Math.min(width, p.x));
            p.y = Math.max(0, Math.min(height, p.y));
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var a = particles[i], b = particles[j];
                var dx = a.x - b.x, dy = a.y - b.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    ctx.strokeStyle = 'rgba(' + lineColor + ',' + (0.15 * (1 - dist / maxDist)) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + dotColor + ',0.5)';
            ctx.fill();
        }
    }

    var rafId = null;
    function loop() {
        colorReadCounter++;
        if (colorReadCounter % 45 === 0) readColors();
        step();
        draw();
        rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!reduceMotion && !rafId) {
            rafId = requestAnimationFrame(loop);
        }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });

    readColors();
    resize();

    if (reduceMotion) {
        draw();
    } else {
        rafId = requestAnimationFrame(loop);
    }
})();
