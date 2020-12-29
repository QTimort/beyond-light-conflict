import { AnimatedSprite, Sprite } from "pixi.js";
import { game } from "./index";
import { SpriteAnimationGenerator } from "./sprite-animation-generator";

export class Hit extends Sprite {
    static initialized = false;
    static hita: AnimatedSprite = null;
    private readonly sampleWidth = 600;
    private readonly sampleHeight = 600;
    private hitStep = 0;
    private timeElapsed = 0;

    constructor(targetX: number, targetY: number, rotation: number, targetScaleX: number) {
        super();
        if (!Hit.initialized) {
            Hit.initialized = true;
            const s = new Sprite();
            const shieldHitEmitter = game.fx.getParticleEmitter("plasma-shield-hit");
            shieldHitEmitter.init(s, true, 1);
            (async () => {
                s.anchor.set(0.5, 0.5);
                s.position.x = this.sampleWidth / 2;
                s.position.y = this.sampleHeight / 2;
                Hit.hita = await SpriteAnimationGenerator.spriteAnimationGenerator(
                    s,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    shieldHitEmitter,
                    400,
                    50,
                    this.sampleWidth,
                    this.sampleHeight
                );
            })();
        }
        game.hits.push(this);

        this.anchor.set(0.5, 0.5);
        this.rotation = rotation - Math.PI;

        this.x = targetX;
        this.y = targetY;
        this.scale.set(targetScaleX);

        this.blendMode = PIXI.BLEND_MODES.NORMAL;
        this.alpha = 0.8;
    }

    public update(delta: number): void {
        this.timeElapsed += delta;
        if (this.timeElapsed > 2) {
            if (Hit.hita != null) {
                this.texture = Hit.hita.textures[this.hitStep];
                ++this.hitStep;
                if (Hit.hita.textures.length == this.hitStep) {
                    this.dispose();
                }
            }
            this.timeElapsed = 0;
        }
    }

    public dispose(): void {
        this.parent.removeChild(this);
        const index = game.hits.indexOf(this);
        if (index > -1) {
            game.hits.splice(index, 1);
        }
    }
}
