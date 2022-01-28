///api_version=2
(script = registerScript({
    name: "ArtificialEvents",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    onBlockBB: function (e) {
        var x = e.getX(),
            y = e.getY(),
            z = e.getZ(),
            block = e.getBlock(),
            bb = e.getBoundingBox();
        
        e.setBoundingBox(bb.expand(0, 0.5, 0));
    },
    onClientShutdown: function () {},
    onEntityMovement: function (e) {
        var entity = e.getMovedEntity();
    },
    onPushOut: function (e) {
        e.cancelEvent()
    },
    onRenderEntity: function (e) {
        var entity = e.getEntity(),
            x = e.getX(),
            y = e.getY(),
            z = e.getZ(),
            yaw = e.getEntityYaw(),
            partialTicks = e.getPartialTicks();
    },
    onScreen: function (e) {
        var screen = e.getGuiScreen();
    },
    onText: function (e) {
        if (mc.thePlayer) {
            var text = e.getText();
            e.setText(text.replace(mc.thePlayer.getName(), "axolotlus"));   
        }
    },
    onTick: function () {}
}
