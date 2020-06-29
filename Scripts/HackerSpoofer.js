var list = [
    range = value.createFloat("Range", 4, 1, 8),
    look = value.createBoolean("Look", true),
    swing = value.createBoolean("Swing", true),
    lookatnearest = value.createBoolean("LookAtNearest", true),
    specificplayer = value.createBoolean("SpecificPlayer", false),
    nick = value.createText("Nick", "")
], prevSettings, ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");

module = {
    name: "HackerSpoofer",
    author: "CzechHek",
    version: 1.3,
    values: list,
    onLoad: function () {
        LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.valuesConfig);
        updateValues();
    },
    onUpdate: function () {
        updateValues();
        if ((target = specificplayer.get() ? getPlayer(nick.get()) : getNearestTarget(EntityPlayer)) && target.getDistanceToEntity(lookAt = (lookatnearest.get() && specificplayer.get() ? getNearestTarget(EntityPlayer, target) : mc.thePlayer)) <= range.get()) {
            diffX = target.posX - lookAt.posX; diffY = target.posY - lookAt.posY; diffZ = target.posZ - lookAt.posZ;
            look.get() && (target.rotationYaw = target.rotationYawHead = ((Math.atan2(diffZ, diffX) * 180 / Math.PI) + 90), target.rotationPitch = Math.atan2(diffY, Math.sqrt(diffX * diffX + diffZ * diffZ)) * 180 / Math.PI);
            swing.get() && target.swingItem();
        }
        if (specificplayer.get() && mc.pointedEntity instanceof EntityPlayer && Mouse.isButtonDown(1)) nick.set(mc.pointedEntity.getName());
    }
}

function updateValues() {
    if (mc.currentScreen instanceof ClickGui) {
        prevSettings != specificplayer.get() && (prevSettings = specificplayer.get(), setValues(HackerSpooferModule, prevSettings ? list : [range, look, swing, specificplayer]))
    } else if (prevSettings) {
        setValues(HackerSpooferModule, list);
		LiquidBounce.fileManager.saveConfig(LiquidBounce.fileManager.valuesConfig);
		prevSettings = null;
    }
}

Mouse = Java.type("org.lwjgl.input.Mouse");

script.import("Core.lib");