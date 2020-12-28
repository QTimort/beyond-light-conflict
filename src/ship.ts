import { ParticleEmitter } from "revolt-fx/src/ParticleEmitter";
import { Utils } from "./utils";
import { RenderTexture, Sprite } from "pixi.js";
import { game } from "./index";
import { Shot } from "./shot";

export class Ship extends Sprite {
    static shield: Sprite = new Sprite();
    static shieldEmitter: ParticleEmitter = null;
    static center: Sprite;
    static renderTexture: RenderTexture;
    static renderer;
    public sprite: Sprite = new Sprite();
    public x: number;
    public y: number;
    public radius: number;

    constructor(x: number, y: number) {
        super();
        if (Ship.shieldEmitter == null) {
            Ship.renderer = game.app.renderer;
            Ship.renderTexture = RenderTexture.create({ width: 300, height: 300 });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            Ship.shieldEmitter = game.fx.getParticleEmitter("plasma-shield");
            Ship.shieldEmitter.init(Ship.shield, true, 1);
            Ship.center = new PIXI.Sprite(PIXI.Texture.WHITE);
            Ship.center.anchor.set(0.5, 0.5);
            Ship.center.position.x = Ship.renderTexture.width / 2;
            Ship.center.position.y = Ship.renderTexture.height / 2;
            Ship.center.width = 5;
            Ship.center.height = 5;
            Ship.center.tint = 0xff0000;
            Ship.shield.anchor.set(0.5, 0.5);
            Ship.shield.position.x = Ship.renderTexture.width / 2;
            Ship.shield.position.y = Ship.renderTexture.height / 2;
        }
        this.x = x;
        this.y = y;
        this.radius = Utils.getRandomInt2(10, 100);
        // min is 0 so we can see the smallest shield
        this.scale.set(Utils.normalize(this.radius, 0, 100));
        this.anchor.set(0.5, 0.5);
        this.texture = Ship.renderTexture;
    }

    public fire(): void {
        const target = game.ships[Utils.getRandomInt(game.ships.length)];
        const shot = new Shot(this.x, this.y, target.x, target.y, target.radius, target.scale.x);
        game.viewport.addChild(shot);

        //const light = game.fx.getEffectSequence("white-light");
        //light.init(game.viewport, 0, true, 0.2);
        //light.x = shot.x;
        //light.y = shot.y;
    }

    public dispose(): void {
        this.destroy();
    }

    static update(): void {
        Ship.renderer.render(Ship.shield, Ship.renderTexture, true);
        Ship.renderer.render(Ship.center, Ship.renderTexture, false);
    }
}
