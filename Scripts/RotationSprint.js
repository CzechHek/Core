///api_version=2
(script = registerScript({
    name: "RotationSprint",
    authors: ["CzechHek"],
    version: "1.1"
})).import("Core.lib");

module = {
    category: "Movement",
    description: "Silently rotates you in the way you are moving.",
    values: turnspeed = value.createInteger("TurnSpeed", 180, 1, 180),
    onUpdate: function () {
        limitedRotation = RotationUtils.limitAngleChange(RotationUtils.serverRotation, rotation = new Rotation(MovementUtils.getDirection() * 180 / Math.PI, mc.thePlayer.rotationPitch), turnspeed.get());
        !KillAuraModule.state && !ScaffoldModule.state && !TowerModule.state && !AimbotModule.state && !BowAimbotModule.state && RotationUtils.setTargetRotation(limitedRotation);

        mc.thePlayer.setSprinting(RotationUtils.getRotationDifference(rotation) < 30);
    }
}