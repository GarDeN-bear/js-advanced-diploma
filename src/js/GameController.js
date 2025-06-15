import themes from './themes';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import GamePlay from './GamePlay';
import cursors from './cursors';
import Team from './Team';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerableTypes = ['bowman', 'swordsman', 'magician'];
    this.gameLevel = 1;
    this.maxGameLevel = 4;
    this.isGameOver = false;
    this.countScores = 0;
    this.isPlayerTurn = true;
    this.theme = themes.prairie;

    this.selectedPositionedCharacter = null;
    this.selectedCell = null;
    this.cursor = cursors.auto;

    this.teamsInfo = {
      teams: {},
      positionedCharacters: {},
    };
  }

  init() {
    this.unsubscribeOnEvents();
    this.loadGameState();
    this.initLevel();
    this.subscribeOnEvents();
  }

  loadGameState() {
    this.state = this.stateService.load();
    if (this.state) {
      this.restoreGameState();
    }
  }

  restoreGameState() {
    this.resetTeams();
    this.isPlayerTurn = this.state.isPlayerTurn;
    this.gameLevel = this.state.gameLevel;
    this.countScores = this.state.countScores;
    this.isGameOver = this.state.isGameOver;
    this.theme = this.state.theme;

    for (const [key, team] of Object.entries(this.state.teamsInfo.teams)) {
      this.teamsInfo.teams[key] = Team.fromObject(team);
    }
    for (const [key, pc] of Object.entries(
      this.state.teamsInfo.positionedCharacters
    )) {
      this.teamsInfo.positionedCharacters[key] =
        PositionedCharacter.fromObject(pc);
    }
  }

  drawGameUI() {
    this.gamePlay.drawUi(this.theme);
  }

  initLevel(isLevelUp = false) {
    if (isLevelUp) this.handleLevelUp();

    if (this.isGameOver) return;

    this.setThemeByLevel();
    this.resetSelectionState();
    if (!this.state) this.resetTeams(isLevelUp);
    this.drawGameUI();
    this.initTeams(isLevelUp);
  }

  handleLevelUp() {
    ++this.gameLevel;
    if (this.gameLevel > this.maxGameLevel) {
      this.gameOver(true);
    }
  }

  setThemeByLevel() {
    const levelThemes = {
      1: themes.prairie,
      2: themes.desert,
      3: themes.arctic,
      4: themes.mountain,
    };
    this.theme = levelThemes[this.gameLevel] || themes.prairie;
  }

  resetSelectionState() {
    this.selectedPositionedCharacter = null;
    this.selectedCell = null;
    this.cursor = cursors.auto;
  }

  resetTeams(isLevelUp) {
    if (!isLevelUp) {
      this.teamsInfo = { teams: {}, positionedCharacters: {} };
    } else {
      this.teamsInfo.positionedCharacters = {};
    }
    this.isPlayerTurn = true;
  }

  initTeams(isLevelUp = false) {
    if (!this.state) {
      this.generateTeams(isLevelUp);
      this.positionTeams();
    }
    this.redrawPositions();
  }

  redrawPositions() {
    this.gamePlay.redrawPositions(
      Object.values(this.teamsInfo.positionedCharacters)
    );
  }

  generateTeams(isLevelUp) {
    const teamsCount = 2;
    for (let i = 0; i < teamsCount; i++) {
      this.generateTeam(i, isLevelUp);
    }
  }

  generateTeam(teamIndex, isLevelUp) {
    const playerTeamTypes = [Bowman, Swordsman, Magician];
    const enemyTeamTypes = [Vampire, Undead, Daemon];

    if (teamIndex === 0) {
      if (isLevelUp) {
        this.levelUpTeam(this.teamsInfo.teams[teamIndex]);
      } else {
        this.teamsInfo.teams[teamIndex] = generateTeam(
          playerTeamTypes,
          this.gameLevel,
          2
        );
      }
    } else {
      this.teamsInfo.teams[teamIndex] = generateTeam(
        enemyTeamTypes,
        this.gameLevel,
        2
      );
    }
  }
  levelUpTeam(team) {
    team.characters.forEach((character) => character.levelUp());
  }

  positionTeams() {
    for (const [index, team] of Object.entries(this.teamsInfo.teams)) {
      const positions = this.generatePositionsForTeam(team, index);
      this.createPositionedCharacters(team, positions);
    }
  }

  generatePositionsForTeam(team, teamIndex) {
    const positions = [];
    const limits = this.getPositionLimits(teamIndex);

    for (let i = 0; i < team.characters.length; i++) {
      let position;
      do {
        const row = this.getRandomInt(limits.rows.min, limits.rows.max);
        const col = this.getRandomInt(limits.cols.min, limits.cols.max);
        position = row * this.gamePlay.boardSize + col;
      } while (positions.includes(position));
      positions.push(position);
    }

    return positions;
  }

  getPositionLimits(teamIndex) {
    if (teamIndex == 0) {
      // Player team
      return {
        rows: { min: 0, max: this.gamePlay.boardSize - 1 },
        cols: { min: 0, max: 1 },
      };
    } else {
      // Enemy team
      return {
        rows: { min: 1, max: this.gamePlay.boardSize - 1 },
        cols: {
          min: this.gamePlay.boardSize - 2,
          max: this.gamePlay.boardSize - 1,
        },
      };
    }
  }

  createPositionedCharacters(team, positions) {
    team.characters.forEach((character, index) => {
      this.teamsInfo.positionedCharacters[positions[index]] =
        new PositionedCharacter(character, positions[index]);
    });
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  subscribeOnEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  unsubscribeOnEvents() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];
  }

  static createInfoMessage({ level, attack, defence, health }) {
    return `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;
  }

  isInAttackRange(positionedCharacter, index) {
    if (!positionedCharacter) return false;

    const [characterRow, characterCol] = this.getPositionCoordinates(
      positionedCharacter.position
    );
    const [indexRow, indexCol] = this.getPositionCoordinates(index);

    const rowDiff = Math.abs(indexRow - characterRow);
    const colDiff = Math.abs(indexCol - characterCol);

    return (
      rowDiff <= positionedCharacter.character.attackRange &&
      colDiff <= positionedCharacter.character.attackRange
    );
  }

  isInMoveRange(positionedCharacter, index) {
    if (!positionedCharacter) return false;

    const [characterRow, characterCol] = this.getPositionCoordinates(
      positionedCharacter.position
    );
    const [indexRow, indexCol] = this.getPositionCoordinates(index);

    const isRightDirection =
      indexRow === characterRow ||
      indexCol === characterCol ||
      Math.abs(indexRow - characterRow) === Math.abs(indexCol - characterCol);

    const isWithinRange =
      Math.abs(indexRow - characterRow) <=
        positionedCharacter.character.moveRange &&
      Math.abs(indexCol - characterCol) <=
        positionedCharacter.character.moveRange;

    return isRightDirection && isWithinRange;
  }

  getRowIndex(index) {
    return Math.floor(index / this.gamePlay.boardSize);
  }

  getColIndex(index) {
    return index % this.gamePlay.boardSize;
  }

  getPosition(row, col) {
    return row * this.gamePlay.boardSize + col;
  }

  getPositionCoordinates(position) {
    return [this.getRowIndex(position), this.getColIndex(position)];
  }

  doAttack(attacker, target) {
    const damage = this.calculateDamage(attacker, target);
    target.character.health -= damage;

    this.gamePlay.showDamage(target.position, damage).then(() => {
      this.handlePostAttackEffects(target);
    });
  }

  calculateDamage(attacker, target) {
    return Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1
    );
  }

  handlePostAttackEffects(target) {
    if (target.character.health <= 0) {
      this.removeDeadCharacter(target);
    }

    this.checkGameOver();
    this.redrawPositions();
    this.switchTurn();
  }

  removeDeadCharacter(target) {
    delete this.teamsInfo.positionedCharacters[target.position];
    this.gamePlay.hideCellTooltip(target.position);

    if (this.isPlayerTurn) {
      this.resetSelectionState();
      ++this.countScores;
    }
  }

  checkGameOver() {
    const playersAlive = Object.values(
      this.teamsInfo.positionedCharacters
    ).filter((pc) => this.playerableTypes.includes(pc.character.type));

    if (playersAlive.length === 0) {
      this.gameOver(false);
    }
  }

  gameOver(isVictory) {
    this.isGameOver = true;
    GamePlay.showMessage(
      isVictory
        ? `You have won game! Your scores are ${this.countScores}`
        : 'You have lost!'
    );
    this.gamePlay.setCursor(cursors.auto);
  }

  switchTurn() {
    this.isPlayerTurn = !this.isPlayerTurn;
    if (!this.isPlayerTurn) {
      this.handleEnemyTurn();
    }
  }

  doMovement(positionedCharacter, index) {
    this.moveCharacter(positionedCharacter, index);
    this.redrawPositions();
    this.switchTurn();
  }

  moveCharacter(character, newPosition) {
    delete this.teamsInfo.positionedCharacters[character.position];
    character.position = newPosition;
    this.teamsInfo.positionedCharacters[newPosition] = character;
  }

  handleEnemyTurn() {
    const enemies = this.getEnemies();
    const players = this.getPlayers();

    if (enemies.length === 0) {
      this.initLevel(true);
      return;
    }

    const enemy = this.selectRandomEnemy(enemies);
    this.performEnemyAction(enemy, players);
  }

  getEnemies() {
    return Object.values(this.teamsInfo.positionedCharacters).filter(
      (pc) => !this.playerableTypes.includes(pc.character.type)
    );
  }

  getPlayers() {
    return Object.values(this.teamsInfo.positionedCharacters).filter((pc) =>
      this.playerableTypes.includes(pc.character.type)
    );
  }

  selectRandomEnemy(enemies) {
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  performEnemyAction(enemy, players) {
    const targetPlayer = this.findClosestPlayer(enemy, players);

    if (this.isInAttackRange(enemy, targetPlayer.position)) {
      this.doAttack(enemy, targetPlayer);
    } else {
      const targetPosition = this.calculateEnemyMovement(enemy, targetPlayer);
      this.doMovement(enemy, targetPosition);
    }
  }

  findClosestPlayer(enemy, players) {
    let minDistance = Infinity;
    let closestPlayer = null;

    for (const player of players) {
      const distance = this.calculateDistance(enemy.position, player.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    }

    return closestPlayer;
  }

  calculateDistance(position1, position2) {
    const [row1, col1] = this.getPositionCoordinates(position1);
    const [row2, col2] = this.getPositionCoordinates(position2);
    return Math.sqrt(Math.pow(row2 - row1, 2) + Math.pow(col2 - col1, 2));
  }

  calculateEnemyMovement(enemy, targetPlayer) {
    const [enemyRow, enemyCol] = this.getPositionCoordinates(enemy.position);
    const [targetRow, targetCol] = this.getPositionCoordinates(
      targetPlayer.position
    );

    const rowDiff = targetRow - enemyRow;
    const colDiff = targetCol - enemyCol;

    const steps = Math.min(
      enemy.character.moveRange,
      this.calculateDistance(enemy.position, targetPlayer.position)
    );

    const behaviorType = Math.floor(Math.random() * 3);
    let newRow = enemyRow + Math.sign(rowDiff) * steps;
    let newCol = enemyCol + Math.sign(colDiff) * steps;

    switch (behaviorType) {
    case 0: // Move vertically
      newCol = enemyCol;
      break;
    case 1: // Move horizontally
      newRow = enemyRow;
      break;
    default: // Move diagonally
      newRow = enemyRow;
      newCol = enemyCol;
      break;
    }

    // Ensure new position is within bounds
    newRow = Math.floor(
      Math.max(0, Math.min(this.gamePlay.boardSize - 1, newRow))
    );
    newCol = Math.floor(
      Math.max(0, Math.min(this.gamePlay.boardSize - 1, newCol))
    );
    const newPosition = this.getPosition(newRow, newCol);

    // Don't move if target cell is occupied
    return this.teamsInfo.positionedCharacters[newPosition]
      ? enemy.position
      : newPosition;
  }

  onCellClick(index) {
    // TODO: react to click
    if (!this.canProcessClick()) return;

    const clickedCharacter = this.teamsInfo.positionedCharacters[index];

    if (this.isPlayerCharacter(clickedCharacter)) {
      this.handlePlayerCharacterSelection(index);
    } else if (this.cursor === cursors.crosshair) {
      this.handleAttack(index);
    } else if (this.cursor === cursors.pointer) {
      this.handleMovement(index);
    } else {
      GamePlay.showError('Not allowed click');
    }
    this.switchCursor(index);
  }

  canProcessClick() {
    return this.isPlayerTurn && !this.isGameOver;
  }

  isPlayerCharacter(character) {
    return character && this.playerableTypes.includes(character.character.type);
  }

  handlePlayerCharacterSelection(index) {
    if (this.selectedPositionedCharacter)
      this.gamePlay.deselectCell(this.selectedPositionedCharacter.position);
    this.gamePlay.selectCell(index);
    this.selectedPositionedCharacter =
      this.teamsInfo.positionedCharacters[index];
  }

  handleAttack(index) {
    this.doAttack(
      this.selectedPositionedCharacter,
      this.teamsInfo.positionedCharacters[index]
    );
    this.deselectCells();
  }

  handleMovement(index) {
    const positionedCharacter = this.selectedPositionedCharacter;
    this.deselectCells();
    this.doMovement(positionedCharacter, index);
  }

  deselectCells() {
    this.gamePlay.deselectCell(this.selectedPositionedCharacter.position);
    this.gamePlay.deselectCell(this.selectedCell);
    this.selectedPositionedCharacter = null;
  }

  switchCursor(index) {
    if (!this.selectedPositionedCharacter) {
      this.handleCursorWithoutSelection(index);
    } else {
      this.handleCursorWithSelection(index);
    }
    this.selectedCell = index;
    this.gamePlay.setCursor(this.cursor);
  }

  handleCursorWithoutSelection(index) {
    const character = this.teamsInfo.positionedCharacters[index];

    if (!character) {
      this.cursor = cursors.auto;
    } else if (this.isPlayerCharacter(character)) {
      this.cursor = cursors.pointer;
    } else {
      this.cursor = cursors.notallowed;
    }
  }

  handleCursorWithSelection(index) {
    if (this.selectedPositionedCharacter.position !== this.selectedCell)
      this.gamePlay.deselectCell(this.selectedCell);
    const character = this.teamsInfo.positionedCharacters[index];
    const isPlayerChar = character && this.isPlayerCharacter(character);
    const isEnemyChar = character && !this.isPlayerCharacter(character);

    if (isPlayerChar) {
      this.cursor = cursors.pointer;
    } else if (
      this.isInAttackRange(this.selectedPositionedCharacter, index) &&
      isEnemyChar
    ) {
      this.cursor = cursors.crosshair;
      this.gamePlay.selectCell(index, 'red');
    } else if (
      this.isInMoveRange(this.selectedPositionedCharacter, index) &&
      !isEnemyChar
    ) {
      this.cursor = cursors.pointer;
      this.gamePlay.selectCell(index, 'green');
    } else {
      this.cursor = cursors.notallowed;
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.isGameOver) return;

    this.switchCursor(index);
    this.showTooltipIfCharacterPresent(index);
  }

  showTooltipIfCharacterPresent(index) {
    const character = this.teamsInfo.positionedCharacters[index];
    if (character) {
      this.gamePlay.showCellTooltip(
        GameController.createInfoMessage(character.character),
        index
      );
    }
  }

  onCellLeave(index) {
    if (this.isGameOver) return;
    this.gamePlay.hideCellTooltip(index);
  }

  onNewGameClick() {
    this.resetGameState();
    this.init();
  }

  resetGameState() {
    this.isGameOver = false;
    this.countScores = 0;
    this.gameLevel = 1;
    this.stateService.save(null);
  }

  onSaveGameClick() {
    this.stateService.save(this.getCurrentGameState());
  }

  getCurrentGameState() {
    return {
      gameLevel: this.gameLevel,
      countScores: this.countScores,
      isGameOver: this.isGameOver,
      teamsInfo: this.teamsInfo,
      theme: this.theme,
      isPlayerTurn: this.isPlayerTurn,
    };
  }

  onLoadGameClick() {
    this.init();
  }
}
