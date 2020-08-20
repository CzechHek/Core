///api_version=2
(script = registerScript({
    name: "TowerScaffoldz",
    version: "1.7",
    authors: ["CzechHek", "yorik100"]
})).import("Core.lib");

module = {
    category: "World",
    description: "Scaffold Addon",
    onEnable: function () {
        TowerModule.state = !(ScaffoldModule.state = true);
    },
    onDisable: function () {
        ScaffoldModule.state = TowerModule.state = false;
    },
    onJump: function (e) {
        !isMovingHorizontally() && e.cancelEvent();
    },
    onMove: function (e) {
        !(ScaffoldModule.state = !(TowerModule.state = isMovingVertically() && !isMovingHorizontally())) && e.zeroXZ();
    }
}
