import {GameSDK} from "./types";

declare global {
    interface Window { PlaynationGameSDK: GameSDK; }
}

declare const PlaynationGameSDK: GameSDK;