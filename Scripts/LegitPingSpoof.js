///api_version=2
(script = registerScript({
    name: "LegitPingSpoof",
    authors: ["CzechHek"],
    version: "1.2"
})).import("Core.lib");

module = {
    category: "Player",
    description: "Delays client packets to simulate high ping.",
    values: ping = value.createInteger("Ping", 1000, 0, 5000),
    onPacket: function (e) {
        if (e.getPacket().class.simpleName.startsWith("C") && !(e.getPacket() instanceof C0BPacketEntityAction) && !(e.getPacket() instanceof C13PacketPlayerAbilities) && e.getPacket() != sentPacket) e.cancelEvent(), timeout(ping.get(), function () mc.getNetHandler().addToSendQueue(sentPacket = e.getPacket()));
    }
}

var sentPacket;