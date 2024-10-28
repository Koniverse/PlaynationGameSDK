import { camelCase } from 'lodash';
import z from 'zod';
import {
  BuyInGameItemResponse,
  ErrorCode,
  GameSDK,
  GameState,
  GetLeaderboardRequest,
  GetLeaderboardResponse,
  HapticFeedbackType,
  InGameItem,
  Player,
  PlaynationSDKError,
  PlayResponse,
  SDKInitParams,
  SignPayload, SubmitStatePayload,
  Tournament,
  TrackScorePayload,
  UseInGameItemResponse,
} from '@playnation/game-sdk';
import { CARD_USER_START, CardStat, GAME_EVENTS, GameInitData, StateData } from './data.ts';
import { newGamePlayPayload } from '../../../src';


const GamePlaySimulator = {
  get totalScore() {
    return parseInt(localStorage.getItem('totalScore') || '0');
  },
  set totalScore(score: number) {
    localStorage.setItem('totalScore', score.toString());
  },
  get highScore() {
    return parseInt(localStorage.getItem('highScore') || '0');
  },
  set highScore(score: number) {
    localStorage.setItem('highScore', score.toString());
  },
  get balanceNPS() {
    return parseInt(localStorage.getItem('BalanceNPS') || '0');
  },
  set balanceNPS(score: number) {
    localStorage.setItem('BalanceNPS', score.toString());
  },
  get state () {
    return JSON.parse(localStorage.getItem('state') || '{}');
  },
  set state (state: GameState<any>) {
    localStorage.setItem('state', JSON.stringify(state));
  },
  addScore(score: number) {
    GamePlaySimulator.totalScore += score;
    if (score > GamePlaySimulator.highScore) {
      GamePlaySimulator.highScore = score;
    }
  },
  addNPS(nps: number) {
    GamePlaySimulator.balanceNPS += nps;
  }
}

let gamePlay: any = {...GameInitData, stateData: JSON.parse(JSON.stringify(StateData))}


