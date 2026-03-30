import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

/** AKSHAY's edit: Adding in decomp for physics stuff */
import decomp from 'poly-decomp';
window.decomp = decomp;

/** Portrait 9:16 — same aspect as Variant games (e.g. 720×1280). */
const VIEW_W = 720;
const VIEW_H = 720;   //edited this value because wheneve I pressed Space as input the window scrolled. Easier solution for me was to make it into a smaller window.

/** Shared Variant man rig — see public/spine/man/animations.json & ANIMATIONS.md */
const DEMO_IDLE = 'Idle';
const DEMO_PUSH = 'duo_left_Push';

class HelloScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HelloScene' });
    this.hero = null;
    this.walkSpeed = 50;
    this.direction = 1;
  }

  preload() {
    this.load.spineJson('man', '/spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', '/spine/man/skeleton.atlas', true);
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, 20, 'Hello world — shared man Spine walks (public/spine/man/)', {
        fontSize: '14px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 44, 'Gray silhouette = CDN placeholder base sheet; npm run copy-spine for real skin', {
        fontSize: '11px',
        color: '#8a9',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);
    

    /** AKSHAY's edit: Using graphics to create a slope  */
    const graphics = this.add.graphics();
    graphics.fillStyle(0x888888);
    graphics.fillTriangle(0, 600, 1600, 600, 1600, 100);

    const slopeAngle = Math.atan2(100 - 600, 1600 - 0); // negative = rising left to right

    const slope = this.matter.add.rectangle(
      800, 350,   // approximate center of the hypotenuse
      1650,       // length (slightly longer than width to cover full surface)
      20,         // thin thickness
      {
        isStatic: true,
        angle: slopeAngle,
        friction: 0.5,
        label: 'slope',
      }
    );

    /** AKSHAY's Edi: This array is for creating the bumps which occure on the slope. within each iteration
     * the bump is created, a collider is added to it, it is placed on the slope and its positions are randomised
     * every time the project is compiled and run. So one run is different from another.
     */
    this.bumps = [];
    const bumpCount = 7;
    const minDist = 100;
    const placedX = [];

    for (let i = 0; i < bumpCount; i++) {
      let bx;
      let attempts = 0;
      do {
        bx = 200 + Math.random() * 1200;
        attempts++;
      } while (placedX.some(x => Math.abs(x - bx) < minDist) && attempts < 50);

      placedX.push(bx);
      const by = 600 + ((100 - 600) / 1600) * bx - 12;

      const bumpGraphic = this.add.graphics();
      bumpGraphic.fillStyle(0x666666);
      bumpGraphic.fillCircle(0, 0, 15);
      bumpGraphic.x = bx;
      bumpGraphic.y = by;

      this.matter.add.circle(bx, by, 15, {
        isStatic: true,
        friction: 0.3,
        restitution: 2.0,
        label: 'bump'
      });
    }

    /**
     * Collision check for the bumps. When the boulder collides with the bump there's an addition force applied in the opposite direction 
     * and opposite to gravity to make the boulder bounce more
     */
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === 'boulder' && pair.bodyB.label === 'bump') ||
          (pair.bodyA.label === 'bump' && pair.bodyB.label === 'boulder')
        ) {
          this.matter.body.applyForce(this.boulder, this.boulder.position, {
            x: -0.1,
            y: -5.0  // tune this value
          });
        }
      });
    });

    this.hero = this.add.spine(width * 0.3, height * 0.5, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.1);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, DEMO_IDLE, true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    this.heroX = 50;  //hero character's position being set at the start of the slide
    this.heroBody = this.matter.add.rectangle(
    this.heroX,
      600 + ((100 - 600) / 1600) * this.heroX - 50,
      15, 100,
        {
          isStatic: true,  // static — move it manually, slope can't push it. Probably not the best way to handle physics in an engine
          label: 'hero',
          friction: 1,
          restitution: 0
        }
    );

    /** AKSHAY's EDIT: Added in camera follow */
    this.cameras.main.setBounds(0, -2000, 1600, 2720);
    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1);

    /** graphics for the boulder and the collider */
    this.boulderGraphic = this.add.graphics();
    this.boulderGraphic.fillStyle(0x888888);
    this.boulderGraphic.fillCircle(0, 0, 50); // 0,0 because position is synced in update

    this.boulder = this.matter.add.circle(
      this.heroBody.position.x + 50, // spawn just to the right of sisyphus
      this.heroBody.position.y - 40, // same height as hero center
      50, // radius — adjust to visual size you want
      {
        friction: 0.8,
        frictionAir: 0.01,
        restitution: 0.9, // slight bounce
        mass: 3,
        label: 'boulder',
      }
    );
    
    /** checking if it is GameOver */
    this.isGameOver = false;

    /** AKSHAY's edit: Checking for Animation end to make sure input is ignored till the animation is complete */
    this.isAnimating = false;

    this.hero.animationState.addListener({
      complete: (entry) => {
        if(entry.animation.name === DEMO_PUSH) {
          this.isAnimating = false;
        }
      }
    });

    /** AKSHAY's edit: Function for reading movement input */
    const onPush = () => {
      if(this.isAnimating) return;
      // Make sure that force is not applied when the boulder is pushed.
      if(!this.isTouchingBoulder) return;

      this.isAnimating = true;
      this.hero.animationState.setAnimation(0, DEMO_PUSH, false);
      this.hero.animationState.addAnimation(0, DEMO_IDLE, true, 0);

      // Push boulder in the slope direction
      this.matter.body.applyForce(this.boulder, this.boulder.position, {
        x: 0.15,     // push right/up the slope
        y: -0.04   // slight upward force
      });
    };

    /** AKSHAY's edit: Checking for inputs and release */
    // this.input.keyboard?.on('keydown-SPACE', onPush);

    this.moveX = 0;
    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.moveX = 1;
      onPush();
    });
    this.input.keyboard?.on('keydown-D',     () => {
      this.moveX = 1;
      onPush();
    });

    this.input.keyboard?.on('keyup-RIGHT', () => this.moveX = 0);
    this.input.keyboard?.on('keyup-D',     () => this.moveX = 0);

    this.add
      .text(width / 2, height - 36, 'Animations: public/spine/man/animations.json & ANIMATIONS.md', {
        fontSize: '16px',
        color: '#889'
      })
      .setOrigin(0.5, 1);

    /** AKSHAY's edit: Collision Check for Boulder and Player to make sure that boulder is pushed only when player is in touch with it */
    this.isTouchingBoulder = false;

    /**
     * Collision detection between the boulder and the player because I didn't want a force to be applied 
     * whenever I presed the right key. I only wanted one to be applied when hero touches the boulder
     */
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === 'hero' && pair.bodyB.label === 'boulder') ||
          (pair.bodyA.label === 'boulder' && pair.bodyB.label === 'hero')
        ) {
        this.isTouchingBoulder = true;
        }
      });
    });

    this.matter.world.on('collisionend', (event) => {
      event.pairs.forEach((pair) => {
        if (
          (pair.bodyA.label === 'hero' && pair.bodyB.label === 'boulder') ||
          (pair.bodyA.label === 'boulder' && pair.bodyB.label === 'hero')
        ) {
        this.isTouchingBoulder = false;
        }
      });
    });
  }

  /** UPDATE FUNCTION  */
  update(_, deltaMs) {
    if (!this.hero) return;
    const dt = deltaMs / 1000;
    const w = this.scale.width;
    const speed = 50;

    // move X manually
    this.heroX += this.moveX * speed * dt;
    const targetY = 600 + ((100 - 600) / 1600) * this.heroX - 50;

    // move physics body
    this.matter.body.setPosition(this.heroBody, { x: this.heroX, y: targetY })

    // sync visuals
    this.hero.x = this.heroX;
    this.hero.y = targetY + 50;

    this.boulderGraphic.x = this.boulder.position.x
    this.boulderGraphic.y = this.boulder.position.y

    if (this.boulder.position.x < this.heroX - 400) {
      this.matter.world.pause();

      if(this.isGameOver) return;
      this.add.text(
        this.cameras.main.scrollX + VIEW_W / 2,
        VIEW_H / 2,
        'GAME OVER',
        { fontSize: '48px', color: '#ff4444', fontFamily: 'system-ui' }
      ).setOrigin(0.5);

      this.isGameOver = true;
    }
  }
}

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#2d2d44',
  scene: [HelloScene],
  plugins: {
    scene: [{ key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: true
    }
  }
};

new Phaser.Game(config);
