command = {
    commands: ["r"],
    author: "CzechHek",
    onExecute: function () {       
        try {
            start = Instant.now();

            LiquidBounce.commandManager = new CommandManager();
            LiquidBounce.commandManager.registerCommands();
            scriptManager.reloadScripts();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.modulesConfig);
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.valuesConfig);
            LiquidBounce.clickGui = new ClickGui();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.clickGuiConfig);

            finish = Instant.now();
            timeElapsed = Duration.between(start, finish).toMillis();

            chat.print("§8▏ §7Reloaded in §8" + ((timeElapsed / 1000) % 60) + "s");
        } catch (e) {
            chat.print("§8▏ §c§l" + e);
        }
    }
}

LiquidBounce = Java.type("net.ccbluex.liquidbounce.LiquidBounce"); CommandManager = Java.type("net.ccbluex.liquidbounce.features.command.CommandManager"); ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui"); Instant = Java.type("java.time.Instant"); Duration = Java.type("java.time.Duration");
script.import("Core.lib");