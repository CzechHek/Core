///api_version=2
(script = registerScript({
    name: "TowerScaffoldz",
    version: "1.8",
    authors: ["CzechHek", "yorik100"]
})).import("Core.lib");

module = {
    category: "World",
    description: "Scaffold Addon",
    onEnable: function () {
        hideScaffold = ScaffoldModule.array; hideTower = TowerModule.array;
        ScaffoldModule.array = TowerModule.array = TowerModule.state = !(ScaffoldModule.state = true);
    },
    onDisable: function () {
        ScaffoldModule.state = TowerModule.state = false;
        ScaffoldModule.array = hideScaffold; TowerModule.array = hideTower;
    },
    onJump: function (e) {
        !isInputHorizontally() && e.cancelEvent();
    },
    onMove: function (e) {
        !(ScaffoldModule.state = !(TowerModule.state = isInputVertically() && !isInputHorizontally())) && e.zeroXZ();
    }
}