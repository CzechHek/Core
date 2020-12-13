///api_version=2
(script = registerScript({
    name: "AlternativeBlink",
    authors: ["CCBlueX", "CzechHek"],
    version: "1.1"
})).import("Core.lib");

module = {
    category: "Player",
    description: "Blink by CCBlueX, recoded in ScriptAPI, without visuals.",
    values: [
        pulse = value.createBoolean("Pulse", false),
        pulsedelay = value.createInteger("PulseDelay", 1000, 500, 5000)
    ],
    onEnable: function () {
        pulseTimer.reset();
    },
    onPacket: function (e) {
        if (mc.thePlayer) {
            p = e.getPacket();
            if (p instanceof C03PacketPlayer) e.cancelEvent();
            if (p instanceof C04PacketPlayerPosition || p instanceof C06PacketPlayerPosLook || p instanceof C08PacketPlayerBlockPlacement || p instanceof C0APacketAnimation || p instanceof C0BPacketEntityAction || p instanceof C02PacketUseEntity) {
                e.cancelEvent();
                packets.add(p);
            }
        }
    },
    onUpdate: function () {
        if (pulse.get() && pulseTimer.hasTimePassed(pulsedelay.get())) blink(), pulseTimer.reset();
        AlternativeBlinkModule.tag = packets.size();
    },
    onDisable: function () {
        blink();
    }
}

var pulseTimer = new MSTimer(), packets = new (Java.type("java.util.concurrent.LinkedBlockingQueue"))();

function blink() {
    if (mc.thePlayer) while (!packets.isEmpty()) sendPacket(packets.take());
}