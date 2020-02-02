module = {
    name: "Example",
    description: "Description",
    category: "Exploit",
    author: "CzechHek",
    version: 0.35,
    tag: "tag me",
    values: [
        bool("bool", true),
        block("block", 0),
        float("float", 0.5, 0, 1),
        int("int", 0, 0, 1),
        list("list", ["1", "2"], "1"),
        text("text", "text"),
    ],
    onEnable: function () {},
    onDisable: function () {},
    onUpdate: function () {}, 
    onMotion: function (event) {},
    onRender2D: function (event) {},
    onRender3D: function (event) {},
    onAttack: function (event) {},
    onJump: function (event) {},
    onPacket: function (event) {},
    onKey: function (event) {},
    onMove: function (event) {},
    onStep: function (event) {},
    onStepConfirm: function (event) {},
    onWorld: function (event) {},
    onSession: function (event) {}
}

script.import("Core.lib");