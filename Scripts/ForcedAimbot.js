///api_version=2
(script = registerScript({
    name: "ForcedAimbot",
    version: "1.1",
    authors: ["CzechHek"]
})).import("Core.lib");

module = {
    name: "ForcedAimbot",
    category: "Combat",
    values: [
        name = value.createText("Nick", ""),
        range = value.createFloat("Range", 4.4, 1, 8),
        turnspeed = value.createFloat("TurnSpeed", 20, 1, 180),
        fov = value.createFloat("FOV", 180, 1, 180),
        center = value.createBoolean("Center", false),
        lock = value.createBoolean("Lock", true)
    ],
    onStrafe: function () {
        target = Java.from(mc.theWorld.playerEntities).find(function (player) player.getName() == name.get())
        if (target && mc.thePlayer.getDistanceToEntity(target) <= range.get() && RotationUtils.getRotationDifference(target) <= fov.get() && (lock.get() || RotationUtils.isFaced(target, range.get()))) {
            targetRotation = center.get() ? RotationUtils.toRotation(RotationUtils.getCenter(target.getEntityBoundingBox()), true) : (result = RotationUtils.searchCenter(target.getEntityBoundingBox(), false, false, true, false, range.get())) && result.getRotation();
            if (targetRotation) {
                RotationUtils.limitAngleChange(
                    new Rotation(mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch),
                    targetRotation,
                    turnspeed.get() + Math.random()
                ).toPlayer(mc.thePlayer);
            }
        }
    }
}