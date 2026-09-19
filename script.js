/* ==========================================================================
   ALTYNAI ROMANTIC GREETING CARD - INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE VARIABLES ---
  let currentScene = 1;
  const totalScenes = 8;
  let audioPlaying = false;
  let audioContext = null;
  let synthInterval = null;
  let easterEggTapCount = 0;

  // DOM Elements
  const progressFill = document.getElementById('progress-fill');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const toastEl = document.getElementById('toast');

  // --- PARTICLE ENGINE ---
  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;

  function resizeCanvas() {
    if (!canvas) return;
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, isBurst = false) {
      this.x = x || Math.random() * canvasWidth;
      this.y = y || (isBurst ? canvasHeight / 2 : canvasHeight + 20);
      this.size = Math.random() * 12 + 8;
      this.speedY = isBurst ? (Math.random() - 0.7) * 5 : -(Math.random() * 1.2 + 0.6);
      this.speedX = isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 1.5;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
      this.opacity = isBurst ? 1 : Math.random() * 0.6 + 0.3;
      this.fadeSpeed = isBurst ? Math.random() * 0.015 + 0.008 : 0;
      this.isHeart = Math.random() > 0.3;
      this.color = ['#F4A5A5', '#D98880', '#F7C5C5', '#E88D8D'][Math.floor(Math.random() * 4)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
      if (this.fadeSpeed > 0) {
        this.opacity -= this.fadeSpeed;
      }

      // Reset ambient particles when out of screen
      if (!this.fadeSpeed && this.y < -20) {
        this.y = canvasHeight + 20;
        this.x = Math.random() * canvasWidth;
      }
    }

    draw() {
      if (this.opacity <= 0 || !ctx) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.isHeart) {
        // Draw small heart shape
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
        ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Populate ambient background particles
  function initAmbientParticles() {
    particles = [];
    const count = window.innerWidth < 480 ? 15 : 25;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function spawnBurst(x, y, count = 35) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, true));
    }
  }

  function animateParticles() {
    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  initAmbientParticles();
  animateParticles();

  // --- NAVIGATION / SCENE PROGRESSION ---
  function updateProgressBar(sceneNum) {
    if (progressFill) {
      const percent = (sceneNum / totalScenes) * 100;
      progressFill.style.width = `${percent}%`;
    }
  }

  function goToScene(targetScene) {
    if (targetScene < 1 || targetScene > totalScenes) return;

    const currentSceneEl = document.getElementById(`scene-${currentScene}`);
    const nextSceneEl = document.getElementById(`scene-${targetScene}`);

    if (currentSceneEl) {
      currentSceneEl.classList.remove('active');
    }

    currentScene = targetScene;
    updateProgressBar(currentScene);

    setTimeout(() => {
      if (nextSceneEl) {
        nextSceneEl.classList.add('active');
        // Scroll to top of scene content if needed
        nextSceneEl.scrollTop = 0;
      }

      // Trigger Scene-specific animations
      onSceneEntered(targetScene);
    }, 400);
  }

  function onSceneEntered(sceneNum) {
    if (sceneNum === 6) {
      triggerSincereMessageSequence();
    } else if (sceneNum === 7) {
      resetQuestionState();
    } else if (sceneNum === 8) {
      spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
    }
  }

  // --- BUTTON EVENT BINDINGS ---
  document.getElementById('btn-scene-1-next')?.addEventListener('click', () => goToScene(2));
  document.getElementById('btn-scene-2-next')?.addEventListener('click', () => {
    // Lean teddy forward slightly
    const teddy = document.querySelector('#scene-2 .teddy-bear-group');
    if (teddy) teddy.style.transform = 'translateY(10px) rotate(4deg)';
    setTimeout(() => goToScene(3), 300);
  });
  document.getElementById('btn-scene-3-next')?.addEventListener('click', () => goToScene(4));
  document.getElementById('btn-scene-4-next')?.addEventListener('click', () => goToScene(5));
  document.getElementById('btn-scene-5-next')?.addEventListener('click', () => goToScene(6));
  document.getElementById('btn-scene-6-next')?.addEventListener('click', () => goToScene(7));
  document.getElementById('btn-scene-7-next')?.addEventListener('click', () => goToScene(8));

  // --- SCENE 5 GIFT REVEAL INTERACTION ---
  const btnOpenGift = document.getElementById('btn-open-gift');
  const giftBox = document.getElementById('gift-box');
  const giftTextInitial = document.getElementById('gift-text-initial');
  const giftTextOpened = document.getElementById('gift-text-opened');

  function openGiftBox() {
    if (giftBox) giftBox.classList.add('opened');
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.4, 30);
    
    setTimeout(() => {
      if (giftTextInitial) giftTextInitial.style.display = 'none';
      if (giftTextOpened) giftTextOpened.classList.add('show');
    }, 500);
  }

  btnOpenGift?.addEventListener('click', openGiftBox);
  giftBox?.addEventListener('click', openGiftBox);

  // --- SCENE 6 TIMED SINCERITY SEQUENCE ---
  function triggerSincereMessageSequence() {
    const step2 = document.getElementById('sincere-step-2');
    const step3 = document.getElementById('sincere-step-3');

    if (step2) {
      setTimeout(() => step2.classList.add('show'), 1200);
    }
    if (step3) {
      setTimeout(() => step3.classList.add('show'), 2800);
    }
  }

  // --- SCENE 7 INTERACTIVE "ДА" / "НЕТ" QUESTION ---
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const questionActions = document.getElementById('question-actions');
  const responseYes = document.getElementById('response-yes');
  const responseNo = document.getElementById('response-no');
  const btnRetry = document.getElementById('btn-retry');

  function resetQuestionState() {
    if (questionActions) questionActions.style.display = 'flex';
    if (responseYes) responseYes.classList.remove('show');
    if (responseNo) responseNo.classList.remove('show');
    if (btnNo) {
      btnNo.style.transform = 'none';
      btnNo.style.position = 'static';
    }
  }

  btnYes?.addEventListener('click', () => {
    if (questionActions) questionActions.style.display = 'none';
    if (responseYes) responseYes.classList.add('show');
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.45, 50);
  });

  btnNo?.addEventListener('click', () => {
    if (questionActions) questionActions.style.display = 'none';
    if (responseNo) responseNo.classList.add('show');
  });

  btnRetry?.addEventListener('click', resetQuestionState);

  // Playful dodging button effect for "Нет"
  if (btnNo) {
    const dodgeHandler = (e) => {
      // Small random shift away from touch/pointer
      const moveX = (Math.random() - 0.5) * 90;
      const moveY = (Math.random() - 0.5) * 60;
      btnNo.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    btnNo.addEventListener('mouseenter', dodgeHandler);
    btnNo.addEventListener('touchstart', dodgeHandler, { passive: true });
  }

  // --- EASTER EGG SYSTEM ---
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  document.querySelectorAll('[data-easter-egg="true"]').forEach(bearEl => {
    bearEl.addEventListener('click', (e) => {
      easterEggTapCount++;
      const rect = bearEl.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

      if (easterEggTapCount >= 4) {
        showToast('Ну всё, хватит меня тыкать 😂❤️');
        easterEggTapCount = 0;
      }
    });
  });

  // --- AUDIO SYNTHESIZER & MUSIC CONTROLLER ---
  function startWebAudioSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();

      // Soft music box pentatonic lullaby notes (Hz)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C5 E5 G5
      let step = 0;

      synthInterval = setInterval(() => {
        if (!audioPlaying || !audioContext) return;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const freq = notes[step % notes.length];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 1.25);

        step = (step + Math.floor(Math.random() * 2) + 1) % notes.length;
      }, 550);
    } catch (err) {
      console.log('Web Audio Synth unavailable:', err);
    }
  }

  function stopWebAudioSynth() {
    if (synthInterval) clearInterval(synthInterval);
    if (audioContext) audioContext.close();
    audioContext = null;
  }

  function toggleAudio() {
    if (!audioPlaying) {
      // Try playing MP3 audio file first
      if (bgMusic && bgMusic.src) {
        bgMusic.play().then(() => {
          audioPlaying = true;
          musicToggle?.classList.add('playing');
        }).catch(() => {
          // Fallback to synth if MP3 fails / doesn't exist
          audioPlaying = true;
          musicToggle?.classList.add('playing');
          startWebAudioSynth();
        });
      } else {
        audioPlaying = true;
        musicToggle?.classList.add('playing');
        startWebAudioSynth();
      }
    } else {
      audioPlaying = false;
      musicToggle?.classList.remove('playing');
      if (bgMusic) bgMusic.pause();
      stopWebAudioSynth();
    }
  }

  musicToggle?.addEventListener('click', toggleAudio);

});
