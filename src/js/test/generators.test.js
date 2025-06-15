import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";
import { characterGenerator, generateTeam } from "../generators";

test("characterGenerator test", () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 2;
  const playerGenerator = characterGenerator(playerTypes, maxLevel);

  for (let i = 0; i < 3; ++i) {
    const character = playerGenerator.next().value;
    expect(playerTypes.some((type) => character instanceof type)).toBe(true);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(maxLevel);
  }
});

test("generateTeam test", () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;
  const teamSize = 4;
  const team = generateTeam(playerTypes, maxLevel, teamSize);

  expect(team.characters.length).toBe(teamSize);
  for (let i = 0; i < teamSize; ++i) {
    expect(playerTypes.some((type) => team.characters[i] instanceof type)).toBe(
      true
    );
    expect(team.characters[i].level).toBeGreaterThanOrEqual(1);
    expect(team.characters[i].level).toBeLessThanOrEqual(maxLevel);
  }
});
