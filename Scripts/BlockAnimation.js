list = [
    animation = value.createInteger("Animation", 3, 0, 7),
    vibration = value.createFloat("Vibration", 0, 0, 5),
    fake = value.createBoolean("Fake", false)
]

module = {
    name: "BlockAnimation",
    author: "CzechHek",
    version: "1.6",
    values: list,
    onMotion: function () {
        mc.thePlayer.itemInUseCount = (fake.get() && !KillAuraModule.getValue("AutoBlock").get() && KillAuraModule.target && !!(heldItem = mc.thePlayer.getHeldItem()) && heldItem.getItem() instanceof Java.type("net.minecraft.item.ItemSword")) || mc.thePlayer.isBlocking() ? 1337 : mc.thePlayer.itemInUseCount == 1337 ? 0 : mc.thePlayer.itemInUseCount;
        (KillAuraModule.blockingStatus || mc.thePlayer.itemInUseCount == 1337) && (mc.thePlayer.swingProgress = [0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88, 0.94][animation.get()], mc.thePlayer.prevSwingProgress = mc.thePlayer.swingProgress - (0.01 * vibration.get()));
    },
    onDisable: function () {
        mc.thePlayer.itemInUseCount = mc.thePlayer.itemInUseCount == 1337 ? 0 : mc.thePlayer.itemInUseCount;
    },
    onLoad: function () {
        moduleManager.getModule(this.name).state = true;
    }
}

script.import("Core.lib");
