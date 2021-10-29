///api_version=2
(script = registerScript({
    name: "NoBooks",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    description: "Prevents server from opening books.",
    category: "Render",
    onPacket: function (e) {
        if (e.getPacket() instanceof S3FPacketCustomPayload && e.getPacket().getChannelName() == "MC|BOpen") e.cancelEvent();
    }
}
