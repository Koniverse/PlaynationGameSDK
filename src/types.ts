export interface GameSDKHandler {
  /** SDK must be initialized first */
  init(params: SDKInitParams): Promise<{
    // ISO8601 date string
    currentTimestamp: string;
  }>;
  
  /** Get basic actions*/
  getPlayer(): Promise<Player>;
  getVersion(): string;
  
  /** Return current tournament, undefined = practice mode */
  getTournament(): Promise<Tournament | undefined>;
  buyTickets(): Promise<{ balance: number; tickets: number }>;
  
  /** Call play will cost player 1 ticket and return a token to submit score */
  play(): Promise<PlayResponse>;
  /** Call every time player's score change */
  trackScore(payload: TrackScorePayload): Promise<void>;
  /** Sign game play result and return signature to submit score */
  signResult(payload: SignPayload): Promise<string>;
  /** Call every time game state is changed */
  updateState(payload: UpdateStatePayload): Promise<boolean>;
  
  /** Leader board action*/
  showLeaderboard(): Promise<void>;
  getLeaderboard(req: GetLeaderboardRequest): Promise<GetLeaderboardResponse>;
  
  /** Shop actions  */
  showShop(): Promise<void>;
  getInGameItems(): Promise<{ items: InGameItem[] }>;
  buyInGameItem(payload: BuyItemPayload): Promise<BuyInGameItemResponse>;
  useInGameItem(payload: UseItemPayload): Promise<UseInGameItemResponse>;
  /**
   * quit game, close webview
   * @param confirm default = true
   */
  exit(confirm: boolean): Promise<void>;
  /**
   * quit game and back to list games
   * @param confirm default = true
   */
  exitToListGames(confirm: boolean): Promise<void>;
  
  // Devices actions
  triggerHapticFeedback(type: HapticFeedbackType): Promise<void>;
}

export interface GameSDK {
  /** SDK must be initialized first */
  init(params: SDKInitParams): Promise<{
    // ISO8601 date string
    currentTimestamp: string;
  }>;
  
  /** Get basic actions*/
  getPlayer(): Promise<Player>;
  getVersion(): string;
  
  /** Return current tournament, undefined = practice mode */
  getTournament(): Promise<Tournament | undefined>;
  buyTickets(): Promise<{ balance: number; tickets: number }>;
  
  /** Call play will cost player 1 ticket and return a token to submit score */
  play(): Promise<PlayResponse>;
  /** Call every time player's score change */
  trackScore(gamePlayId: string, score: number): Promise<void>;
  /** Sign game play result and return signature to submit score */
  signResult(gamePlayId: string, gameToken: string, score: number): Promise<string>;

  /** Call every time game state is changed */
  updateState(payload: UpdateStatePayload): Promise<boolean>;
  
  /** Leader board action*/
  showLeaderboard(): Promise<void>;
  getLeaderboard(limit: number, after: string, before: string): Promise<GetLeaderboardResponse>;
  
  /** Shop actions  */
  showShop(): Promise<void>;
  getInGameItems(): Promise<{ items: InGameItem[] }>;
  buyInGameItem(itemId: string, gameplayId?: string): Promise<BuyInGameItemResponse>;
  useInGameItem(itemId: string, gameplayId?: string): Promise<UseInGameItemResponse>;
  /**
   * quit game, close webview
   * @param confirm default = true
   */
  exit(confirm: boolean): Promise<void>;
  /**
   * quit game and back to list games
   * @param confirm default = true
   */
  exitToListGames(confirm: boolean): Promise<void>;
  
  // Devices actions
  triggerHapticFeedback(type: HapticFeedbackType): Promise<void>;
}

declare var PlaynationGameSDK: GameSDK;

export interface GameState<T> {
  signature: string;
  // ISO8601 date string
  timestamp: string;
  data: T;
}

export interface Player {
  id: string;
  name: string;
  level?: number;
  /** Image URL */
  avatar?: string;
  /** Total user game point */
  balance: number; // Deprecated
  
  /** Alternative of the balance */
  totalScore: number;
  highScore?: number;
  
  /** User Inventory list */
  inventory?: Inventory;
  
  /** Player Energy */
  energy: number, 
  /** Energy Per Game */
  gameEnergy: number,
  /** User Current NPS */
  balanceNPS: number;
  /** Ratio convert game point to NPS*/
  pointConversionRate: number,
  
  /** State of some special like farming */
  state?: GameState<any>;
}

export type Inventory = Array<{
  /** InGameItem ID */
  itemId: string;
  quantity: number;
}>;


/** Deprecated **/
export interface Tournament {
  id: number;
  name: string;
  /** ISO 8601 timestamp */
  startTime: string;
  /** ISO 8601 timestamp */
  endTime: string;
  
  /** Total tickets of current player
   * Deprecated - Replace with player energy */
  tickets: number;
}

export interface InGameItem {
  id: string;
  name: string;
  price: number;
}

export interface SDKInitParams {
  /** default to latest version */
  version?: string;
  clientId: string;
}

export interface GetLeaderboardRequest {
  limit: number;
  after: string;
  before: string;
}

type LeaderboardItem = Player & { rank: number; score: number };

export interface GetLeaderboardResponse {
  players: LeaderboardItem[];
  me?: LeaderboardItem;
}

export interface BuyInGameItemResponse {
  receipt: string;
  item: InGameItem;
}

export type UseInGameItemResponse = {
  success: boolean;
  inventory: Inventory;
};

export interface PlayResponse {
  gamePlayId: string;
  /** One time token, use to submit score */
  token: string;
  remainingTickets: number; // Backward compatibility
  energy: number;
}

export interface Error {
  code?: number;
}

export interface SignPayload {
  gamePlayId: string;
  gameToken: string;
  score: number;
}

export interface TrackScorePayload {
  gamePlayId: string;
  score: number;
}


export interface UpdateStatePayload {
  gamePlayId: string;
  state: GameState<any>
}

export interface BuyItemPayload {
  itemId: string;
  gameplayId?: string;
}

export interface UseItemPayload {
  itemId: string;
  gameplayId?: string;
}

export type HapticFeedbackType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'impactRigid'
  | 'impactSoft'
  | 'notiSuccess'
  | 'notiWarning'
  | 'notiError';

export enum ErrorCode {
  SYSTEM_ERROR = -1, // something went wrong
  INVALID_REQUEST = 10,
  INVALID_SCORE = 120, // score was not accepted (cheat detected)
  USER_REJECT = 130, // User reject transaction (buy tickets or items)
  NOT_ENOUGH_ENERGY = 150, // Not enough ticket to play game
  
  TOUR_NOT_AVAILABLE = 100, // tournament has ended or disabled
  NOT_ENOUGH_NPS = 110, // no enought NPS to buy tickets or items
  NOT_ENOUGH_TICKET = 140, // Not enough ticket to play game
}

export type IframeWindow = typeof globalThis & Window & {
  PlaynationGameSDK: GameSDK;
}

export type HexString = `0x${string}`;