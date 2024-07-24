# Game SDK

This is a SDK for integrating game into Playnation.

The first SDK version is following the concept from https://github.com/wallacy-io/game-sdk-example

## Integration

`PlaynationGameSDK` will be injected into webview when launching game , view [types.ts](./src/types.ts) to know how to use SDK.

1. First step: initialize SDK: `PlaynationGameSDK.init()`
2. Get player info & tournament info: `PlaynationGameSDK.getPlayer()`, `PlaynationGameSDK.getTournament()`
3. Before user play game: Call `PlaynationGameSDK.play()` to get game token. User must have ticket to play, call this function will cost 1 ticket.
4. If game has in-game item, user can buy with `PlaynationGameSDK.buyInGameItem()`, if success it returns a receipt that can be send to game server to verify through S2S API.
5. Game over: Call `PlaynationGameSDK.signResult()` to sign game play result, then send signature along with game token to game server, game server should use this data to submit score to Wallacy through S2S API.

### Error handling

Example:

```ts
try {
  const res = await PlaynationGameSDK.play();
} catch (e: Error) {
  switch (e.code) {
    case ErrorCode.TourNotAvailable:
    // do sth
    case ErrorCode.SystemError:
    // do sth
  }
}
```

### Mock SDK for development

In development, you can create a mock SDK to test integration, Ex: [mock_sdk.ts](./src/mock_sdk.ts)

## Development

```sh
$ yarn
$ yarn dev
```
