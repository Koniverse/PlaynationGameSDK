import {InGameItem, IframeSDK, Player, signPayload} from "@playnation/game-sdk";

const gameSDK = IframeSDK.instance;

const app = () => ({
  player: {} as unknown as Player,
  gameplay: {} as any,
  items: [] as InGameItem[],
  data: {} as any,
  async init() {
    await gameSDK.init({
      clientId: 'fake-client',
    });

    this.player = await gameSDK.getPlayer();
    const itemData = await gameSDK.getInGameItems().catch();
    this.items = itemData.items || [];
  },
  async play() {
    // Game client should call game API to init new gameplay and get gameplayId;
    const gameplayId = 'gameplay1';

    const {token, energy} = await gameSDK.play();
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

Object.assign(window, {app});
