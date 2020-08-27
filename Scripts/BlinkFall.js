///api_version=2
(script = registerScript({
    name: "BlinkFall",
    authors: ["CzechHek"],
    version: "3.4"
})).import("Core.lib");

module = {
    category: "Movement",
    values: [maxfalltime = value.createInteger("MaxFallTime", 1500, 0, 10000), nofall = value.createBoolean("NoFall", true), maxpackets = value.createInteger("MaxPackets", 100, 1, 100)],
    onPacket: function (e) {
        if (catchPackets && e.getPacket() instanceof C03PacketPlayer) {
            if (!sendPackets) {
                e.cancelEvent(); packet = e.getPacket();
                packet.onGround ? (sendPackets = mc.thePlayer.posY != lastPos[1]) : (nofall.get() && (packet.onGround = mc.thePlayer.fallDistance > 3) && (mc.thePlayer.fallDistance = 0));
                packets.push(packet);
            } else !packets.includes(e.getPacket()) && e.cancelEvent();
        }
    },
    onMove: function (e) {
        if (!catchPackets) {
            if (!ScaffoldModule.state && !TowerModule.state) {
                yaw = MovementUtils.getDirection();
                mc.thePlayer.onGround && (lastPos = [mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ]);
                if (isMovingHorizontally() && mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(-Math.sin(yaw) * e.getX(), -2, Math.cos(yaw) * e.getZ()).expand(0, 2, 0)).isEmpty())
                    catchPackets = !timer.reset();
            }
        } else {
            if (timer.hasTimePassed(maxfalltime.get()) || sendPackets || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater()) {
                if (sendPackets || mc.thePlayer.isOnLadder() || mc.thePlayer.isInWater()) {
                    sendPackets = true;
                    for (i = -1; (i++ < maxpackets.get()) && (i < packets.length);) mc.getNetHandler().addToSendQueue(packets[i]);
                    packets.splice(0, maxpackets.get());
                    packets.length ? (e.zeroXZ(), e.setY(-0.078)) : (sendPackets = false);
                } else
                    mc.thePlayer.setPositionAndUpdate(lastPos[0], lastPos[1], lastPos[2]),
                    e.zeroXZ(), mc.thePlayer.motionX = mc.thePlayer.motionZ = 0,
                    packets = [];
                catchPackets = packets.length;
            }
        }
    }
}

var packets = [], timer = new MSTimer(), catchPackets, lastPos = [], sendPackets = false;