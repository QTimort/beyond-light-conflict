import * as PIXI from "pixi.js";
global.PIXI = PIXI;
import { FX } from "revolt-fx";

import "./style.css";

const gameWidth = 800;
const gameHeight = 600;

const app = new PIXI.Application({
    backgroundColor: 0xd3d3d3,
    width: gameWidth,
    height: gameHeight,
});

const fx = new FX();

const container = new PIXI.Container();
const debug = new PIXI.Graphics();
app.stage.addChild(container);
app.stage.addChild(debug);

window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);

    resizeCanvas();

    const content = new PIXI.Container();
    content.x = gameWidth * 0.5;
    content.y = gameWidth * 0.5;
    app.stage.addChild(content);

    const emitter = fx.getParticleEmitter("plasma-corona");
    emitter.init(content, true, 1.9);

    app.ticker.add(function (delta) {
        //Update the RevoltFX instance
        fx.update(delta);
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
