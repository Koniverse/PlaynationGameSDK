import {InGameItem, Player} from "./types";
import {IframeSDK} from "./websdk";
import {deepCopy, signPayload} from "./utils";

if (!window.PlaynationGameSDK) {
  Object.assign(window, { PlaynationGameSDK: IframeSDK.instance });
}

const gameSDK = window.PlaynationGameSDK;


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
      this.updateState(data).catch(console.error);
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
    gameSDK.trackScore(this.gameplay.id, score);
  },
  async gameover() {
    const signature = await gameSDK.signResult('gameplay-1', this.gameplay.token, this.gameplay.score);
    
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
  async updateState(data: any) {
    const signature = await signPayload(data, 'secret-key');
    
    return await gameSDK.updateState({
      gamePlayId: 'gameplay-1',
      state: {
        signature: signature.toString(),
        timestamp: new Date().toISOString(),
        data,
      },
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
