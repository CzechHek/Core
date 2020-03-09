module = {
    name: "Reloader",
    author: "CzechHek",
    onEnable: function () {
        LiquidBounce.commandManager = new CommandManager();
        LiquidBounce.commandManager.registerCommands();
        scriptManager.reloadScripts();
    },
    onLoad: function () {
        delay(200, function () {
            LiquidBounce.clickGui = new ClickGui();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.clickGuiConfig);
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.modulesConfig);
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.valuesConfig);
            mc.currentScreen instanceof ClickGui && moduleManager.getModule("ClickGui").setState(true);
        });
    }
}

LiquidBounce = Java.type("net.ccbluex.liquidbounce.LiquidBounce"); ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui"); CommandManager = Java.type("net.ccbluex.liquidbounce.features.command.CommandManager");
script.import("Core.lib");