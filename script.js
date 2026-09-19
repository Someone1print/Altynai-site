/* ==========================================================================
   ALTYNAI ROMANTIC GREETING CARD - INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE VARIABLES ---
  let currentScene = 1;
  const totalScenes = 8;
  let easterEggTapCount = 0;

  // DOM Elements
  const progressFill = document.getElementById('progress-fill');
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const toastEl = document.getElementById('toast');

  // --- PARTICLE ENGINE (Soft Floating Petals & Hearts) ---
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
      this.size = Math.random() * 10 + 6;
      this.speedY = isBurst ? (Math.random() - 0.7) * 4.5 : -(Math.random() * 0.8 + 0.4);
      this.speedX = isBurst ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 1.2;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 1.5;
      this.opacity = isBurst ? 1 : Math.random() * 0.55 + 0.25;
      this.fadeSpeed = isBurst ? Math.random() * 0.015 + 0.008 : 0;
      this.isHeart = Math.random() > 0.4;
      this.color = ['#F7C0BA', '#C97A76', '#FAD4D0', '#EAA6A0', '#FDE8E5'][Math.floor(Math.random() * 5)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;
      if (this.fadeSpeed > 0) {
        this.opacity -= this.fadeSpeed;
      }

      // Reset ambient particles when leaving screen
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
        // Soft organic flower petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 1.8, this.size / 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function initAmbientParticles() {
    particles = [];
    const count = window.innerWidth < 480 ? 12 : 20;
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

  // --- SCENE NAVIGATION & PROGRESS BAR ---
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
        nextSceneEl.scrollTop = 0;
      }
      onSceneEntered(targetScene);
    }, 380);
  }

  function onSceneEntered(sceneNum) {
    if (sceneNum === 4) {
      // Re-trigger blooming animation
      const bouquet = document.querySelector('.bouquet-wrapper');
      if (bouquet) {
        bouquet.style.display = 'none';
        void bouquet.offsetWidth;
        bouquet.style.display = 'block';
      }
    } else if (sceneNum === 6) {
      triggerSincereMessageSequence();
    } else if (sceneNum === 7) {
      resetQuestionState();
    } else if (sceneNum === 8) {
      spawnBurst(window.innerWidth / 2, window.innerHeight * 0.4, 40);
    }
  }

  // --- BUTTON NAVIGATION EVENT BINDINGS ---
  document.getElementById('btn-scene-1-next')?.addEventListener('click', () => goToScene(2));

  document.getElementById('btn-scene-2-next')?.addEventListener('click', () => {
    // Animate bunny head tilt and paw forward before transitioning
    const bunnyGroup = document.querySelector('#bunny-scene-2 .bunny-group');
    if (bunnyGroup) {
      bunnyGroup.style.transform = 'translateY(6px) rotate(4deg)';
    }
    setTimeout(() => goToScene(3), 320);
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
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.38, 30);
    
    setTimeout(() => {
      if (giftTextInitial) giftTextInitial.style.display = 'none';
      if (giftTextOpened) giftTextOpened.classList.add('show');
    }, 450);
  }

  btnOpenGift?.addEventListener('click', openGiftBox);
  giftBox?.addEventListener('click', openGiftBox);

  // --- SCENE 6 SEQUENTIAL TIMED FADE-IN ---
  function triggerSincereMessageSequence() {
    const step2 = document.getElementById('sincere-step-2');
    const step3 = document.getElementById('sincere-step-3');
    const btnScene6 = document.getElementById('btn-scene-6-next');

    if (step2) {
      setTimeout(() => step2.classList.add('show'), 900);
    }
    if (step3) {
      setTimeout(() => step3.classList.add('show'), 2200);
    }
    if (btnScene6) {
      setTimeout(() => btnScene6.classList.add('show'), 2600);
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
    }
  }

  btnYes?.addEventListener('click', () => {
    if (questionActions) questionActions.style.display = 'none';
    if (responseYes) responseYes.classList.add('show');
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.42, 45);
  });

  btnNo?.addEventListener('click', () => {
    if (questionActions) questionActions.style.display = 'none';
    if (responseNo) responseNo.classList.add('show');
  });

  btnRetry?.addEventListener('click', resetQuestionState);

  // Playful dodging button effect for "Нет"
  if (btnNo) {
    const dodgeHandler = () => {
      const moveX = (Math.random() - 0.5) * 80;
      const moveY = (Math.random() - 0.5) * 50;
      btnNo.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    btnNo.addEventListener('mouseenter', dodgeHandler);
    btnNo.addEventListener('touchstart', dodgeHandler, { passive: true });
  }

  // --- EASTER EGG SYSTEM (Interactive Bunny Expressions) ---
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  function setBunnyExpression(stateName) {
    const states = ['normal', 'happy', 'hearts'];
    states.forEach(s => {
      const el = document.getElementById(`bunny-eyes-${s}`);
      if (el) {
        el.classList.toggle('active', s === stateName);
      }
    });
  }

  document.querySelectorAll('[data-easter-egg="true"]').forEach(bunnyEl => {
    bunnyEl.addEventListener('click', () => {
      easterEggTapCount++;
      const rect = bunnyEl.getBoundingClientRect();
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);

      if (easterEggTapCount === 1) {
        setBunnyExpression('happy');
      } else if (easterEggTapCount === 2) {
        setBunnyExpression('hearts');
      } else if (easterEggTapCount === 3) {
        setBunnyExpression('happy');
      } else if (easterEggTapCount >= 4) {
        setBunnyExpression('hearts');
        showToast('Ну всё, хватит меня тыкать 😂❤️');
        easterEggTapCount = 0;
        setTimeout(() => setBunnyExpression('normal'), 4000);
      }
    });
  });

});
