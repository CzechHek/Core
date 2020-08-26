///api_version=2
(script = registerScript({
    name: "MatrixAntiBot",
    authors: ["CzechHek"],
    version: "2.4"
})).import("Core.lib");

module = {
    category: "Combat",
    onPacket: function (e) {
        e.getPacket() instanceof S38PacketPlayerListItem && e.getPacket().getAction() == "ADD_PLAYER" && (name = (info = e.getPacket().getEntries().get(0)).getProfile().getName()).length > 2 && name != mc.thePlayer.getName() && mc.getNetHandler().getPlayerInfo(name) && info.getPing() != 1 && (print("§2§lRemoved a bot§a:", name), e.cancelEvent());
    }
}