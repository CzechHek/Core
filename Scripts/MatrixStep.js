///api_version=2
(script = registerScript({
    name: "MatrixStep",
    version: "2.0",
    authors: ["CzechHek", "Neogardo"]
})).import("Core.lib");

module = {
    description: "Step bypassing Matrix.",
    category: "Movement",
    values: predict = value.createFloat("Predict", 0.45, 0.0, 1.0),
    onPacket: function (e) {
        if (isStepping) {
            var packet = e.getPacket();
            if (packet instanceof C03PacketPlayer) {
                packet.onGround = true;
            }
        }
    },
    onUpdate: function () {
        isStepping = canStep(1, predict.get()) && isMovingHorizontally() && !mc.thePlayer.fallDistance;
        if (isStepping) {
            mc.thePlayer.onGround = true;
            mc.thePlayer.motionY = 0;
            mc.thePlayer.jump();
            isStepping = false
        }
    }
}

var isStepping;