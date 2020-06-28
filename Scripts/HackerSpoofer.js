list = [
    range = value.createFloat("Range", 4, 1, 8),
    look = value.createBoolean("Look", true),
    swing = value.createBoolean("Swing", true),
    specificplayer = value.createBoolean("SpecificPlayer", false),
    nick = value.createText("Nick", "")
]

module = {
    name: "HackerSpoofer",
    author: "CzechHek",
    values: list,
    onUpdate: function () {
        if ((target = specificplayer.get() ? getPlayer(nick.get()) : getNearestTarget()) && target.getDistanceToEntity(mc.thePlayer) <= range.get()) {
            diffX = target.posX - mc.thePlayer.posX; diffY = target.posY - mc.thePlayer.posY; diffZ = target.posZ - mc.thePlayer.posZ;
            look.get() && (target.rotationYaw = target.rotationYawHead = ((Math.atan2(diffZ, diffX) * 180 / Math.PI) + 90), target.rotationPitch = Math.atan2(diffY, Math.sqrt(diffX * diffX + diffZ * diffZ)) * 180 / Math.PI);
            swing.get() && target.swingItem();
        }
    }
}

script.import("Core.lib");