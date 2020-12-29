import { AnimatedSprite, Sprite } from "pixi.js";
import { game } from "./index";
import { SpriteAnimationGenerator } from "./sprite-animation-generator";
import { Hit } from "./hit";
import { Utils } from "./utils";

export class Shot extends Sprite {
    static initialized = false;
    static shota: AnimatedSprite = null;
    private readonly sampleWidth = 600;
    private readonly sampleHeight = 600;
    private readonly nbSamples = 50;
    private speed: number;
    private dx: number;
    private dy: number;
    private targetX: number;
    private targetY: number;
    private targetRadius: number;
    private targetScaleX: number;
    private shotStep = Utils.getRandomInt(this.nbSamples);
    private timeElapsed = 0;
    private backwardAnim = false;

    constructor(
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        targetRadius: number,
        targetScaleX: number
    ) {
        super();
        if (!Shot.initialized) {
            Shot.initialized = true;
            const s = new Sprite();
            const shotEmitter = game.fx.getParticleEmitter("plasma-shot");
            shotEmitter.init(s, true, 1);
            (async () => {
                s.anchor.set(0.5, 0.5);
                s.position.x = this.sampleWidth / 2;
                s.position.y = this.sampleHeight / 2;
                await Utils.sleep(500);
                Shot.shota = await SpriteAnimationGenerator.spriteAnimationGenerator(
                    s,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    shotEmitter,
                    2000,
                    this.nbSamples,
                    this.sampleWidth,
                    this.sampleHeight
                );
            })();
        }
        game.shots.push(this);

        this.anchor.set(0.5, 0.5);
        const dxl = targetX - sourceX;
        const dyl = targetY - sourceY;
        this.rotation = Math.atan2(dyl, dxl);
        this.dx = Math.cos(this.rotation);
        this.dy = Math.sin(this.rotation);
        this.targetRadius = targetRadius;
        this.targetScaleX = targetScaleX;
        this.x = sourceX;
        this.y = sourceY;

        this.targetX = targetX;
        this.targetY = targetY;

        this.blendMode = PIXI.BLEND_MODES.ADD;

        this.scale.set(1, 0.4);

        this.speed = Utils.getRandomInt2(5, 100);
        this.alpha = 0.7;
    }

    public update(dt: number): void {
        this.timeElapsed += dt;
        if (this.timeElapsed > 5) {
            if (Shot.shota != null) {
                this.texture = Shot.shota.textures[this.shotStep];
                if (this.backwardAnim) {
                    --this.shotStep;
                } else {
                    ++this.shotStep;
                }
                if (!this.backwardAnim && Shot.shota.textures.length >= this.shotStep) {
                    this.backwardAnim = true;
                    this.shotStep = Shot.shota.textures.length - 1;
                } else if (this.backwardAnim && this.shotStep < 0) {
                    this.backwardAnim = false;
                    this.shotStep = 0;
                }
            }
            this.timeElapsed = 0;
        }
        const pdx = this.targetX - this.x;
        const pdy = this.targetY - this.y;
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const r = this.targetRadius * this.targetRadius;
        const oldDistanceSquared = pdx * pdx + pdy * pdy;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared <= r || oldDistanceSquared < distanceSquared) {
            const hit = new Hit(this.targetX, this.targetY, this.rotation, this.targetScaleX);
            game.viewport.addChild(hit);
            this.dispose();
        }
    }
    public dispose(): void {
        this.parent.removeChild(this);
        const index = game.shots.indexOf(this);
        if (index > -1) {
            game.shots.splice(index, 1);
        }
    }
}
