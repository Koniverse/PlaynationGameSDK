import { camelCase } from 'lodash';
import z from 'zod';
import {
  BuyInGameItemResponse, ErrorCode, GameSDK, GetLeaderboardRequest, GetLeaderboardResponse, HapticFeedbackType,
  InGameItem,
  Player,
  PlayResponse,
  SDKInitParams, SignPayload,
  Tournament, TrackScorePayload, UpdateStatePayload,
  UseInGameItemResponse
} from "./types";
import {PlaynationSDKError} from "./utils";

// Implement example for sdk methods
const app: GameSDK & any = {
  viewport: document.getElementById('game-viewport') as HTMLIFrameElement | null,
  mainMenu: document.getElementById('main-menu') as HTMLDivElement | null,
  playerInfo: {
      id: 'p1',
      balance: 100,
      name: 'Player 1',
      avatar: 'https://thispersondoesnotexist.com/',
      level: 10,
      inventory: [],
      balanceNPS: 100,
      energy: 300,
      gameEnergy: 20,
      pointConversionRate: 0.5,
      state: {
        data: {a: 0, b: 0},
        signature: '0x0000',
        timestamp: new Date().toISOString(),
      }
    } as Player,
  openGame: (url: string) => {
    if (app.viewport) {
      app.viewport.src = url;
    }
  },
  start() {
    window.addEventListener('message', this._onMessage.bind(this));
    app.mainMenu?.classList.remove('hidden');
    const gameButton = document.getElementsByClassName('game-button');
    for(let i = 0; i < gameButton.length; i++) {
      gameButton[i].addEventListener('click', () => {
        app.mainMenu?.classList.add('hidden');
        app.openGame(gameButton[i].getAttribute('data-url') || '');
      });
    }
  },

  onInit(params: SDKInitParams) {
    // TODO: implement later

    console.log('init', params);
  },
  onGetPlayer() {
    return this.playerInfo;
  },
  onGetTournament() {
    // TODO: implement later

    const tour: Tournament = {
      id: 'tour1',
      name: 'tour1',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      entryFee: 0,
      entryTickets: 10,
      prizePool: {
        total: 0,
      },
      tickets: 10,
      totalPlayers: 100,
    };

    return tour;
  },
  onGetIngameItems() {
    const items: InGameItem[] = [];

    return { items };
  },
  onPlay() {
    app.playerInfo.energy -= 20;
    const res: PlayResponse = {
      token: 'abcxyz',
      remainingTickets: Math.floor(app.playerInfo.energy / 20) - 1,
      energy: app.playerInfo.energy,
    };

    return res;
  },
  onTrackScore({gamePlayId, score}: TrackScorePayload) {
    console.log('track score', gamePlayId, score);
  },
  onUpdateState({gamePlayId, state}: UpdateStatePayload) {
    this.playerInfo.state = state;
  },
  onBuyTickets() {
    throw new Error('not supported');
  },
  onBuyIngameItem(itemId: string, gameplayId?: string) {
    console.log('buy item', itemId, gameplayId);

    const res: BuyInGameItemResponse = {
      receipt: 'xxx',
      item: {
        id: 'item1',
        name: 'Booster',
        price: 10,
      },
    };

    return res;
  },
  onUseIngameItem(itemId: string, gameplayId?: string) {
    console.log('use item', itemId, gameplayId);

    const res: UseInGameItemResponse = {
      success: true,
      inventory: [],
    };

    return res;
  },
  onTriggerHapticFeedback(type: HapticFeedbackType) {
    // TODO: implement later
  },
  onSignResult({gamePlayId, gameToken, score}: SignPayload) {
    console.log('sign result', gamePlayId, gameToken, score);
    
    const addNPS = Math.floor(score * app.playerInfo.pointConversionRate);
    
    app.playerInfo.balance += score;
    app.playerInfo.balanceNPS += addNPS;
    
    alert(`You got ${score} points and ${addNPS} NPS`)

    const sig = 'abc123';

    return sig;
  },
  onShowLeaderboard() {
    alert('Show leaderboard');
  },
  onShowShop() {
    alert('Open the shop');
  },
  onGetLeaderboard(req: GetLeaderboardRequest) {
    const res: GetLeaderboardResponse = {
      players: [],
    };

    return res;
  },
  
  onExit() {
    app.openGame('');
    app.mainMenu?.classList.remove('hidden');
  },
  
  onExitToListGames() {
    console.log('exit to list games');
  },

  async _onMessage(event: MessageEvent) {
    const schema = z.object({
      source: z.enum(['game-sdk']),
      action: z.string().min(1),
      data: z.any(),
      requestId: z.number(),
    });

    const result = schema.safeParse(event.data);
    if (!result.success) return;

    const { data, action, requestId } = result.data;
    let res;
    try {
      const handleMethod = camelCase('on_' + action);
      const handler = (this as any)[handleMethod];

      if (!handler || typeof handler !== 'function') {
        throw newError(
          `missing handle func ${handleMethod} for action ${action}`,
          ErrorCode.SYSTEM_ERROR,
        );
      }

      res = await handler.call(this, data);
    } catch (e) {
      res = { error: `${e}`, code: (e as any)?.code || -1 };
      console.error('handle err', e);
    }

    // console.log('send response', this.viewport, requestId, res);
    this.viewport?.contentWindow?.postMessage(
      {
        ...(res || { _payload: undefined }),
        requestId: requestId,
      },
      '*',
    );
  },
};

function newError(msg: string, code?: ErrorCode) {
  return new PlaynationSDKError(msg, code);
}

app.start();

