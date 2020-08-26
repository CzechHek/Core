///api_version=2
(script = registerScript({
    name: "BlinkNoFall",
    authors: ["CzechHek"],
    version: "1.2"
})).import("Core.lib");

module = {
    category: "Player",
    onPacket: function (e) {
        if (mc.thePlayer && !mc.thePlayer.isOnLadder() && !mc.thePlayer.isInWater() && (packet = e.getPacket()) instanceof C03PacketPlayer) {
            if (packet.onGround) catchPackets && (catchPackets = false, packets.forEach(function (p) mc.getNetHandler().addToSendQueue(p)), packets = []);
            else if (catchPackets = catchPackets || !isAboveGround()) {
                (packet.onGround = mc.thePlayer.fallDistance > 3.3) && (mc.thePlayer.fallDistance = 0);
                packets.push(packet); e.cancelEvent();
            }
        }
    }
}

function isAboveGround() {
    for (y = 0; (y -= 0.125) >= -3.25;) if (!mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0, y, 0)).isEmpty()) return true
}

var packets = [], catchPackets;