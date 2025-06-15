import Character from "../Character";
import Bowman from "../characters/Bowman";
import Swordsman from "../characters/Swordsman";
import Magician from "../characters/Magician";
import Vampire from "../characters/Vampire";
import Undead from "../characters/Undead";
import Daemon from "../characters/Daemon";

test("Character test", () => {
  expect(() => {
    new Character(1);
  }).toThrow("Character() is prohibited");
});

test("Bowman test", () => {
  let bowman = new Bowman(1);
  expect(bowman.type).toBe("bowman");
  expect(bowman.level).toBe(1);
  expect(bowman.attack).toBe(25);
  expect(bowman.defence).toBe(25);
});

test("Swordsman test", () => {
  let swordsman = new Swordsman(1);
  expect(swordsman.type).toBe("swordsman");
  expect(swordsman.level).toBe(1);
  expect(swordsman.attack).toBe(40);
  expect(swordsman.defence).toBe(10);
});

test("Magician test", () => {
  let magician = new Magician(1);
  expect(magician.type).toBe("magician");
  expect(magician.level).toBe(1);
  expect(magician.attack).toBe(10);
  expect(magician.defence).toBe(40);
});

test("Vampire test", () => {
  let vampire = new Vampire(1);
  expect(vampire.type).toBe("vampire");
  expect(vampire.level).toBe(1);
  expect(vampire.attack).toBe(25);
  expect(vampire.defence).toBe(25);
});

test("Undead test", () => {
  let undead = new Undead(1);
  expect(undead.type).toBe("undead");
  expect(undead.level).toBe(1);
  expect(undead.attack).toBe(40);
  expect(undead.defence).toBe(10);
});

test("Daemon test", () => {
  let daemon = new Daemon(1);
  expect(daemon.type).toBe("daemon");
  expect(daemon.level).toBe(1);
  expect(daemon.attack).toBe(10);
  expect(daemon.defence).toBe(10);
});
