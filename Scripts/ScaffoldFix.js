///api_version=2
(script = registerScript({
    name: "ScaffoldFix",
    authors: ["CzechHek"],
    version: "1.2"
})).import("Core.lib");

module = {
    category: "World",
    description: "Fixes Scaffold AutoBlock detections.",
    onPacket: function (e) {
        e.getPacket() instanceof C09PacketHeldItemChange && (e.getPacket().getSlotId() == prevSlot ? e.cancelEvent() : (prevSlot = e.getPacket().getSlotId()));
    }
}

prevSlot = -1;