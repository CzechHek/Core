///api_version=2
(script = registerScript({
    name: "AutoSafeWalk",
    version: "1.3",
    authors: ["CzechHek"]
})).import("Core.lib");

module = {
    category: "Movement",
    description: "SafeWalk that activates if there is a gap exceeding maximal fall distance.",
    values: [
        airsafe = value.createBoolean("AirSafe", true),
        maxfalldistance = value.createInteger("MaxFallDistance", 5, 0, 255)
    ],
    onMove: function (e) {
        (mc.thePlayer.onGround || airsafe.get()) && e.setSafeWalk(!isAboveGround());
    }
}

function isAboveGround() {
    for (i = 0, bp = new BlockPos(mc.thePlayer); i++ < maxfalldistance.get();) if (!mc.theWorld.isAirBlock(bp.down(i))) return true
}