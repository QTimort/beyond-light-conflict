import { AnimatedSprite, Container, RenderTexture, Texture } from "pixi.js";
import { ParticleEmitter } from "revolt-fx/src/ParticleEmitter";
import { game } from "./index";
import { Utils } from "./utils";

export class SpriteAnimationGenerator {
    public static async spriteAnimationGenerator(
        container: Container,
        emitter: ParticleEmitter,
        period: number,
        samples: number,
        width: number,
        height: number
    ): Promise<PIXI.AnimatedSprite> {
        const rate: number = period / samples;
        const textures: Array<Texture> = [];
        let i = 0;
        while (i < period) {
            await Utils.sleep(rate);
            const renderTexture: RenderTexture = RenderTexture.create({ width: width, height: height });
            game.app.renderer.render(container, renderTexture);
            textures.push(renderTexture);
            i += rate;
        }
        return new AnimatedSprite(textures);
    }
}
