///api_version=2
(script = registerScript({
	name: "No Inventory Close",
	authors: ["Asutoboki-kun#7207 - Have fun"],
	version: "1.0.0"
})).import("Core.lib");
//why did I even make this useless thing
module = {
	name: "NoInvClose",
	category: "Misc",
	description: "Simple module that prevents the server from closing your inventory.",
	onPacket: function(event) {
		if (event.getPacket() instanceof S2EPacketCloseWindow && mc.currentScreen instanceof GuiInventory) {
			event.cancelEvent();
		}
	}
}

