module = {
    name: "TowerScaffoldz",
    description: "Scaffold Addon",
    author: "CzechHek, yorik100",
    version: "2.1",
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

script.import("Core.lib");
