///api_version=2
(script = registerScript({
    name: "MatrixStep",
    version: "2.2",
    authors: ["CzechHek", "Neogardo"]
})).import("Core.lib");

module = {
    description: "Step bypassing Matrix.",
    category: "Movement",
    values: [
        predict = value.createFloat("Predict", 0.45, 0.0, 1.0),
        timer = value.createFloat("Timer", 1, 0.1, 3)
    ],
    onPacket: function (e) {
        if (isStepping) {
            var packet = e.getPacket();
            if (packet instanceof C03PacketPlayer) packet.onGround = true;
        }
    },
    onUpdate: function () {
        if (canStep(1, predict.get()) && isMovingHorizontally() && !(mc.thePlayer.fallDistance || mc.thePlayer.isInWater() || mc.thePlayer.isOnLadder())) isStepping = mc.timer.timerSpeed = timer.get();
        else {
            mc.timer.timerSpeed = 1;
            isStepping = false;
        }
        if (isStepping) {
            mc.thePlayer.onGround = true;
            mc.thePlayer.motionY = 0;
            mc.thePlayer.jump();
            isStepping = false
        } 
    }
}

var isStepping = false;