import { Shot } from "./shot";
import { Ship } from "./ship";
import { Viewport } from "pixi-viewport";
import { Utils } from "./utils";
import * as PIXI from "pixi.js";
import { FX } from "revolt-fx";
import { Hit } from "./hit";

export class Game {
    private readonly _shots: Array<Shot> = [];
    private readonly _ships: Array<Ship> = [];
    private readonly _hits: Array<Hit> = [];
    private readonly _fx: FX = new FX();
    private _app: PIXI.Application;
    private _viewport: Viewport;
    private _width;
    private _height;
    private _container: PIXI.Container;
    private _debug: PIXI.Graphics;
    private fpsText = new PIXI.Text("0", { fontFamily: "Arial", fontSize: 24, fill: 0xff1010, align: "center" });

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._app = new PIXI.Application({
            backgroundColor: 0x222222,
            width: width,
            height: height,
        });

        this._viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 10000,
            worldHeight: 10000,
            // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
            interaction: this._app.renderer.plugins.interaction,
        });

        this._container = new PIXI.Container();
        this._container.width = this._width;
        this._container.height = this._height;
        this._debug = new PIXI.Graphics();
        this._app.stage.addChild(this._container);
        this._app.stage.addChild(this._viewport);
        this._app.stage.addChild(this._debug);
        this._viewport.drag().pinch().wheel().decelerate();
    }

    public async init(): Promise<void> {
        await this.loadAssets();

        document.body.appendChild(this._app.view);
        for (let i = 0; i < 100; ++i) {
            this._ships.push(
                new Ship(Utils.getRandomInt(this._viewport.worldWidth), Utils.getRandomInt(this._viewport.worldHeight))
            );
        }

        const stars = new PIXI.Container();
        const starfield = this._fx.getParticleEmitter("top-starfield");
        starfield.init(stars, true, 2);
        starfield.x = this._width;
        starfield.y = this._height;
        this._container.addChild(stars);

        this._ships.forEach((s) => {
            this._viewport.addChild(s);
        });
        this._app.ticker.add((delta) => this.gameLoop(delta));
        this._viewport.on("clicked", () => {
            for (let i = 0; i < this._ships.length; i++) {
                this._ships[i].fire();
            }
        });
        this._container.addChild(this.fpsText);
        this._viewport.fit();
    }

    private async loadAssets(): Promise<void> {
        return new Promise((res, rej) => {
            const loader = PIXI.Loader.shared;
            loader.add("fx_settings", "./assets/revolt-fx/default-bundle.json");
            loader.add("fx_spritesheet", "./assets/revolt-fx/spritesheet.json");
            loader.add("fx_spritesheet_png", "./assets/revolt-fx/revoltfx-spritesheet.png");
            loader.onComplete.once(() => {
                res();
            });

            loader.onError.once(() => {
                rej();
            });
            loader.load((loader, resources) => {
                if (resources === undefined || resources.fx_settings === undefined) {
                    throw Error("resource of fx_settings undefined");
                }
                this._fx.initBundle(resources.fx_settings.data);
            });
        });
    }

    public resizeCanvas(newWidth: number, newHeight: number): void {
        this._app.renderer.resize(newWidth, newHeight);
        this._app.stage.scale.x = newWidth / this._width;
        this._app.stage.scale.y = newHeight / this._height;
    }

    private gameLoop(delta: number) {
        let n: number = this._shots.length;
        while (n--) {
            this._shots[n].update(delta);
        }
        n = this._hits.length;
        while (n--) {
            this._hits[n].update(delta);
        }
        this._fx.update(delta);
        for (let i = 0; i < this._ships.length; i++) {
            this._ships[i].update(delta);
        }
        this.fpsText.text = "" + Math.round(this._app.ticker.FPS);
    }

    get shots(): Array<Shot> {
        return this._shots;
    }

    get ships(): Array<Ship> {
        return this._ships;
    }

    get hits(): Array<Hit> {
        return this._hits;
    }

    get fx(): FX {
        return this._fx;
    }

    get app(): PIXI.Application {
        return this._app;
    }

    get viewport(): Viewport {
        return this._viewport;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get container(): PIXI.Container {
        return this._container;
    }

    get debug(): PIXI.Graphics {
        return this._debug;
    }
}
