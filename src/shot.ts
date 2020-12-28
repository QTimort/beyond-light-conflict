import { Sprite, Texture } from "pixi.js";
import { game } from "./index";
import { Hit } from "./hit";

export class Shot extends Sprite {
    static shot: Texture = null;
    private speed: number;
    private dx: number;
    private dy: number;
    private targetX: number;
    private targetY: number;
    private targetRadius: number;
    private targetScaleX: number;
    constructor(
        sourceX: number,
        sourceY: number,
        targetX: number,
        targetY: number,
        targetRadius: number,
        targetScaleX: number
    ) {
        super();
        if (Shot.shot == null) {
            Shot.shot = PIXI.Texture.from("fx-light10");
        }
        PIXI.Sprite.call(this, Shot.shot);
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

        this.speed = 10;
        this.tint = 0xd702d8;
    }

    public update(dt: number): void {
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
