///api_version=2
(script = registerScript({
    name: "MatrixAntiBot",
    authors: ["CzechHek"],
    version: "3.31"
})).import("Core.lib");

module = {
    category: "Combat",
    onPacket: function (e) {
        if (mc.thePlayer)
            if (e.getPacket() instanceof S38PacketPlayerListItem && e.getPacket().getAction() == "ADD_PLAYER") {
                name = (info = e.getPacket().getEntries().get(0)).getProfile().getName(); ping = info.getPing();
                if (!wasAdded) wasAdded = name == mc.thePlayer.getName();
                else if (!mc.thePlayer.isSpectator() && !mc.thePlayer.capabilities.allowFlying && ping && info.getGameMode() != "NOT_SET") e.cancelEvent(), print("§2§lRemoved a bot§a:", name);
            } else if (e.getPacket() instanceof S41PacketServerDifficulty) wasAdded = false;
    }
}

updated = wasAdded = false;