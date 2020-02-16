idk = value.createInteger("Integer", 5, 0, 10);
lol = value.createText("ok", "wtf");

module = {
    name: "Example",
    description: "Description",
    category: "Exploit",
    author: "CzechHek",
    version: 0.35,
    tag: "tag me",
    values: [idk, lol],
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
    onStepConfirm: function () {},
    onWorld: function (event) {},
    onSession: function () {},
    onLoad: function () {},
    onUnload: function () {}
}

script.import("Core.lib");