// Implement example for sdk methods
const app: GameSDK & any = {
  viewport: document.getElementById('game-viewport') as HTMLIFrameElement | null,
  mainMenu: document.getElementById('main-menu') as HTMLDivElement | null,
  playerInfo: {
    id: 'p1',
    balance: 100,
    totalScore: 100,
    name: 'Player 1',
    avatar: 'https://thispersondoesnotexist.com/',
    level: 1,
    inventory: [],
    balanceNPS: 100,
    energy: 300,
    gameEnergy: 20,
    pointConversionRate: 0.6,
    state: {
      data: {
        mythicalCards: CARD_USER_START
      },
      signature: '0x0000',
      timestamp: new Date().toISOString(),
    },
    event: GAME_EVENTS
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

  // Implement SDK methods
  onInit(params: SDKInitParams) {
    console.log('init', params);
  },
  
  onGetPlayer() {
    const totalScore = GamePlaySimulator.totalScore;
    this.playerInfo.totalScore = totalScore;
    this.playerInfo.balance = totalScore;
    this.playerInfo.highScore = GamePlaySimulator.highScore;
    this.playerInfo.balanceNPS = GamePlaySimulator.balanceNPS;
    
    return this.playerInfo;
  },
  
  onGetTournament() {
    const startTime = new Date();
    startTime.setMonth(startTime.getMonth() - 1);
    const endTime = new Date();
    endTime.setMonth(endTime.getMonth() + 1);
    
    const tour: Tournament = {
      id: 1,
      name: 'Tournament 1',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      tickets: Math.floor(app.playerInfo.energy / this.playerInfo.gameEnergy),
    };

    return tour;
  },
  
  onPlay(payload: newGamePlayPayload) {
    const { gameId, gameInitData, gameEventId} = payload;
    app.playerInfo.energy -= 20;
    gamePlay = {
      ... {...GameInitData, stateData: JSON.parse(JSON.stringify(StateData))},
      gameId,
      gameEventId
    }
    gamePlay.stateData = {
      ...gamePlay.stateData,
      userCards: gameInitData.userCardsSelected,
      currentRound: 0,
      playDuration: 0,
      state: 'not_started'
    }
    const res: PlayResponse = {
      gamePlay,
      token: 'abcxyz',
      remainingTickets: Math.floor(app.playerInfo.energy / 20) - 1,
      energy: app.playerInfo.energy,
    };

    return res;
  },
  
  onTrackScore({gamePlayId, score}: TrackScorePayload) {
    console.log('track score', gamePlayId, score);
  },
  
  onSignResult({gamePlayId, gameToken, score}: SignPayload) {
    console.log('Sign result to submit game point', gamePlayId, gameToken, score);
    
    const addNPS = Math.floor(score * app.playerInfo.pointConversionRate);
    
    GamePlaySimulator.addScore(score);
    GamePlaySimulator.addNPS(addNPS);
    
    alert(`You got ${score} points and ${addNPS} NPS`)

    const sig = 'abc123';

    return sig;
  },
  
  onGetInGameItems() {
    const items: InGameItem[] = [
      {
        id: 'item1',
        name: 'Booster',
        price: 10,
      },
      {
        id: 'item2',
        name: 'Energy',
        price: 20,
      },
    ];

    return { items };
  },
  
  onSubmitState(payload_: SubmitStatePayload) {
    const { stateData} = payload_ 
    const {data} = stateData;
    const cardPlayer = data?.roundData?.cardPlayer;
    let currentRound = gamePlay.stateData.currentRound;


    if (data.action === 'start') {

      gamePlay.stateData.state = 'start';
      gamePlay.stateData.rounds[0].state = 'ready';
    } else if (data.action === 'play') {

      gamePlay.stateData.state = 'playing';
      currentRound++;

      let round = {...gamePlay.stateData.rounds[currentRound - 1]}
      round.cardPlayer = cardPlayer;
      round.state = 'active';
      round = {...round,
        isWin: true,
        score: 100
      }
      
      round.statResult = [CardStat.ACC];
      round.cardPlayer = cardPlayer;
      gamePlay.stateData.currentRound = currentRound;
      gamePlay.stateData.rounds[currentRound - 1] = round;
      gamePlay.stateData.userCards = gamePlay.stateData.userCards.filter((card: { defId: string }) => card.defId !== round.cardPlayer?.defId);
        // Set next round to be ready
      if (currentRound < gamePlay.stateData.rounds.length) {
        gamePlay.stateData.rounds[currentRound].state = 'ready';
      }
    } else if (data.action === 'finish') {
      // Handle finish action

      gamePlay.state = 'finished';
      // Todo: Issue-23 Update playDuration round by round
      gamePlay.playDuration = Math.floor((gamePlay.endTime.getTime() - gamePlay.startTime.getTime()) / 1000);
      gamePlay.point = 100000;
      
    } else {
      throw new Error('Invalid action');
    }
    
    
    return {
      success: true,
      gamePlay
    }
  },
  
  // Will be implemented soon
  onShowLeaderboard() {
    console.log('Open the shop will be implemented soon');
    alert('Show leaderboard');
  },
  
  onTriggerHapticFeedback(type: HapticFeedbackType) {
    console.log('HapticFeedback will be implemented later', type);
  },
  
  // Will be implemented later
  onBuyTickets() {
    throw new Error('not supported');
  },
  onGetIngameItems() {
    const items: InGameItem[] = [];

    return { items };
  },
  onBuyIngameItem(itemId: string, gameplayId?: string) {
    console.log('buy item', itemId, gameplayId);
    console.log('Open the shop features will be implemented later');

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
    console.log('Open the shop features will be implemented later');

    const res: UseInGameItemResponse = {
      success: true,
      inventory: [],
    };

    return res;
  },
  onShowShop() {
    console.log('Open the shop will be implemented later');
    alert('Open the shop');
  },
  onGetLeaderboard(req: GetLeaderboardRequest) {
    console.log('This method is deprecated, the leaderboard will fetching by the app', req);
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

  // Handle message from game client
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

