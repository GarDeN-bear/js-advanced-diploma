import Character from './Character';
import characterClasses from './characterClasses';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error(
        'character must be instance of Character or its children'
      );
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  static fromObject(obj) {
    let ch = new characterClasses[obj.character.type](obj.character.level);
    ch.health = obj.character.health;

    return new PositionedCharacter(ch, obj.position);
  }
}
