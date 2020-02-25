module = {
    name: "TowerScaffoldz",
    description: "Scaffold Addon",
    author: "CzechHek, yorik100",
    version: 2.0,
    onEnable: function () {
        scaffold.state = true; tower.state = false;
    },
    onDisable: function () {
        scaffold.state = tower.state = false;
    },
    onJump: function (event) {
        !isMovingHorizontally() && event.cancelEvent();
    },
    onMove: function (event) {
        if (isMovingVertically() && !isMovingHorizontally()) {
            event.setX(0); event.setZ(0);
            scaffold.state = false; tower.state = true;
        } else {
            scaffold.state = true; tower.state = false;
        }
    }
}

scaffold = moduleManager.getModule("Scaffold"); tower = moduleManager.getModule("Tower");

script.import("Core.lib");
