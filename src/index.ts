import * as PIXI from "pixi.js";
import "./style.css";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Game } from "./game";

global.PIXI = PIXI;
gsap.registerPlugin(PixiPlugin);
export const game: Game = new Game(1280, 720);

window.onload = async (): Promise<void> => {
    resizeCanvas();
    await game.init();
};

function resizeCanvas(): void {
    const resize = () => {
        game.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);
}
