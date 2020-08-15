///api_version=2
(script = registerScript({
    name: "ValueBinder",
    version: "1.6",
    authors: ["CzechHek"]
})).import("Core.lib");

module = {
    category: "Misc",
    values: [bindslist = value.createText("Binds", "{}")],
    onLoad: function () {
        ValueBinderModule.state = true;
    },
    onKey: function (event) {
        key = event.getKey();
        binds = JSON.parse(bindslist.get());
        Object.keys(binds).forEach(function (m) {
            Object.keys(binds[m]).forEach(function (v) {
                k = Keyboard.getKeyIndex(binds[m][v]);
                if (k == key) {
                    value = LiquidBounce.moduleManager.getModule(m).getValue(v);
                    if (value instanceof BoolValue) value.set(!value.get()), LiquidBounce.hud.addNotification(new Notification(m + ": " + (value.get() ? "§aEnabled " : "§cDisabled ") + v));
                    else if (value instanceof ListValue) value.set(value.getValues()[(Java.from(value.getValues()).indexOf(value.get()) + 1) % value.getValues().length]), LiquidBounce.hud.addNotification(new Notification(m + ": §6Changed " + v + " to " + value.get()));
                    playSound("random.click");
                }
            })
        })
    }
}

command = {
    name: "ValueBinder",
    commands: ["bindvalue", "bv"],
    onExecute: function (args) {
        if (args.length == 4 && (module = LiquidBounce.moduleManager.getModule(args[1])) && (value = module.getValue(args[2])) && (bind = args[3].toUpperCase())) {
            if (!(value instanceof BoolValue || value instanceof ListValue)) return chat.print("§4▏ §cInvalid value type, requires §4§lboolean §c/ §4§llist")
            binds = JSON.parse(bindslist.get());
            if (Keyboard.getKeyIndex(bind)) (binds[module.name] = binds[module.name] || {})[value.name] = bind, chat.print("§2▏ §aBound §2§l" + module.name + " " + value.name + "§a to §2§l" + bind);
            else chat.print("§2▏ §aUnbound §2§l" + module.name + " " + value.name), binds[module.name] && delete binds[module.name][value.name];
            Object.keys(binds).forEach(function (m) {!Object.keys(binds[m]).length && delete binds[m]});
            playSound("random.anvil_use");
            bindslist.set(JSON.stringify(binds));
        } else if (args.length == 2 && args[1] == "clear") bindslist.set("{}"), chat.print("§2▏ §aRemoved all binds"), playSound("random.anvil_use");
        else chat.print("§8▏ §7Usage§8: §f" + _prefix + args[0] + " §f„§7module§f“ §f„§7value§f“ §f„§7key§f“ §8/ §f" + _prefix + args[0] + " clear");
    }
}

Notification = Java.type("net.ccbluex.liquidbounce.ui.client.hud.element.elements.Notification");

function playSound (name) {
    mc.theWorld.playSound(mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ, name, 1, 1, false);
}