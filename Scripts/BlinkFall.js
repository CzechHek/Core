///api_version=2
(script = registerScript({
    name: "BlinkFall",
    authors: ["CzechHek"],
    version: "4.3"
})).import("Core.lib");

module = {
    category: "Movement",
    values: [
        maxfalltime = value.createInteger("MaxFallTime", 1500, 0, 10000),
        nofall = value.createBoolean("NoFall", true),
        packetmode = value.createList("LandingMode", ["SimulateFall", "Instant"], "Instant"), simulatedtimer = value.createFloat("SimulatedTimer", 1, 1, 10)
    ],
    onPacket: function (e) {
        if (catchPackets && e.getPacket() instanceof C03PacketPlayer) {
            if (!sendPackets) {
                e.cancelEvent(); packet = e.getPacket();
                packet.onGround ? (sendPackets = wasInAir) : (wasInAir = true, nofall.get() && (packet.onGround = mc.thePlayer.fallDistance > 3) && (mc.thePlayer.fallDistance = 0));
                !packets.length && (time = System.currentTimeMillis());
                packets.push([packet, packetmode.get() == "SimulatedDelay" ? (System.currentTimeMillis() - time) / simulatedtimer.get() : 0]);
            } else e.getPacket() != lastPacket && e.cancelEvent();
        }
    },
    onMove: function (e) {
        if (!catchPackets) {
            if (!ScaffoldModule.state && !TowerModule.state && !mc.thePlayer.isSneaking() && !mc.thePlayer.isOnLadder() && !mc.thePlayer.isInWater()) {
                wasInAir = false;
                yaw = MovementUtils.getDirection();
                mc.thePlayer.onGround && (lastPos = [mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ]);
                if (isMovingHorizontally() && !isSafe(e))
                    catchPackets = !timer.reset(), print("catching");
            }
        } else {
            if (timer.hasTimePassed(maxfalltime.get()) || sendPackets || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater()) {
                if (sendPackets || isSending || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater()) {
                    if (!isSending) {
                        isSending = true;
                        packets.forEach(function (p, i) {timeout(p[1], function () {mc.getNetHandler().addToSendQueue(lastPacket = p[0]); i == packets.length - 1 && (packets = [])})});
                    }
                    packets.length ? (e.zeroXZ(), e.setY(-0.078)) : (sendPackets = isSending = false);
                } else {
                    mc.thePlayer.setPositionAndUpdate(lastPos[0], lastPos[1], lastPos[2]);
                    e.zeroXZ(); mc.thePlayer.motionX = mc.thePlayer.motionZ = 0;
                    packets = []; print("tp back");
                }
                !(catchPackets = packets.length) && print("end");
            }
        }
    }
}

function isSafe(e) {
    blockPos = new BlockPos(mc.thePlayer.posX + e.getX(), mc.thePlayer.posY + 2, mc.thePlayer.posZ + e.getZ());
    for (i = -1; i++ < 6;) if (!mc.theWorld.isAirBlock(blockPos.down(i))) return true
}

var packets = [], timer = new MSTimer(), catchPackets, lastPos = [], sendPackets = false, System = Java.type("java.lang.System"), time, isSending, lastPacket, wasInAir;