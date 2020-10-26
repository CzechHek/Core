///api_version=2
(script = registerScript({
    name: "DynamicRange",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    category: "Combat",
    description: "Changes KillAura range dynamically.",
    values: [
        stillrange = value.createFloat("StillRange", 3.1, 3, 8),
        walkingrange = value.createFloat("WalkingRange", 3.5, 3, 8),
        runningrange = value.createFloat("RunningRange", 3.8, 3, 8)
    ],
    onUpdate: function () {
        rangeValue.set((isMovingHorizontally() ? mc.thePlayer.isSprinting() ? runningrange : walkingrange : stillrange).get());
    },
    onLoad: function () {
        rangeValue = KillAuraModule.getValue("Range");
    }
}