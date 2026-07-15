// --- LOADER ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 800);
});

// --- CURSOR CUSTOMIZADO ---
const cursor = document.querySelector('.custom-cursor');
const pointerFine = window.matchMedia('(pointer: fine)').matches;

if (pointerFine && cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    document.addEventListener('mouseover', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.borderColor = 'rgba(255,255,255,0.5)';
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.borderColor = 'white';
        }
    });
}

// --- ÁUDIO AUTOMÁTICO ---
const audio = document.getElementById('bg-music');

let audioInitialized = false;

if (audio) {
    audio.volume = 0.9;
    audio.preload = 'auto';
    audio.loop = true;
    audio.muted = false;
    audio.load();
}

function startBackgroundMusic(force = false) {
    if (!audio) return;
    if (!force && audioInitialized) return;

    audioInitialized = true;
    audio.currentTime = 0;
    audio.volume = 0.9;
    audio.loop = true;
    audio.muted = false;

    const tryPlay = () => {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {
                setTimeout(() => tryPlay(), 250);
            });
        }
    };

    tryPlay();
}

startBackgroundMusic(true);
setTimeout(() => startBackgroundMusic(true), 250);
setTimeout(() => startBackgroundMusic(true), 800);

window.addEventListener('load', () => {
    startBackgroundMusic(true);
    setTimeout(() => startBackgroundMusic(true), 300);
    setTimeout(() => startBackgroundMusic(true), 800);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        startBackgroundMusic(true);
    }
});

document.addEventListener('pointerdown', () => {
    startBackgroundMusic(true);
}, { once: true });

function playSound(id) {
    const sfx = document.getElementById(id);
    if (!sfx) return;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
}

const userAnswers = [];
let surpriseLayer = null;

function createSurpriseLayer() {
    if (surpriseLayer) return surpriseLayer;
    surpriseLayer = document.createElement('div');
    surpriseLayer.className = 'surprise-layer';
    document.body.appendChild(surpriseLayer);
    return surpriseLayer;
}

function triggerSurprise(event, button) {
    if (!button) return;
    const layer = createSurpriseLayer();
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('span');
        particle.className = 'surprise-particle';
        const offsetX = (Math.random() - 0.5) * 80;
        const offsetY = (Math.random() - 0.5) * 80 - 20;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--x', `${offsetX}px`);
        particle.style.setProperty('--y', `${offsetY}px`);
        particle.style.animationDelay = `${i * 0.03}s`;
        layer.appendChild(particle);
        setTimeout(() => particle.remove(), 900);
    }
}

function captureUserChoice(button) {
    if (!button) return;
    if (button.classList.contains('back-btn')) return;
    if (button.closest('#final-actions')) return;
    if (!button.closest('.card')) return;

    const answer = button.textContent.trim();
    if (answer) {
        userAnswers.push(answer);
    }
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    triggerSurprise(event, button);
    captureUserChoice(button);
});

// --- NAVEGAÇÃO ENTRE OS CARDS ---
let currentStep = 1;

function updateStoryState(step) {
    const statusEl = document.getElementById('story-status');
    const progressFill = document.getElementById('story-progress-fill');

    const messages = [
        'A história começou',
        'A curiosidade ficou mais forte',
        'O mistério ganhou forma',
        'A química começou a aparecer',
        'O coração ficou mais atento',
        'O clima ficou mais especial',
        'O destino entrou na conversa',
        'A emoção ficou mais viva',
        'O último detalhe apareceu',
        'O convite oficial chegou'
    ];

    if (statusEl) statusEl.textContent = messages[step - 1] || messages[messages.length - 1];
    if (progressFill) progressFill.style.width = `${Math.min(100, ((step - 1) / 9) * 100)}%`;

    const storyRail = document.querySelector('.story-rail');
    if (storyRail) {
        storyRail.style.display = step === 10 ? 'none' : 'block';
    }
}

function nextStep(step) {
    startBackgroundMusic();
    playSound('sound-click');

    currentStep = step;
    updateStoryState(step);

    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active');
    });

    document.querySelectorAll('.invitation-screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    if (step === 10) {
        const invitationScreen = document.getElementById('step10');
        invitationScreen.classList.remove('hidden');
        invitationScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        startTypewriter();
        return;
    }

    const targetCard = document.getElementById('step' + step);
    if (targetCard) {
        targetCard.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    playSound('sound-click');

    if (currentStep <= 1) return;

    const previousStep = currentStep - 1;
    nextStep(previousStep);
}

