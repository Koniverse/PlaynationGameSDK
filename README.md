# Overview

This is an SDK for integrating games into Playnation.

The first SDK version follows the concept from [game-sdk-example](https://github.com/wallacy-io/game-sdk-example).

Online Demo: [https://playnation-sdk-demo.netlify.app](https://playnation-sdk-demo.netlify.app)

## Concepts
- Connect game on the iframe with `postMessage` and window listening.
- The game will interact with the game server through the SDK and parent window. 

## Play the game
What is implemented in the [game.ts](examples%2Fiframe-implementation%2Fsrc%2Fgame.ts) or [game-farming.ts](examples%2Fiframe-implementation%2Fsrc%2Fgame-farming.ts):

Init flow: Get basic information
- `init()`
- `getSDKVersion()`
- `getPlayer()`
- `getTournament()`

Play casual game flow
- `play()` start the game
- `trackScore()` on playing
- `signResult()` sign and submit the result
- `getPlayer()` to retrieve player data

Play farming game
- `play()` start the game
- `signPayload()` sign to get the game state with secret key from the game
- `updateState()` update signed payload every time the game state changes

---

# How to use

## Run the example
clone this repository and run the example:
```sh
git clone
cd ./examples/iframe-implementation
yarn && yarn dev
```

## Quick start
Include the SDK in your HTML file:
```html
<script src="https://unpkg.com/@playnation/game-sdk@latest/browser/sdk.js"></script>
```

Create a JavaScript file (e.g., main.js) with something like this example below:
```js
document.addEventListener('DOMContentLoaded', async () => {
  const sdk = window.PlaynationGameSDK;
  
  // Run on init
  const initParams = { clientId: 'your-client-id' };
  const initResponse = await sdk.init(initParams);
  console.log('SDK Initialized:', initResponse);

  // Get SDK version
  const version = sdk.getVersion();
  console.log('SDK Version:', version);

  // Get player information
  let player = await sdk.getPlayer();
  console.log('Player Info:', player);

  // Get tournament information
  const tournament = await sdk.getTournament();
  console.log('Tournament Info:', tournament);

  // Play the game
  async function playGame() {
    // Start the game play
    const playResponse = await sdk.play();
    console.log('Play Response:', playResponse);

    // Track score
    await sdk.trackScore(playResponse.token, 100);
    console.log('Score tracked');

    // Sign result
    const signedResult = await sdk.signResult(playResponse.token, 'game-token', 100);
    console.log('Signed Result:', signedResult);
    
    // Get player information
    player = await sdk.getPlayer();
  }
});
```

## Installation

### Install with npm
npm:
```sh
npm install @playnation/sdk
```

or with yarn: 
```sh
yarn add @playnation/sdk
```

### Get from CDN

Use latest version:
```html
<script src="https://unpkg.com/@playnation/game-sdk@latest/browser/sdk.js"></script>
```

Or specify version:
```html
<script src="https://unpkg.com/@playnation/game-sdk@1.1.0/browser/sdk.js"></script>
```

## Implementation
### Methods

#### `init(params: SDKInitParams): Promise<{ currentTimestamp: string }>`
Initializes the SDK with the given parameters.

- **params**: Initialization parameters.
- **Returns**: A promise that resolves with the current timestamp.

#### `getVersion(): string`
Gets the SDK version.

- **Returns**: The SDK version.

#### `getPlayer(): Promise<Player>`
Gets the player information.

- **Returns**: A promise that resolves with the player information.
- **player**: Player information will include the following fields:
  - **id**: The player ID.
  - **name**: The player name.
  - **totalScore**: The player's total score.
  - **highScore**: The player's highest score.
  - **balanceNPS**: The player's NPS.
  - **energy**: The player's energy.
  - **gameEnergy**: Energy cost each play time.
  - **pointConversionRate**: The point conversion rate.
  - **state**: The latest state in case farming game.

#### `getTournament(): Promise<Tournament | undefined>`
Gets the tournament information.

- **Returns**: A promise that resolves with the tournament information or undefined if no tournament is found.

#### `play(): Promise<PlayResponse>`
Starts the game play.
Note: This method will return a token that should be used to track the score and sign the result.

- **Returns**: A promise that resolves with the play response.

#### `trackScore(gamePlayId: string, score: number): Promise<void>`
Tracks the score for a given game play.

- **gamePlayId**: The game play ID.
- **score**: The score to track.
- **Returns**: A promise that resolves when the score is tracked.

#### `signResult(gamePlayId: string, gameToken: string, score: number): Promise<string>`
Signs & submits the result of a game play. The game result will be signed and submitted to the Playnation server.

- **gamePlayId**: The game play ID.
- **gameToken**: The game token.
- **score**: The score to sign.
- **Returns**: A promise that resolves with the signed result.

#### `updateState(payload: UpdateStatePayload): Promise<boolean>`
Updates the state of the game. Playnation only updates the game state but does not validate its details, so the data needs to be signed with signPayload and validated between the game and the server to ensure security. 

- **payload**: The state payload to update.
- **Returns**: A promise that resolves with a boolean indicating success.

#### `signPayload(payload: any, key: string): Promise<any>`
Signs a payload with a given key.

- **payload**: The payload to sign.
- **key**: The key to sign the payload with.
- **Returns**: A promise that resolves with the signed payload.

## Error handling

### Error Codes

Enum representing various error codes that can be returned by the SDK.

- **`SYSTEM_ERROR`**: `-1`
  - Description: Something went wrong.
  
- **`INVALID_REQUEST`**: `10`
  - Description: The request is invalid.
  
- **`INVALID_SCORE`**: `120`
  - Description: The score was not accepted (cheat detected).
  
- **`USER_REJECT`**: `130`
  - Description: The user rejected the transaction (buy tickets or items).
  
- **`NOT_ENOUGH_ENERGY`**: `150`
  - Description: Not enough energy to play the game.
  
- **`TOUR_NOT_AVAILABLE`**: `100`
  - Description: The tournament has ended or is disabled.
  
- **`NOT_ENOUGH_NPS`**: `110`
  - Description: Not enough NPS to buy tickets or items.
  
- **`NOT_ENOUGH_TICKET`**: `140`
  - Description: Not enough tickets to play the game.

---
# Development

## Develop with example

### Develop game iframe:
  
```sh
cd ./examples/iframe-implementation
yarn && yarn dev
```

You also develop your game from the example by modifying the `index.html` file.
Change the `src` attribute of the iframe to your game URL.

```html
<button class="game-button" data-url="[your-game-url]" type="button">Casual Game</button>
<button class="game-button" data-url="[your-game-url]" type="button">Farming Game</button>
```

### Build example:

```sh
cd ./examples/iframe-implementation
yarn && yarn build
```

## Develop SDK:
Example will use the SDK from the `src` folder in the root directory instead of from `node_modules`.
```sh
cd ./examples/iframe-implementation
yarn && yarn dev:source
```

## Build SDK

```sh
yarn && yarn build
```
