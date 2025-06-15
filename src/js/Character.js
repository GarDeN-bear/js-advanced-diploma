/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magicianbowman
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.moveRange = 0;
    this.attackRange = 0;
    this.type = type;
    if (new.target == Character) throw 'Character() is prohibited';
    // TODO: выбросите исключение, если кто-то использует "new Character()"
  }

  levelUp() {
    this.level += 1;
    this.increaseCharacteristics();
  }

  increaseCharacteristics() {
    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
    this.attack = Math.floor(
      Math.max(this.attack, (this.attack * (80 + this.health)) / 100)
    );
    this.defence = Math.floor(
      Math.max(this.defence, (this.defence * (80 + this.health)) / 100)
    );
  }
}
