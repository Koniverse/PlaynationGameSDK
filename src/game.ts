import {GameState, InGameItem, Player} from "./types";
import {IframeSDK} from "./websdk";

if (!window.PlaynationGameSDK) {
  Object.assign(window, { PlaynationGameSDK: IframeSDK.instance });
}

const gameSDK = window.PlaynationGameSDK;

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const app = () => ({
  player: {} as unknown as Player,
  gameplay: {} as any,
  tournament: {},
  items: [] as InGameItem[],
  data:  {} as any,
  async init() {
    gameSDK.init({
      clientId: 'fake-client',
    });

    this.player = await gameSDK.getPlayer();
    this.tournament = (await gameSDK.getTournament()) || {};
    const itemData = await gameSDK.getInGameItems().catch();
    this.items = itemData.items || [];
    
    const defaultState = {'a': 0, 'b': 0};
    const data = deepCopy(this.player.state?.data || defaultState);
    console.debug('init with data', data);
    
    setInterval(() => {
      data.a += 1;
      data.b += 3;
      this.data = data;
      this.updateState({
        timestamp: new Date().toISOString(),
        signature: '0x0000',
        data: data
      }).catch(console.error);
    }, 1000)
  },
  async play() {
    // Game client should call game API to init new gameplay and get gameplayId;
    const gameplayId = 'gameplay1';

    const { token, energy } = await gameSDK.play();
    this.player.energy = energy;
    this.gameplay = {
      id: gameplayId,
      score: 0,
      token,
    };
  },
  newScore(score: number) {
    gameSDK.triggerHapticFeedback('impactLight');
    this.gameplay.score = score;
    gameSDK.trackScore({
      gamePlayId: this.gameplay.id,
      score,
    });
  },
  async gameover() {
    const signature = await gameSDK.signResult({
      gamePlayId: 'gameplay-1',
      gameToken: this.gameplay.token,
      score: this.gameplay.score,
    });
    
    const player = await gameSDK.getPlayer();
    Object.assign(this.player, player);

    // After sign result, game client should send signature & game token to game server.
    // Game server should call S2S API to send score to Wallacy.
    console.log('game client should send this data to game server', {
      signature,
      token: this.gameplay.token,
      score: this.gameplay.score,
    });

    this.gameplay = {};
  },
  updateState(state: GameState<any>) {
    return gameSDK.updateState({
      gamePlayId: 'gameplay-1',
      state,
    });
  },
  getSDKVersion() {
    return gameSDK.getVersion();
  },
  exit() {
    return gameSDK.exit(true);
  },
  reload() {
    location.reload();
  },
  openShop() {
    gameSDK.showShop();
  },
  openLeaderboard() {
    gameSDK.showLeaderboard();
  },
});

Object.assign(window, { app });
