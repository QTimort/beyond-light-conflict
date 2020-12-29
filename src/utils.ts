export class Utils {
    public static getRandomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    public static getRandomInt2(min: number, max: number): number {
        return Math.floor(Math.random() * Math.floor(max)) + min;
    }

    public static normalize(val: number, min: number, max: number): number {
        return (val - min) / (max - min);
    }

    public static sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
