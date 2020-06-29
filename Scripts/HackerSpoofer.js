list = [
    range = value.createFloat("Range", 4, 1, 8),
    look = value.createBoolean("Look", true),
    swing = value.createBoolean("Swing", true),
    specificplayer = value.createBoolean("SpecificPlayer", false),
    nick = value.createText("Nick", ""),
    lookatnearest = value.createBoolean("LookAtNearest", true)
]

module = {
    name: "HackerSpoofer",
    author: "CzechHek",
    version: 1.1,
    values: list,
    onUpdate: function () {
        if ((target = specificplayer.get() ? getPlayer(nick.get()) : getNearestTarget(EntityPlayer)) && target.getDistanceToEntity(lookAt = (lookatnearest.get() && specificplayer.get() ? getNearestTarget(EntityPlayer, target) : mc.thePlayer)) <= range.get()) {
            diffX = target.posX - lookAt.posX; diffY = target.posY - lookAt.posY; diffZ = target.posZ - lookAt.posZ;
            look.get() && (target.rotationYaw = target.rotationYawHead = ((Math.atan2(diffZ, diffX) * 180 / Math.PI) + 90), target.rotationPitch = Math.atan2(diffY, Math.sqrt(diffX * diffX + diffZ * diffZ)) * 180 / Math.PI);
            swing.get() && target.swingItem();
        }
    }
}

script.import("Core.lib");