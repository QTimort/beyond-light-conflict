import * as PIXI from "pixi.js";

global.PIXI = PIXI;
import { Viewport } from "pixi-viewport";
import { FX } from "revolt-fx";

import "./style.css";
import { ParticleEmitter } from "revolt-fx/src/ParticleEmitter";
import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
const gameWidth = 1280;
const gameHeight = 720;

gsap.registerPlugin(PixiPlugin);

const app = new PIXI.Application({
    backgroundColor: 0x222222,
    width: gameWidth,
    height: gameHeight,
});

// create viewport
const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000,
    interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});

const container = new PIXI.Container();
const debug = new PIXI.Graphics();
app.stage.addChild(viewport);
app.stage.addChild(container);
app.stage.addChild(debug);

viewport.drag().pinch().wheel().decelerate();

const fx = new FX();

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

class Ship {
    public x: number;
    public y: number;
    public container: PIXI.Container;
    public emitter: ParticleEmitter;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.scale.set(1);
        //this.container.filters = [new BlurFilter()];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.emitter = fx.getParticleEmitter("plasma-shield");
        this.emitter.init(this.container, true, 1);
        const bg: Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = 10;
        bg.height = 10;
        bg.tint = 0xff0000;
        this.container.addChild(bg);
    }

    public fire(): void {
        const target = ships[getRandomInt(ships.length)];
        const shot = new Shot(this.x, this.y, target.x, target.y, 150);
        viewport.addChild(shot);

        const light = fx.getEffectSequence("white-light");
        light.init(viewport, 0, true, 0.2);
        light.x = shot.x;
        light.y = shot.y;
    }

    public dispose(): void {
        this.emitter.dispose();
        this.container.destroy();
    }
}

const shots: Array<Shot> = [];

class Shot extends Sprite {
    private speed: number;
    private dx: number;
    private dy: number;
    private targetX: number;
    private targetY: number;
    private targetRadius: number;
    constructor(sourceX: number, sourceY: number, targetX: number, targetY: number, targetRadius: number) {
        super();
        PIXI.Sprite.call(this, PIXI.Texture.from("fx-light10"));
        shots.push(this);

        this.anchor.set(0.5, 0.5);
        const dxl = targetX - sourceX;
        const dyl = targetY - sourceY;
        this.rotation = Math.atan2(dyl, dxl);
        this.dx = Math.cos(this.rotation);
        this.dy = Math.sin(this.rotation);
        this.targetRadius = targetRadius;
        this.x = sourceX;
        this.y = sourceY;

        this.targetX = targetX;
        this.targetY = targetY;

        this.blendMode = PIXI.BLEND_MODES.ADD;

        this.speed = 10;
        //this.scale.set(0, 0.8);
        //gsap.to(this, 0.1, { pixi: { scaleX: -1 } });

        this.tint = 0xd702d8;
    }

    public update(dt: number): void {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const r = this.targetRadius * this.targetRadius;

        if (dx * dx + dy * dy <= r) {
            const effect = fx.getEffectSequence("plasma-shield-hit");
            effect.init(viewport);
            effect.x = this.targetX;
            effect.y = this.targetY;
            effect.rotation = this.rotation - Math.PI;
            this.dispose();
        }
    }
    public dispose(): void {
        this.parent.removeChild(this);
        const index = shots.indexOf(this);
        if (index > -1) {
            shots.splice(index, 1);
        }
    }
}

const ships: Array<Ship> = [];

window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);
    for (let i = 0; i < 10; ++i) {
        ships.push(new Ship(getRandomInt(viewport.worldWidth), getRandomInt(viewport.worldHeight)));
    }

    resizeCanvas();
    ships.forEach((s) => {
        viewport.addChild(s.container);
    });
    app.ticker.add(function (delta) {
        let n: number = shots.length;
        while (n--) {
            shots[n].update(delta);
        }
        //Update the RevoltFX instance
        fx.update(delta);
    });
    viewport.on("clicked", (e) => {
        ships[0].fire();
    });
};

async function loadGameAssets(): Promise<void> {
    return new Promise((res, rej) => {
        const loader = PIXI.Loader.shared;
        loader.add("fx_settings", "./assets/revolt-fx/default-bundle.json");
        loader.add("fx_spritesheet", "./assets/revolt-fx/spritesheet.json");
        loader.add("fx_spritesheet_png", "./assets/revolt-fx/spritesheet.png");
        loader.onComplete.once(() => {
            res();
        });

        loader.onError.once(() => {
            rej();
        });
        loader.load((loader, resources) => {
            //Init the bundle
            if (resources === undefined || resources.fx_settings === undefined) {
                throw Error("resource of fx_settings undefined");
            }
            fx.initBundle(resources.fx_settings.data);
        });
    });
}

function resizeCanvas(): void {
    const resize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.stage.scale.x = window.innerWidth / gameWidth;
        app.stage.scale.y = window.innerHeight / gameHeight;
    };

    resize();

    window.addEventListener("resize", resize);
}
