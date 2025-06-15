import characterClasses from './characterClasses';
/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor(characters) {
    this.characters = characters;
  }

  static fromObject(obj) {
    let characters = [];
    for (let i = 0; i < obj.characters.length; ++i) {
      let ch = new characterClasses[obj.characters[i].type](
        obj.characters[i].level
      );
      ch.health = obj.characters[i].health;
      characters.push(ch);
    }
    return new Team(characters);
  }
}
