///api_version=2
(script = registerScript({
    name: "GhostFall",
    authors: ["CzechHek", "yorik100"],
    version: "3.0"
})).import("Core.lib");

module = {
    category: "Player",
    onPacket: function (e) {
        e.getPacket() instanceof C03PacketPlayer && mc.thePlayer.fallDistance && (e.getPacket().onGround = mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0, -2, 0).expand(0, 2, 0)).isEmpty());
    }
}