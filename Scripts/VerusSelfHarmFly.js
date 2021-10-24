///api_version=2
(script = registerScript({
    name: "VerusSelfHarmFly",
    authors: ["Arcane"],
    version: "2.2"
})).import("Core.lib");

var boostTicks = 0;

module = {
    category: "Movement",
    values: [
        boostMode = value.createList("BoostMode", ["None", "Static", "Gradual"], "Gradual"),
        boostTicksValue = value.createInteger("BoostTicks", 20, 1, 30),
        boostMotion = value.createFloat("BoostMotion", 9, 1, 9.87)
    ],
    onEnable: function() {
        boostTicks = 0;
        if (boostMode.get() != "None" && mc.theWorld.getCollidingBoundingBoxes(mc.thePlayer, mc.thePlayer.getEntityBoundingBox().offset(0, 3.0001, 0).expand(0, 0, 0)).isEmpty()) {
            mc.thePlayer.sendQueue.addToSendQueue(new C04PacketPlayerPosition(mc.thePlayer.posX, mc.thePlayer.posY + 3.0001, mc.thePlayer.posZ, false));
            mc.thePlayer.sendQueue.addToSendQueue(new C04PacketPlayerPosition(mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ, false));
            mc.thePlayer.sendQueue.addToSendQueue(new C04PacketPlayerPosition(mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ, true));
        }
        mc.thePlayer.setPosition(mc.thePlayer.posX, mc.thePlayer.posY + 0.42, mc.thePlayer.posZ);
    },
    onDisable: function() {
        if (boostTicks > 0) {
            mc.thePlayer.motionX = 0;
            mc.thePlayer.motionZ = 0;
        }
    },
    onUpdate: function() {
        mc.thePlayer.motionX = 0;
        mc.thePlayer.motionY = 0;
        mc.thePlayer.motionZ = 0;

        if (!boostTicks && mc.thePlayer.hurtTime > 0) {
            boostTicks = boostMode.get() != "None" ? boostTicksValue.get() : 0;
        }

        var motion;
        if (boostTicks > 0) {
            switch (boostMode.get()) {
                case "Static":
                    motion = boostMotion.get();
                    break;
                case "Gradual":
                    motion = boostTicks / boostTicksValue.get() * boostMotion.get();
                    break;
            }
            boostTicks--;
        } else {
            motion = 0.25;
        }

        MovementUtils.strafe(motion);
    },
    onPacket: function(event) {
        var packet = event.getPacket();
        if (packet instanceof C03PacketPlayer) {
            packet.onGround = true;
        }
    },
    onJump: function(event) {
        event.cancelEvent();
    }
}