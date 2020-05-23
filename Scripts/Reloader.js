command = {
    commands: ["Reloader", "r"],
    author: "CzechHek",
    version: 3.3,
    onExecute: function () {
        try {
            start = Instant.now();

            LiquidBounce.commandManager.commands.clear();
            LiquidBounce.commandManager.registerCommands();

            (field = LiquidBounce.class.getDeclaredField("isStarting")).setAccessible(true);
            field.set(LiquidBounce.class, true);
            scriptManager.disableScripts();
            scriptManager.unloadScripts();
            for (i in modules = LiquidBounce.moduleManager.modules.toArray()) modules[i].values.length && LiquidBounce.commandManager.registerCommand(new ModuleCommand(modules[i], modules[i].values));
            scriptManager.loadScripts();
            scriptManager.enableScripts();
            LiquidBounce.fileManager.loadConfigs(LiquidBounce.fileManager.valuesConfig, LiquidBounce.fileManager.modulesConfig);
            field.set(LiquidBounce.class, false);

            LiquidBounce.clickGui = new ClickGui();
            LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.clickGuiConfig);

            chat.print("§8▏ §7Reloaded in §8" + ((Duration.between(start, Instant.now()).toMillis() / 1000) % 60) + "s");
        } catch (e) {
            chat.print("§8▏ §c§l" + e);
        }
    }
}

ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui"); Instant = Java.type("java.time.Instant"); Duration = Java.type("java.time.Duration"); ModuleCommand = Java.type("net.ccbluex.liquidbounce.features.module.ModuleCommand");
script.import("Core.lib");
