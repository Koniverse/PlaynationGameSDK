import {
  BuyInGameItemResponse,
  GameSDK,
  GetLeaderboardResponse, HapticFeedbackType, IframeWindow, InGameItem,
  Player,
  PlayResponse,
  SDKInitParams,
  Tournament, UpdateStatePayload, UseInGameItemResponse
} from "./types";
import {signPayload} from "./utils";

const SDK_VERSION = '1.1.0'; // Update this version when you update the SDK

/**
 * IframeSDK class implements the GameSDK interface and provides methods to interact with the game through an iframe.
 */
export class IframeSDK implements GameSDK {
  private requestId = 0;

  /**
   * Initializes the SDK with the given parameters.
   * @param {SDKInitParams} params - Initialization parameters.
   * @returns {Promise<{ currentTimestamp: string }>} - A promise that resolves with the current timestamp.
   */
  async init(params: SDKInitParams) {
    return await this.dispatch<{ currentTimestamp: string }>('INIT', {
      ...params,
      version: SDK_VERSION
    });
  }

  /**
   * Gets the SDK version.
   * @returns {string} - The SDK version.
   */
  getVersion() {
    return SDK_VERSION;
  }

  /**
   * Gets the player information.
   * @returns {Promise<Player>} - A promise that resolves with the player information.
   */
  async getPlayer() {
    return await this.dispatch<Player>('GET_PLAYER');
  }

  /**
   * Gets the tournament information.
   * @returns {Promise<Tournament | undefined>} - A promise that resolves with the tournament information or undefined if no tournament is found.
   */
  async getTournament() {
    const t = await this.dispatch<Tournament>('GET_TOURNAMENT');
    if (!t.id) return;

    return t;
  }

  /**
   * Starts the game play.
   * @returns {Promise<PlayResponse>} - A promise that resolves with the play response.
   */
  async play() {
    return await this.dispatch<PlayResponse>('PLAY');
  }

  /**
   * Tracks the score for a given game play.
   * @param {string} gamePlayId - The game play ID.
   * @param {number} score - The score to track.
   * @returns {Promise<void>} - A promise that resolves when the score is tracked.
   */
  async trackScore(gamePlayId: string, score: number) {
    return await this.dispatch<void>('TRACK_SCORE', {
      gamePlayId,
      score
    });
  }

  /**
   * Signs the result of a game play.
   * @param {string} gamePlayId - The game play ID.
   * @param {string} gameToken - The game token.
   * @param {number} score - The score to sign.
   * @returns {Promise<string>} - A promise that resolves with the signed result.
   */
  async signResult(gamePlayId: string, gameToken: string, score: number) {
    return await this.dispatch<string>('SIGN_RESULT', {
      gamePlayId,
      gameToken,
      score
    });
  }

  /**
   * Updates the state of the game.
   * @param {UpdateStatePayload} payload - The state payload to update.
   * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating success.
   */
  async updateState(payload: UpdateStatePayload): Promise<boolean> {
    return await this.dispatch<boolean>('UPDATE_STATE', payload);
  }

    /**
   * Signs a payload with a given key.
   * @param {any} payload - The payload to sign.
   * @param {string} key - The key to sign the payload with.
   * @returns {Promise<any>} - A promise that resolves with the signed payload.
   */
  async signPayload(payload: any, key: string) {
    return await signPayload(payload, key);
  }
  
  /*=== Bellow methods will be implemented in the near future ===*/

  /**
   * Shows the leaderboard.
   * @returns {Promise<void>} - A promise that resolves when the leaderboard is shown.
   */
  async showLeaderboard() {
    return await this.dispatch<void>('SHOW_LEADERBOARD');
  }

  /**
   * Triggers haptic feedback.
   * @param {HapticFeedbackType} type - The type of haptic feedback to trigger.
   * @returns {Promise<void>} - A promise that resolves when the haptic feedback is triggered.
 */
  async triggerHapticFeedback(type: HapticFeedbackType) {
    await this.dispatch('TRIGGER_HAPTIC_FEEDBACK', type);
  }
  
  
  /*=== Bellow methods will be implemented in the future ===*/
  async buyTickets() {
    return await this.dispatch<{ balance: number; tickets: number }>('BUY_TICKET');
  }

  async showShop() {
    return await this.dispatch<void>('SHOW_SHOP');
  }

  async getLeaderboard(limit: number, after: string, before: string) {
    return await this.dispatch<GetLeaderboardResponse>('GET_LEADERBOARD', {limit, after, before});
  }

  async getInGameItems() {
    return await this.dispatch<{ items: InGameItem[] }>('GET_INGAME_ITEMS');
  }

  async buyInGameItem(itemId: string, gameplayId?: string) {
    return await this.dispatch<BuyInGameItemResponse>('BUY_INGAME_ITEM', {itemId, gameplayId});
  }

  async exit(confirm = true) {
    return await this.dispatch<void>('EXIT', confirm);
  }

  async exitToListGames(confirm = true) {
    return await this.dispatch<void>('EXIT_TO_LIST_GAMES', confirm);
  }

  async useInGameItem(itemId: string, gameplayId?: string) {
    return await this.dispatch<UseInGameItemResponse>('USE_INGAME_ITEM', {itemId, gameplayId});
  }

  
  /*=== Methods to interact with Playnation parent page ===*/
  private requests: Record<number, { resolve: (data: any) => any; reject: (reason: string) => any }> = {};

  async dispatch<T>(action: string, data?: any, timeout = 60): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.requestId + 1;
      this.requestId = requestId;
      if (timeout) {
        setTimeout(() => {
          reject('timeout');
          delete this.requests[requestId];
        }, timeout * 1000);
      }

      this.requests[requestId] = {resolve, reject};
      const msg = {source: 'game-sdk', requestId, action, data};

      window.parent.postMessage(msg, '*');
    });
  }

  onMessage(event: MessageEvent) {
    if (typeof event.data !== 'object') return;

    const {requestId, ...payload} = event.data;
    if (!this.requests[requestId]) return;

    // console.log('SDK.onMesasge', event.data);
    const {resolve, reject} = this.requests[requestId]!;
    if (payload.error) {
      const err: any = new Error(payload.error);
      err.code = payload.code;
      reject(err);
    } else {
      resolve(payload?._payload || payload);
    }
    delete this.requests[requestId];
  }

  // Singleton
  private static _instance: IframeSDK;

  static get instance() {
    if (!IframeSDK._instance) {
      IframeSDK._instance = new IframeSDK();
      window.addEventListener('message', IframeSDK._instance.onMessage.bind(IframeSDK._instance));
    }
    return IframeSDK._instance;
  }
}
