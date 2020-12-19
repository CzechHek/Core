///api_version=2
(script = registerScript({
    name: "KillAuraPatch",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

list = [
    rotationspatch = new (Java.extend(BoolValue)) ("RotationsPatch", true) {onChanged: function (o, n) {updateValues()}},
    gcdsensitivity = value.createInteger("GCDSensitivity", mc.gameSettings.mouseSensitivity / 0.005, 0, 200),
    autoblockpatch = new (Java.extend(BoolValue)) ("AutoBlockPatch", true) {onChanged: function (o, n) {updateValues()}},
    maxrange = value.createFloat("MaxRange", 3.5, 3, 8),
    itemcheck = value.createBoolean("ItemCheck", true),
    facingcheck = new (Java.extend(BoolValue)) ("FacingCheck", true) {onChanged: function (o, n) {updateValues()}},
    toleration = value.createFloat("Toleration", 0, 0, 2)
]

module = {
    category: "Patches",
    description: "KillAura addon that adds smart AutoBlock and forced GCD sensitivity.",
    values: list,
    onPacket: function (e) {
        if (rotationspatch.get() && KillAuraModule.target && e.getPacket() instanceof C03PacketPlayer && e.getPacket().getRotating()) {
            p = e.getPacket();
            m = 0.005 * gcdsensitivity.get();
            f = m * 0.6 + 0.2;
            gcd = m * m * m * 1.2;
            p.pitch -= p.pitch % gcd;
            p.yaw -= p.yaw % gcd;
        }
    },
    onUpdate: function () {
        if (autoblockpatch.get() && (target = KillAuraModule.target)) {
            shouldBlock = false;
            if (!itemcheck.get() || (target.getHeldItem() && (item = target.getHeldItem().getItem()) && (item instanceof ItemSword || item instanceof ItemAxe))) {
                if (PlayerExtensionKt.getDistanceToEntityBox(target, mc.thePlayer) < maxrange.get()) {
                    if (facingcheck.get()) {
                        if (target.rayTrace(maxrange.get(), 1).typeOfHit == "MISS") {
                            eyesVec = target.getPositionEyes(1);
                            lookVec = target.getLook(1);
                            pointingVec = eyesVec.addVector(lookVec.xCoord * maxrange.get(), lookVec.yCoord * maxrange.get(), lookVec.zCoord * maxrange.get())
                            border = mc.thePlayer.getCollisionBorderSize() + toleration.get();
                            bb = mc.thePlayer.getEntityBoundingBox().expand(border, border, border);
                            shouldBlock = !!bb.calculateIntercept(eyesVec, pointingVec) || bb.intersectsWith(target.getEntityBoundingBox());
                        }
                    } else shouldBlock = true;
                }
            }
            autoBlockValue.set(shouldBlock);
        }
    },
    onLoad: function () {
        autoBlockValue = KillAuraModule.getValue("AutoBlock");
    },
    onEnable: function () {
        prevState = autoBlockValue.get();
    },
    onDisable: function () {
        autoBlockValue.set(prevState);
    },
    onClickGuiOpen: function () {
        updateValues();
    },
    onClickGuiClosed: function () {
        updateValues(true);
    }
}

function updateValues(closing) setValues(KillAuraPatchModule, closing ? list : (rotationspatch.get() ? [rotationspatch, gcdsensitivity] : [rotationspatch]).concat(autoblockpatch.get() ? [autoblockpatch, maxrange, itemcheck].concat(facingcheck.get() ? [facingcheck, toleration] : facingcheck) : autoblockpatch));