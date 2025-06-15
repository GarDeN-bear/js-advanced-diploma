import GameController from "../GameController";

test("createInfoMessage test", () => {
  expect(
    GameController.createInfoMessage({
      level: 1,
      attack: 10,
      defence: 40,
      health: 50,
    })
  ).toBe(`\u{1F396}1 \u{2694}10 \u{1F6E1}40 \u{2764}50`);
});
