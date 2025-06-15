export default class GameState {
  static from(object) {
    // TODO: create object
    const state = new GameState();
    state.gameLevel = object.gameLevel;
    state.countScores = object.countScores;
    state.isGameOver = object.isGameOver;
    state.teamsInfo = object.teamsInfo;
    state.theme = object.theme;
    state.isPlayerTurn = object.isPlayerTurn;
    return state;
  }
}
