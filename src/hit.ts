import { Sprite } from "pixi.js";
import { game } from "./index";

export class Hit extends Sprite {
    static hit: Sprite = null;
    private timeToLive: number;
    constructor(targetX: number, targetY: number, rotation: number, targetScaleX: number) {
        super();
        if (Hit.hit == null) {
            Hit.hit = new Sprite();
            Hit.hit.texture = PIXI.Texture.from("fx-light08");
        }
        game.hits.push(this);

        this.anchor.set(0.5, 0.5);
        this.rotation = rotation;

        this.x = targetX;
        this.y = targetY;
        this.scale.set(targetScaleX);

        this.blendMode = PIXI.BLEND_MODES.ADD;

        this.tint = 0xffcb67;
        this.timeToLive = 50;
        this.texture = Hit.hit.texture;
    }

    public update(dt: number): void {
        this.timeToLive -= dt;
        if (this.timeToLive <= 0) {
            this.dispose();
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
