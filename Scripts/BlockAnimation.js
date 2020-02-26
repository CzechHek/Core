animation = value.createInteger("Animation", 3, 0, 7);

module = {
    name: "BlockAnimation",
    author: "CzechHek",
    values: [animation],
    onMotion: function () {
        LiquidBounce.getModule(KillAura).blockingStatus && (mc.thePlayer.swingProgress = [0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94][animation.get()]);
    }
}

LiquidBounce = Java.type("net.ccbluex.liquidbounce.LiquidBounce").moduleManager;
KillAura = Java.type("net.ccbluex.liquidbounce.features.module.modules.combat.KillAura").class;

script.import("Core.lib");