// --- TEXTO FINAL (ETAPA 10) - EFEITO DE DIGITAÇÃO ---
const finalParagraphs = [
    "Depois de algumas pesquisas altamente científicas... 🔬😂",
    "Cheguei a uma conclusão.",
    "<span class='highlight'>Acho que seria legal te conhecer além do Instagram.</span>",
    "Gostei das poucas conversas que tivemos e fiquei com a impressão de que você é uma pessoa interessante.",
    "Então pensei...",
    "Em vez de continuarmos só curtindo stories e trocando algumas mensagens...",
    "Que tal marcar um encontro?",
    "Pode ser um café ☕, um sorvete 🍨, uma caminhada 🌅 ou qualquer lugar tranquilo para conversar.",
    "Prometo levar:",
    "✅ Bom humor<br>✅ Curiosidade para te conhecer melhor<br>✅ Assuntos aleatórios<br>✅ Algumas piadas ruins (essas infelizmente vêm de fábrica 😂)",
    "Se a gente se divertir, ótimo.<br>Se não... pelo menos teremos uma boa história para contar. 😄",
    "<span class='highlight'>O que você acha? 😊❤️</span>"
];

let typeWriterStarted = false;

function startTypewriter() {
    if (typeWriterStarted) return;
    typeWriterStarted = true;
    
    const container = document.getElementById('typewriter-container');
    let pIndex = 0;
    
    function typeParagraph() {
        if (pIndex < finalParagraphs.length) {
            let p = document.createElement('p');
            p.innerHTML = finalParagraphs[pIndex];
            container.appendChild(p);
            
            // Força o scroll a descer conforme o texto aparece
            document.getElementById('step10').scrollTop = document.getElementById('step10').scrollHeight;
            
            setTimeout(() => {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
                pIndex++;
                setTimeout(typeParagraph, 1200); // Tempo entre as frases
            }, 50);
        } else {
            // Revela os botões finais
            document.getElementById('final-actions').classList.remove('hidden');
            document.getElementById('step10').scrollTop = document.getElementById('step10').scrollHeight;
        }
    }
    
    // Inicia após um breve atraso
    setTimeout(typeParagraph, 500);
}

// --- AÇÕES FINAIS ---
function showPersonalityResult() {
    return;
}

function buildWhatsAppMessage() {
    const dateInput = document.getElementById('chosen-date');
    const timeInput = document.getElementById('chosen-time');

    const selectedDate = dateInput && dateInput.value ? new Date(dateInput.value + 'T00:00:00').toLocaleDateString('pt-BR') : 'a combinar';
    const selectedTime = timeInput && timeInput.value ? timeInput.value : 'a combinar';

    return [
        'Oii Hélio! ',
        'Acabei de ver seu convite, salva meu número aii.',
        `Dia: ${selectedDate}`,
        `Horário: ${selectedTime}`
    ].join('\n');
}

function openWhatsAppSchedule() {
    const message = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/5544997670805?text=${message}`, '_blank', 'noopener,noreferrer');
}

const whatsappButton = document.getElementById('whatsapp-button');
if (whatsappButton) {
    whatsappButton.addEventListener('click', openWhatsAppSchedule);
}

function acceptInvitation(mode = 'normal') {
    startBackgroundMusic();
    playSound('sound-success');

    document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.invitation-screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    document.getElementById('step11-yes').classList.add('active');

    const title = document.querySelector('#step11-yes h1');
    const text = document.querySelector('#step11-yes p');
    const finalEcho = document.getElementById('final-echo');

    if (mode === 'fun') {
        title.textContent = 'Perfeito! 😄';
        text.textContent = 'Parece que a curiosidade venceu e agora a gente tem uma história pra criar juntos.';
    } else {
        title.textContent = 'Fico muito feliz!';
        text.textContent = 'Agora só falta combinarmos o dia.😊';
    }

    if (finalEcho) {
        finalEcho.textContent = '';
    }
    
    // Solta os confetes
    if (typeof confetti === 'function') {
        var duration = 4 * 1000;
        var end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff4d6d', '#c1121f', '#ffffff'] });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff4d6d', '#c1121f', '#ffffff'] });
            if (Date.now() < end) { requestAnimationFrame(frame); }
        }());
    }
}

// --- FUNDO DE PARTÍCULAS CANVAS ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function buildParticles() {
    const count = window.innerWidth < 768 ? 24 : 40;
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 0.8,
            speedX: Math.random() * 0.35 - 0.18,
            speedY: Math.random() * -0.35 - 0.08,
            opacity: Math.random() * 0.45 + 0.15
        });
    }
}

function resizeAndRebuild() {
    resizeCanvas();
    buildParticles();
}

window.addEventListener('resize', resizeAndRebuild);
resizeAndRebuild();

function animateParticles() {
    if (document.hidden) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
            p.speedX *= -1;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    animationFrameId = requestAnimationFrame(animateParticles);
}

function startParticles() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animateParticles();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else {
        startParticles();
    }
});

startParticles();