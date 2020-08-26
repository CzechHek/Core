///api_version=2
(script = registerScript({
    name: "MatrixAntiBot",
    authors: ["CzechHek"],
    version: "2.3"
})).import("Core.lib");

module = {
    category: "Combat",
    onPacket: function (e) {
        e.getPacket() instanceof S38PacketPlayerListItem && e.getPacket().getAction() == "ADD_PLAYER" && (name = e.getPacket().getEntries().get(0).getProfile().getName()).length > 2 && name != mc.thePlayer.getName() && mc.getNetHandler().getPlayerInfo(name) && (print("§2§lRemoved a bot§a:", name), e.cancelEvent());
    }
}