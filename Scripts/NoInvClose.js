///api_version=2
(script = registerScript({
	name: "NoInvClose",
	authors: ["why don't#0001"],
	version: "1.0"
})).import("Core.lib");

module = {
	category: "Misc",
	description: "Simple module that prevents the server from closing your inventory.",
	onPacket: function (event) {
		if (event.getPacket() instanceof S2EPacketCloseWindow && mc.currentScreen instanceof GuiInventory) {
			event.cancelEvent();
		}
	}
}

