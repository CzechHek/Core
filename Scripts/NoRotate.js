///api_version=2
(script = registerScript({
    name: "NoRotate",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    category: "Misc",
    description: "NoRotate for any AntiCheat.",
    onPacket: function (e) {
        if (mc.thePlayer && e.getPacket() instanceof S08PacketPlayerPosLook) {
            yawField.set(e.getPacket(), mc.thePlayer.rotationYaw);
            pitchField.set(e.getPacket(), mc.thePlayer.rotationPitch);
        }
    }
}

yawField = getField(S08PacketPlayerPosLook, "field_148936_d");
pitchField = getField(S08PacketPlayerPosLook, "field_148937_e");