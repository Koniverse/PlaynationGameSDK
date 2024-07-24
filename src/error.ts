import {ErrorCode} from "./types";

export class IframeSDKError extends Error {
    public code?: ErrorCode;
    constructor(message: string, code?: ErrorCode) {
        super(message);
        this.name = 'IframeSDKError';
        this.code = code;
    }
}