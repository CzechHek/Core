///api_version=2
(script = registerScript({
    name: "ScaffoldPatch",
    authors: ["CzechHek"],
    version: "1.3"
})).import("Core.lib");

module = {
    category: "Patches",
    description: "Fixes Scaffold AutoBlock detections.",
    onPacket: function (e) {
        e.getPacket() instanceof C09PacketHeldItemChange && (e.getPacket().getSlotId() == prevSlot ? e.cancelEvent() : (prevSlot = e.getPacket().getSlotId()));
    }
}

prevSlot = -1;