import {ErrorCode} from "../types";

export class PlaynationSDKError extends Error {
    public code?: ErrorCode;
    constructor(message: string, code?: ErrorCode) {
        super(message);
        this.name = 'PlaynationSDKError';
        this.code = code;
    }
}
