///api_version=2
(script = registerScript({
    name: "MatrixAntiBot",
    authors: ["CzechHek"],
    version: "3.1"
})).import("Core.lib");

module = {
    category: "Combat",
    onPacket: function (e) {
        mc.thePlayer && mc.thePlayer.ticksExisted > 100 && e.getPacket() instanceof S38PacketPlayerListItem && e.getPacket().getAction() == "ADD_PLAYER" && e.getPacket().getEntries().size() == 1 && e.getPacket().getEntries().get(0).getPing() && (print("§2§lRemoved a bot§a:", e.getPacket().getEntries().get(0).getProfile().getName()), e.cancelEvent());
    }
}