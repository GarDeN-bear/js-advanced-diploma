import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level) {
    super(level, 'swordsman');
    this.attack = 40;
    this.defence = 10;
    this.moveRange = 4;
    this.attackRange = 1;
    for (let i = 1; i < level; ++i) {
      this.increaseCharacteristics();
    }
  }
}
