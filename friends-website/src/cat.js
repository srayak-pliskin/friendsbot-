import Matter from 'matter-js';
import { gsap } from 'gsap';

const { Engine, Bodies, Body, Composite, Events, Runner, Mouse, MouseConstraint } = Matter;

const CAT_W = 56;
const CAT_H = 44;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createCatController(containerEl, catEl, furnitureEls) {
  if (!containerEl || !catEl) return { destroy() { } };

  const cards = [...furnitureEls].filter(Boolean);
  let destroyed = false;
  let renderDir = 1; // 1=right, -1=left

  // --- Physics setup (full page) ---
  const engine = Engine.create();
  engine.gravity.y = 1.2;
  const world = engine.world;

  const rect = containerEl.getBoundingClientRect();

  // Cat physics body
  const catBody = Bodies.rectangle(100, rect.height - CAT_H - 100, CAT_W * 0.8, CAT_H * 0.8, {
    friction: 0.3,
    frictionAir: 0.01,
    restitution: 0.2,
    label: 'cat',
    density: 0.01,
    chamfer: { radius: 10 },
    collisionFilter: {
      category: 0x0001,
      mask: 0xFFFFFFFF,
    }
  });
  Body.setInertia(catBody, Infinity); // Keep upright

  // Page boundaries
  const floor = Bodies.rectangle(rect.width / 2, rect.height + 25, rect.width * 2, 50, {
    isStatic: true, friction: 0.8, restitution: 0.2,
  });
  const ceiling = Bodies.rectangle(rect.width / 2, -25, rect.width * 2, 50, {
    isStatic: true, restitution: 0.5,
  });
  const leftWall = Bodies.rectangle(-25, rect.height / 2, 50, rect.height * 2, {
    isStatic: true, restitution: 0.8,
  });
  const rightWall = Bodies.rectangle(rect.width + 25, rect.height / 2, 50, rect.height * 2, {
    isStatic: true, restitution: 0.8,
  });

  // --- Surface bodies (furniture cards + .cat-surface elements) ---
  let surfaceBodies = [];
  function createSurfaceBodies() {
    if (surfaceBodies.length > 0) {
      Composite.remove(world, surfaceBodies);
    }
    const cRect = containerEl.getBoundingClientRect();
    const allSurfaces = containerEl.querySelectorAll('.furniture, .cat-surface');
    surfaceBodies = [...allSurfaces].filter(Boolean).map(el => {
      const tRect = el.getBoundingClientRect();
      const w = tRect.width;
      const h = tRect.height;
      const x = (tRect.left - cRect.left) + w / 2;
      const y = (tRect.top - cRect.top) + h / 2;
      return Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        restitution: 0.3,
        friction: 0.1,
        label: 'furniture',
        cardRef: el,
        collisionFilter: {
          category: 0x0002,
        }
      });
    });
    Composite.add(world, surfaceBodies);
  }

  createSurfaceBodies();
  Composite.add(world, [catBody, floor, ceiling, leftWall, rightWall]);

  // --- Mouse constraint (drag) ---
  const mouse = Mouse.create(containerEl);
  Mouse.setScale(mouse, { x: 1, y: 1 });

  const mc = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      damping: 0.1,
      render: { visible: false }
    },
    collisionFilter: {
      mask: 0x0001 // only interact with cat
    }
  });
  Composite.add(world, mc);

  // Prevent page scroll when dragging cat on touch
  const preventScroll = (e) => {
    if (mc.body === catBody) {
      e.preventDefault();
    }
  };
  containerEl.addEventListener('touchmove', preventScroll, { passive: false });

  // --- Anim refs ---
  const legFL = catEl.querySelector('.cat-leg-fl');
  const legFR = catEl.querySelector('.cat-leg-fr');
  const legBL = catEl.querySelector('.cat-leg-bl');
  const legBR = catEl.querySelector('.cat-leg-br');
  const tail = catEl.querySelector('.cat-tail');
  const head = catEl.querySelector('.cat-head');
  const bodyGroup = catEl.querySelector('.cat-body-group');

  // --- Leg animation sequence ---
  const legTl = gsap.timeline({ repeat: -1, paused: true });
  legTl.to([legFL, legBR], { rotation: 25, duration: 0.15, ease: 'sine.inOut' }, 0);
  legTl.to([legFR, legBL], { rotation: -25, duration: 0.15, ease: 'sine.inOut' }, 0);
  legTl.to([legFL, legBR], { rotation: -25, duration: 0.15, ease: 'sine.inOut' }, 0.15);
  legTl.to([legFR, legBL], { rotation: 25, duration: 0.15, ease: 'sine.inOut' }, 0.15);

  const tailTl = gsap.timeline({ repeat: -1, yoyo: true });
  tailTl.to(tail, { rotation: -30, duration: 0.8, ease: 'sine.inOut' });
  tailTl.to(tail, { rotation: 30, duration: 0.8, ease: 'sine.inOut' });

  const bobTl = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
  bobTl.to(bodyGroup, { y: -2, duration: 0.15, ease: 'sine.inOut' });

  function startWalkAnims() {
    legTl.play();
    bobTl.play();
  }
  function stopWalkAnims() {
    legTl.pause();
    bobTl.pause();
    gsap.set([legFL, legFR, legBL, legBR], { rotation: 0 });
    gsap.set(bodyGroup, { y: 0 });
  }

  // --- FSM ---
  let state = 'idle';
  let stateTimer = 0;
  let targetX = null;
  let targetCard = null;

  function think() {
    if (destroyed) return;
    if (state === 'dragged') return; // don't override drag

    // reset collisions & z-index
    catBody.collisionFilter.mask = 0xFFFFFFFF;
    catEl.style.zIndex = '20';

    const r = Math.random();
    const pageWidth = containerEl.getBoundingClientRect().width;

    if (r < 0.25) {
      state = 'jump';
      renderDir = Math.random() > 0.5 ? 1 : -1;
      const jumpVelX = (Math.random() * 6 + 3) * renderDir; // wider jumps for full page
      const jumpVelY = -(Math.random() * 10 + 7);
      Body.setVelocity(catBody, { x: jumpVelX, y: jumpVelY });
      stateTimer = 1500 + Math.random() * 1500;
      stopWalkAnims();
    } else if (r < 0.5) {
      state = 'walk';
      renderDir = Math.random() > 0.5 ? 1 : -1;
      stateTimer = 3000 + Math.random() * 4000; // longer walks for full page
      startWalkAnims();
    } else if (r < 0.7 && cards.length > 0) {
      // Setup Bite
      state = 'bite_move';
      targetCard = pickRandom(cards);
      const cRect = containerEl.getBoundingClientRect();
      const tRect = targetCard.getBoundingClientRect();
      targetX = (tRect.left - cRect.left) + tRect.width / 2;
      startWalkAnims();
      stateTimer = 7000; // more time to reach across page
    } else if (r < 0.9 && cards.length > 0) {
      // Setup Hide
      state = 'hide_move';
      targetCard = pickRandom(cards);
      const cRect = containerEl.getBoundingClientRect();
      const tRect = targetCard.getBoundingClientRect();
      targetX = (tRect.left - cRect.left) + tRect.width / 2;
      startWalkAnims();
      stateTimer = 7000;
    } else {
      state = 'idle';
      stateTimer = 1000 + Math.random() * 3000;
      stopWalkAnims();
    }
  }

  // --- Drag events ---
  Events.on(mc, 'startdrag', (event) => {
    if (destroyed) return;
    if (event.body === catBody) {
      state = 'dragged';
      stopWalkAnims();
      catEl.classList.add('dragging');
    }
  });

  Events.on(mc, 'enddrag', (event) => {
    if (destroyed) return;
    if (event.body === catBody) {
      catEl.classList.remove('dragging');
      state = 'idle';
      stateTimer = 500; // brief pause then think
    }
  });

  // --- Collision events ---
  Events.on(engine, 'collisionStart', (event) => {
    if (destroyed) return;

    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      if (bodyA !== catBody && bodyB !== catBody) return;

      const other = bodyA === catBody ? bodyB : bodyA;

      if (other === leftWall || other === rightWall || other === ceiling) {
        renderDir *= -1;
        if (state === 'walk') {
          Body.setVelocity(catBody, { x: 0, y: catBody.velocity.y });
        }
      }

      if (other.label === 'furniture') {
        // Visual wobble when landed on heavily
        if (Math.abs(catBody.velocity.y) > 3 && other.cardRef) {
          gsap.fromTo(other.cardRef,
            { rotation: (catBody.velocity.x > 0 ? 5 : -5) },
            { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
          );
        }
      }
    });
  });

  // --- Before update (FSM logic) ---
  Events.on(engine, 'beforeUpdate', () => {
    if (destroyed) return;

    // No AI forces while dragged
    if (state === 'dragged') return;

    stateTimer -= 1000 / 60;

    // Time's up, pick new action (unless mid-sequence)
    if (stateTimer <= 0 && !state.endsWith('_action')) {
      think();
      return;
    }

    // Walking
    if (state === 'walk') {
      if (Math.abs(catBody.velocity.x) < 3.5) {
        Body.applyForce(catBody, catBody.position, { x: 0.02 * renderDir, y: 0 });
      }
    }

    // Moving to target for bite/hide
    if (state === 'bite_move' || state === 'hide_move') {
      const dist = targetX - catBody.position.x;
      if (Math.abs(dist) < 20) {
        // Arrived!
        Body.setVelocity(catBody, { x: 0, y: catBody.velocity.y });
        stopWalkAnims();
        if (state === 'bite_move') doBiteAction();
        if (state === 'hide_move') doHideAction();
      } else {
        renderDir = dist > 0 ? 1 : -1;
        if (Math.abs(catBody.velocity.x) < 4) {
          Body.applyForce(catBody, catBody.position, { x: 0.015 * renderDir, y: 0 });
        }
      }
    }
  });

  function doBiteAction() {
    state = 'bite_action';
    stateTimer = 9999;
    // small jump
    Body.setVelocity(catBody, { x: 0, y: -5 });
    // wiggle head & card
    gsap.to(head, {
      rotation: renderDir * 15,
      y: -3,
      repeat: 5,
      yoyo: true,
      duration: 0.1,
      onComplete: () => gsap.set(head, { rotation: 0, y: 0 })
    });
    gsap.to(targetCard, {
      rotation: 8,
      repeat: 5,
      yoyo: true,
      duration: 0.1,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set(targetCard, { rotation: 0 });
        think();
      }
    });
  }

  function doHideAction() {
    state = 'hide_action';
    stateTimer = 9999;

    // disable collisions with furniture so it can walk behind
    catBody.collisionFilter.mask = 0xFFFFFFFF ^ 0x0002;
    catEl.style.zIndex = '1'; // behind cards

    gsap.delayedCall(1.0, () => {
      if (destroyed) return;
      // peek
      const peekDir = Math.random() > 0.5 ? 1 : -1;
      renderDir = peekDir;
      Body.setVelocity(catBody, { x: 5 * peekDir, y: 0 });

      gsap.delayedCall(1.0, () => {
        if (destroyed) return;
        // hide again
        Body.setVelocity(catBody, { x: -5 * peekDir, y: 0 });
        gsap.delayedCall(1.0, () => {
          if (destroyed) return;
          think(); // will restore z-index and collision
        });
      });
    });
  }

  // --- Runner ---
  const runner = Runner.create();
  Runner.run(runner, engine);

  // --- After update (rendering) ---
  Events.on(engine, 'afterUpdate', () => {
    if (destroyed) return;

    // Look direction override if moving fast (not during targeted actions or drag)
    if (state !== 'bite_move' && state !== 'hide_move' && state !== 'bite_action' && state !== 'hide_action' && state !== 'dragged') {
      if (Math.abs(catBody.velocity.x) > 1) {
        renderDir = catBody.velocity.x > 0 ? 1 : -1;
      }
    }

    const x = catBody.position.x - CAT_W / 2;
    const y = catBody.position.y - CAT_H / 2;

    // Prevent NaN
    if (isNaN(x) || isNaN(y)) return;

    // Dynamic tilt & squash for realistic "weight" feel
    let tilt = catBody.velocity.x * 1.5;
    let scaleX = renderDir;
    let scaleY = 1.0;

    if ((state === 'jump' || state === 'dragged') && Math.abs(catBody.velocity.y) > 2) {
      scaleY = 1.1;
      scaleX = renderDir * 0.95;
      tilt = catBody.velocity.x * 2.5;
    }

    catEl.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${scaleX}, ${scaleY})`;
  });

  think();

  // --- Resize handler ---
  function handleResize() {
    if (destroyed) return;
    const r = containerEl.getBoundingClientRect();

    // setVertices resets the body position to the vertices centroid,
    // so setPosition must be called AFTER setVertices.
    Body.setVertices(floor, Bodies.rectangle(r.width / 2, r.height + 25, r.width * 2, 50).vertices);
    Body.setPosition(floor, { x: r.width / 2, y: r.height + 25 });

    Body.setVertices(ceiling, Bodies.rectangle(r.width / 2, -25, r.width * 2, 50).vertices);
    Body.setPosition(ceiling, { x: r.width / 2, y: -25 });

    Body.setVertices(leftWall, Bodies.rectangle(-25, r.height / 2, 50, r.height * 2).vertices);
    Body.setPosition(leftWall, { x: -25, y: r.height / 2 });

    Body.setVertices(rightWall, Bodies.rectangle(r.width + 25, r.height / 2, 50, r.height * 2).vertices);
    Body.setPosition(rightWall, { x: r.width + 25, y: r.height / 2 });

    createSurfaceBodies();
  }
  window.addEventListener('resize', handleResize);

  return {
    destroy() {
      destroyed = true;
      gsap.killTweensOf(catEl);
      gsap.killTweensOf(head);
      legTl.kill();
      tailTl.kill();
      bobTl.kill();
      cards.forEach(c => gsap.killTweensOf(c));
      Runner.stop(runner);
      Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
      containerEl.removeEventListener('touchmove', preventScroll);
      // Clean up mouse constraint events
      Composite.remove(world, mc);
    },
  };
}
