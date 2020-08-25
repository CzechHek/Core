///api_version=2
(script = registerScript({
    name: "ScaffoldFix",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    category: "World",
    description: "Fixes Scaffold AutoBlock detections.",
    onPacket: function (e) {
        (p = e.getPacket()) instanceof C09PacketHeldItemChange && p.getSlotId() == prevSlot ? e.cancelEvent() : (prevSlot = p.getSlotId());
    }
}

prevSlot = -1;