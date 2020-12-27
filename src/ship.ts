import { ParticleEmitter } from "revolt-fx/src/ParticleEmitter";
import { Utils } from "./utils";
import { Sprite } from "pixi.js";
import { game } from "./index";
import { Shot } from "./shot";

export class Ship {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.emitter = game.fx.getParticleEmitter("plasma-shield");
        this.emitter.init(this.container, true, 1);
        const bg: Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        bg.width = 10;
        bg.height = 10;
        bg.tint = 0xff0000;
        this.container.addChild(bg);
    }

    public fire(): void {
        const target = game.ships[Utils.getRandomInt(game.ships.length)];
        const shot = new Shot(this.x, this.y, target.x, target.y, 150);
        game.viewport.addChild(shot);

        const light = game.fx.getEffectSequence("white-light");
        light.init(game.viewport, 0, true, 0.2);
        light.x = shot.x;
        light.y = shot.y;
    }

    public dispose(): void {
        this.emitter.dispose();
        this.container.destroy();
    }
}
