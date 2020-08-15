///api_version=2
(script = registerScript({
    name: "SuperKnock",
    version: "1.2",
    authors: ["Beast aka turtl aka shiv3r aka n3xt aka polak aka idk what names i had also"]
})).import("Core.lib");

general_values_array = [
    mode = value.createList("Mode", ["Packet","PacketW-Tap", "W-Tap"], "Packet"),
    hurtTime = value.createInteger("HurtTime", 10, 1, 10),
    tickDelay = value.createInteger("TickDelay", 0, 0, 20),
    minDelay = value.createInteger("MinDelay", 50, 1, 1000),
    maxDelay = value.createInteger("MaxDelay", 50, 1, 1000),
    minMultiplier = value.createFloat("MinMultiplier", 1, 1, 3),
    maxMultiplier = value.createFloat("MaxMultiplier", 1, 1, 3),
    noSprint = value.createBoolean("NoSprint", false),
]

not_for_wtap = [ 
    noMove = value.createBoolean("NoMove", false),
]

module = {
    category: "Combat",
    description: "Increases knockback you deal",
    values: general_values_array,
    onUpdate: function () {
        ticks = ticks && ticks-1;
        current_values = general_values_array.concat(mode.get() != "W-Tap" ? not_for_wtap : []);
        setValues(SuperKnockModule, current_values);
    },
    onPacket: function (e) {
        if (e.getPacket() instanceof C02PacketUseEntity && e.getPacket().getAction() == C02PacketUseEntity.Action.ATTACK) {
            entity = e.getPacket().getEntityFromWorld(mc.theWorld);
            sprint = mc.thePlayer.isSprinting(), moving = isMovingHorizontally();
            m = mode.get();
            if (!entity || entity.hurtTime > hurtTime.get() || ticks || !sprint && !noSprint.get() && moving || !moving && !noMove.get()) return;
            if (m != "W-Tap") {
                m == "Packet" ? sprint ? mc.thePlayer.sendQueue.addToSendQueue(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.STOP_SPRINTING)) : m == "PacketW-Tap" ? mc.thePlayer.sendQueue.addToSendQueue(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.START_SPRINTING)) : sprint ? mc.thePlayer.setSprinting(false) : mc.thePlayer.setSprinting(true) : {};
                sprint && m == "Packet" ? mc.thePlayer.sendQueue.addToSendQueue(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.START_SPRINTING)) : m == "PacketW-Tap" && mc.thePlayer.setSprinting(true);
                
                timeout(rand(minDelay.get(), maxDelay.get()), function () {
                    m == "Packet" ? mc.thePlayer.sendQueue.addToSendQueue(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.STOP_SPRINTING)) : m == "PacketW-Tap" && mc.thePlayer.setSprinting(false);
                });

                sprint && timeout(rand(minDelay.get(), maxDelay.get()) * rand(minMultiplier.get(), maxMultiplier.get()), function () {
                    m == "Packet" ? mc.thePlayer.sendQueue.addToSendQueue(new C0BPacketEntityAction(mc.thePlayer, C0BPacketEntityAction.Action.START_SPRINTING)) : m == "PacketW-Tap" && mc.thePlayer.setSprinting(true);
                });
            } else {
                !sprint && mc.thePlayer.setSprinting(true);
                timeout(rand(minDelay.get(), maxDelay.get()), function () {
                    mc.gameSettings.keyBindForward.pressed = false;
                });
                timeout(rand(minDelay.get(), maxDelay.get()) * rand(minMultiplier.get(), maxMultiplier.get()), function () {
                    mc.gameSettings.keyBindForward.pressed = Keyboard.isKeyDown(mc.gameSettings.keyBindForward.getKeyCode());
                    mc.thePlayer.setSprinting(sprint);
                });
            }

            ticks = tickDelay.get();
        }
    }
}

var ticks, current_values;
