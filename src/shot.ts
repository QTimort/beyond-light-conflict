import { Sprite } from "pixi.js";
import { game } from "./index";

export class Shot extends Sprite {
    private speed: number;
    private dx: number;
    private dy: number;
    private targetX: number;
    private targetY: number;
    private targetRadius: number;
    constructor(sourceX: number, sourceY: number, targetX: number, targetY: number, targetRadius: number) {
        super();
        PIXI.Sprite.call(this, PIXI.Texture.from("fx-light10"));
        game.shots.push(this);

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
        this.tint = 0xd702d8;
    }

    public update(dt: number): void {
        this.x += this.dx * this.speed * dt;
        this.y += this.dy * this.speed * dt;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const r = this.targetRadius * this.targetRadius;

        if (dx * dx + dy * dy <= r) {
            const effect = game.fx.getEffectSequence("plasma-shield-hit");
            effect.init(game.viewport);
            effect.x = this.targetX;
            effect.y = this.targetY;
            effect.rotation = this.rotation - Math.PI;
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
