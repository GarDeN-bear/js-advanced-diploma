import Character from '../Character';

export default class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.moveRange = 4;
    this.attackRange = 1;
    for (let i = 1; i < level; ++i) {
      this.increaseCharacteristics();
    }
  }
}
