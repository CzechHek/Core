///api_version=2
(script = registerScript({
    name: "ValueBinder",
    version: "2.0",
    authors: ["CzechHek"]
})).import("Core.lib");

module = {
    category: "Misc",
    values: bindslist = value.createText("Binds", "{}"),
    description: "Allows you to bind module values to keys (.bindvalue)",
    onLoad: function () {
        ValueBinderModule.state = true;
        ValueBinderModule.array = false;
    },
    onKey: function (event) {
        var key = event.getKey(),
            binds = JSON.parse(bindslist.get());
        
        for (var m in binds) {
            for (var v in binds[m]) {
                var index = Keyboard.getKeyIndex(binds[m][v]);
                if (key == index) {
                    var value = moduleManager.getModule(m).getValue(v);
                    if (value instanceof BoolValue) {
                        value.set(!value.get());
                        LiquidBounce.hud.addNotification(new Notification(m + ": " + (value.get() ? "§aEnabled " : "§cDisabled ") + v));
                    } else {
                        var values = Java.from(value.getValues());
                        value.set(values[(values.indexOf(value.get()) + 1) % values.length]);
                        LiquidBounce.hud.addNotification(new Notification(m + ": §6Changed " + v + " to " + value.get()));
                    }
                    playSound("random.click");
                    return
                }
            }
        }
    },
    onDisable: function () {
        timeout(0, function () ValueBinderModule.state = true);
    }
}

command = {
    aliases: ["bindvalue", "bv"],
    handler: [
        function (module, value, key_or_clear) {
            if (targetModule = moduleManager.getModule(module)) {
                if (targetValue = targetModule.getValue(value)) {
                    if (targetValue instanceof BoolValue || targetValue instanceof ListValue) {
                        var bind = key_or_clear.toUpperCase(),
                            binds = JSON.parse(bindslist.get());

                        if (Keyboard.getKeyIndex(bind) && bind != "CLEAR") {
                            (binds[targetModule.name] = binds[targetModule.name] || {})[targetValue.name] = bind;
                            print("§2▏ §a§lBound §2" + targetModule.name + " " + targetValue.name + "§a to §2" + bind);
                        } else {
                            binds[targetModule.name] && delete binds[targetModule.name][targetValue.name];
                            print("§2▏ §a§lUnbound §2" + targetModule.name + " " + targetValue.name);
                        }
                        
                        Object.keys(binds).forEach(function (m) {!Object.keys(binds[m]).length && delete binds[m]});
                        playSound("random.anvil_use");
                        bindslist.set(JSON.stringify(binds));
                    } else print("§4▏ §c§lInvalid §cvalue §ltype §8(§cRequires§4: §4§lboolean §8/ §4§llist§8)");
                } else print("§4▏ §cValue§4", value, "§c§ldoes not exist");
            } else print("§4▏ §cModule§4", module, "§c§ldoes not exist");
        },
        {
            list: function () {
                var json = JSON.parse(bindslist.get()), list = {}, count = 0;
                
                for (var module in json) {
                    for (var value in json[module]) {
                        var key = json[module][value];
                        list[key] = list[key] || {};
                        (list[key][module] = toArray(list[key][module])).push(value);
                        count++;
                    }
                }

                if (count) {
                    print("§8▏ §7§lRegistered binds§8: §8(§7§l" + count + "§8)");
                    for (var key in list) print("§8▏ §7§l" + key + "§8: §f" + Object.keys(list[key]).map(function (module) module + " §8[§7" + list[key][module].join("§8,§7 ") + "§8]").join("§7,§f "));
                } else print("§4▏ §c§lNo binds§c are registered");

            },
            clear: function () {
                print("§2▏ §a§lRemoved all §2binds");
                playSound("random.anvil_use");
                bindslist.set("{}");
            }
        }
    ]
}

Notification = Java.type("net.ccbluex.liquidbounce.ui.client.hud.element.elements.Notification");