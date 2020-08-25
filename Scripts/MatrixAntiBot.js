///api_version=2
(script = registerScript({
    name: "MatrixAntiBot",
    authors: ["CzechHek"],
    version: "2.2"
})).import("Core.lib");

module = {
    category: "Combat",
    onPacket: function (e) {
        (p = e.getPacket()) instanceof S38PacketPlayerListItem && p.getAction() == "ADD_PLAYER" && (name = p.getEntries().get(0).getProfile().getName()).length > 2 && mc.getNetHandler().getPlayerInfo(name) && (print("§2§lRemoved a bot§a:", name), e.cancelEvent());
    }
}