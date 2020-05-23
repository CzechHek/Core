command = {
    commands: ["Reloader", "r"],
    author: "CzechHek",
    version: 3.2,
    onExecute: function () {
        try {
            start = Instant.now();

            LiquidBounce.commandManager = new CommandManager();
            LiquidBounce.commandManager.registerCommands();
            for (i in modules = LiquidBounce.moduleManager.modules.toArray()) modules[i].values.length && LiquidBounce.commandManager.registerCommand(new ModuleCommand(modules[i], modules[i].values));

            (field = LiquidBounce.class.getDeclaredField("isStarting")).setAccessible(true);
            field.set(LiquidBounce.class, true);
            scriptManager.reloadScripts();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.valuesConfig);
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.modulesConfig);
            field.set(LiquidBounce.class, false);

            LiquidBounce.clickGui = new ClickGui();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.clickGuiConfig);

            chat.print("§8▏ §7Reloaded in §8" + ((Duration.between(start, Instant.now()).toMillis() / 1000) % 60) + "s");
        } catch (e) {
            chat.print("§8▏ §c§l" + e);
        }
    }
}

CommandManager = Java.type("net.ccbluex.liquidbounce.features.command.CommandManager"); ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui"); Instant = Java.type("java.time.Instant"); Duration = Java.type("java.time.Duration"); ModuleCommand = Java.type("net.ccbluex.liquidbounce.features.module.ModuleCommand");
script.import("Core.lib");
