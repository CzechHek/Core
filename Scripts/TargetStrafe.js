list = [
    range = value.createFloat("Distance", 3, 0.5, 8),
    speed = value.createFloat("Speed", 0.28, 0.1, 1),
    fov = value.createInteger("FOV", 180, 30, 180),
    onmove = value.createBoolean("OnMove", true),
    autojump = value.createBoolean("AutoJump", true)
    
]

module = {
    name: "TargetStrafe",
    values: list,
    author: "CzechHek",
    version: "1.6",
    onMove: function (e) {
        strafing = false;
        if ((target = getNearestTarget()) && (mc.gameSettings.keyBindForward.pressed || !onmove.get()) && !mc.gameSettings.keyBindSneak.pressed && !mc.thePlayer.moveStrafing) {

            distance = Math.sqrt(Math.pow(mc.thePlayer.posX - target.posX, 2) + Math.pow(mc.thePlayer.posZ - target.posZ, 2))
            strafeYaw = Math.atan2(target.posZ - mc.thePlayer.posZ, target.posX - mc.thePlayer.posX);
            yaw = strafeYaw - (0.5 * Math.PI);
            predict = [target.posX + (2 * (target.posX - target.lastTickPosX)), target.posZ + (2 * (target.posZ - target.lastTickPosZ))];

            if ((distance - speed.get()) > range.get() || Math.abs(((((yaw * 180 / Math.PI - mc.thePlayer.rotationYaw) % 360) + 540) % 360) - 180) > fov.get() || !isAboveGround(predict[0], target.posY, predict[1])) return
            
            encirclement = distance - range.get() < -speed.get() ? -speed.get() : distance - range.get();
            encirclementX = -Math.sin(yaw) * encirclement;
            encirclementZ = Math.cos(yaw) * encirclement;
            strafeX = -Math.sin(strafeYaw) * speed.get() * direction;
            strafeZ = Math.cos(strafeYaw) * speed.get() * direction;

            mc.thePlayer.onGround && (!isAboveGround(mc.thePlayer.posX + encirclementX + (2 * strafeX), mc.thePlayer.posY, mc.thePlayer.posZ + encirclementZ + (2 * strafeZ)) || mc.thePlayer.isCollidedHorizontally) && (direction *= -1, strafeX *= -1, strafeZ *= -1);

            e.setX(encirclementX + strafeX);
            e.setZ(encirclementZ + strafeZ);
            strafing = true;
        }
    },
    onUpdate: function () {
        strafing && mc.thePlayer.onGround && autojump.get() && mc.thePlayer.jump();
    }
}

direction = 1; strafing = false;

function isAboveGround(x, y, z) {
    for (i = Math.ceil(y); (y - 5) < i--;) if (!mc.theWorld.isAirBlock(new BlockPos(x, i, z))) return true
}

script.import("Core.lib");