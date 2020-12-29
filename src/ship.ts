import { Utils } from "./utils";
import { AnimatedSprite, Sprite, Texture } from "pixi.js";
import { game } from "./index";
import { Shot } from "./shot";
import { SpriteAnimationGenerator } from "./sprite-animation-generator";

export class Ship extends Sprite {
    private static shielda: AnimatedSprite = null;
    private static renderer = null;
    private radius: number;
    private readonly nbSamples = 50;
    private readonly sampleWidth = 600;
    private readonly sampleHeight = 600;
    private shieldStep = Utils.getRandomInt(this.nbSamples);
    private timeElapsed = 0;
    private backwardAnim = false;

    constructor(x: number, y: number) {
        super();
        if (Ship.renderer == null) {
            Ship.renderer = game.app.renderer;
            const s = new Sprite();
            const shieldEmitter = game.fx.getParticleEmitter("plasma-shield");
            shieldEmitter.init(s, true, 1);
            (async () => {
                s.anchor.set(0.5, 0.5);
                s.position.x = this.sampleWidth / 2;
                s.position.y = this.sampleHeight / 2;
                await Utils.sleep(500);

                Ship.shielda = await SpriteAnimationGenerator.spriteAnimationGenerator(
                    s,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    shieldEmitter,
                    500,
                    this.nbSamples,
                    this.sampleWidth,
                    this.sampleHeight
                );
            })();
        }
        this.x = x;
        this.y = y;
        this.radius = Utils.getRandomInt2(10, 100);
        // min is 0 so we can see the smallest shield
        this.scale.set(Utils.normalize(this.radius, 0, 100));
        this.anchor.set(0.5, 0.5);
        this.texture = Texture.WHITE;
    }

    public fire(): void {
        const target = game.ships[Utils.getRandomInt(game.ships.length)];
        const shot = new Shot(this.x, this.y, target.x, target.y, target.radius, target.scale.x);
        game.viewport.addChild(shot);
    }

    public dispose(): void {
        this.destroy();
    }

    update(delta: number): void {
        this.timeElapsed += delta;
        if (this.timeElapsed > 5) {
            if (Ship.shielda != null) {
                this.texture = Ship.shielda.textures[this.shieldStep];
                if (this.backwardAnim) {
                    --this.shieldStep;
                } else {
                    ++this.shieldStep;
                }
                if (!this.backwardAnim && Ship.shielda.textures.length >= this.shieldStep) {
                    this.backwardAnim = true;
                    this.shieldStep = Ship.shielda.textures.length - 1;
                } else if (this.backwardAnim && this.shieldStep < 0) {
                    this.backwardAnim = false;
                    this.shieldStep = 0;
                }
            }
            this.timeElapsed = 0;
        }
    }
}
