list = [
    range = value.createFloat("Distance", 3, 0.5, 8),
    speed = value.createFloat("Speed", 0.28, 0.1, 1),
    onmove = value.createBoolean("OnMove", true),
    autojump = value.createBoolean("AutoJump", true)
]

module = {
    name: "TargetStrafe",
    values: list,
    author: "CzechHek",
    version: "1.3",
    onMove: function (e) {
        target = getNearestTarget();
        distance = Math.sqrt(Math.pow(mc.thePlayer.posX - target.posX, 2) + Math.pow(mc.thePlayer.posZ - target.posZ, 2));
        yaw = Math.atan2(target.posZ - mc.thePlayer.posZ, target.posX - mc.thePlayer.posX) - (90 * Math.PI / 180);
        moveyaw = yaw + ((180 - 360 / 2 * Math.PI * range.get() / speed.get()) / 2 * Math.PI / 180);
        if (distance - 0.1 <= range.get() && (mc.gameSettings.keyBindForward.pressed || !onmove.get()) && !mc.gameSettings.keyBindSneak.pressed) {
            autojump.get() && mc.thePlayer.onGround && e.setY(0.42);
            e.setX(mc.thePlayer.motionX = -Math.sin(yaw) * (distance - range.get() < -speed.get() ? -speed.get() : distance - range.get()) - Math.sin(moveyaw) * speed.get());
            e.setZ(mc.thePlayer.motionZ = Math.cos(yaw) * (distance - range.get() < -speed.get() ? -speed.get() : distance - range.get()) + Math.cos(moveyaw) * speed.get());
        }
    }
}

script.import("Core.lib");