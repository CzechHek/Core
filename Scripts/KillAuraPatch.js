///api_version=2
(script = registerScript({
    name: "KillAuraPatch",
    authors: ["CzechHek"],
    version: "2.0"
})).import("Core.lib");

list = [
    rotationspatch = new (Java.extend(BoolValue)) ("RotationsPatch", true) {onChanged: function () updateValues()},
    gcdsensitivity = value.createInteger("GCDSensitivity", mc.gameSettings.mouseSensitivity / 0.005, 0, 200),

    autoblockpatch = new (Java.extend(BoolValue)) ("AutoBlockPatch", true) {onChanged: function () updateValues()},
    maxrange = value.createFloat("MaxRange", 3.5, 3, 8),
    itemcheck = value.createBoolean("ItemCheck", true),

    facingcheck = new (Java.extend(BoolValue)) ("FacingCheck", true) {onChanged: function () updateValues()},
    toleration = value.createFloat("Toleration", 0, 0, 2),

    dynamicrange = new (Java.extend(BoolValue)) ("DynamicRange", true) {onChanged: function () updateValues()},
    changeon = value.createList("ChangeOn", ["Attack", "Update"], "Attack"),
    minstillrange = new (Java.extend(FloatValue)) ("MinStillRange", 3, 3, 8) {onChanged: function (o, n) n > maxstillrange.get() && minstillrange.set(maxstillrange.get())},
    maxstillrange = new (Java.extend(FloatValue)) ("MaxStillRange", 3.2, 3, 8) {onChanged: function (o, n) n < minstillrange.get() && maxstillrange.set(minstillrange.get())},
    minwalkingrange = new (Java.extend(FloatValue)) ("MinWalkingRange", 3.4, 3, 8) {onChanged: function (o, n) n > maxwalkingrange.get() && minwalkingrange.set(maxwalkingrange.get())},
    maxwalkingrange = new (Java.extend(FloatValue)) ("MaxWalkingRange", 3.6, 3, 8) {onChanged: function (o, n) n < minwalkingrange.get() && maxwalkingrange.set(minwalkingrange.get())},
    minrunningrange = new (Java.extend(FloatValue)) ("MinRunningRange", 3.7, 3, 8) {onChanged: function (o, n) n > maxrunningrange.get() && minrunningrange.set(maxrunningrange.get())},
    maxrunningrange = new (Java.extend(FloatValue)) ("MaxRunningRange", 3.9, 3, 8) {onChanged: function (o, n) n < minrunningrange.get() && maxrunningrange.set(minrunningrange.get())},
    minjumpingrange = new (Java.extend(FloatValue)) ("MinJumpingRange", 3.7, 3, 8) {onChanged: function (o, n) n > maxjumpingrange.get() && minjumpingrange.set(maxjumpingrange.get())},
    maxjumpingrange = new (Java.extend(FloatValue)) ("MaxJumpingRange", 3.9, 3, 8) {onChanged: function (o, n) n < minjumpingrange.get() && maxjumpingrange.set(minjumpingrange.get())}
]

module = {
    category: "Patches",
    description: "KillAura addon that adds smart AutoBlock, forced GCD sensitivity and dynamic KillAura range.",
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
            VALUE_FIELD.set(autoBlockValue, shouldBlock);
        }

        dynamicrange.get() && changeon.get() == "Update" && updateRange();
    },
    onAttack: function () dynamicrange.get() && changeon.get() == "Attack" && updateRange(),
    onLoad: function () {
        autoBlockValue = KillAuraModule.getValue("AutoBlock");
        rangeValue = KillAuraModule.getValue("Range");
    },
    onEnable: function () prevValues = [autoBlockValue.get(), rangeValue.get()],
    onDisable: function () {
        autoBlockValue.set(prevValues[0]);
        rangeValue.set(prevValues[1]);
    },
    onClickGuiOpen: function () updateValues(),
    onClickGuiClosed: function () updateValues(true)
}

VALUE_FIELD = getField(Value, "value");
Float = Java.type("java.lang.Float");

function updateValues(closing) setValues(KillAuraPatchModule, closing ? list : (rotationspatch.get() ? [rotationspatch, gcdsensitivity] : [rotationspatch]).concat(autoblockpatch.get() ? [autoblockpatch, maxrange, itemcheck].concat(facingcheck.get() ? [facingcheck, toleration] : facingcheck) : autoblockpatch).concat(dynamicrange.get() ? [dynamicrange, changeon, minstillrange, maxstillrange, minwalkingrange, maxwalkingrange, minrunningrange, maxrunningrange, minjumpingrange, maxjumpingrange] : dynamicrange));

function updateRange() VALUE_FIELD.set(rangeValue, new Float(rand(isInputVertically(true) ? [minjumpingrange.get(), maxjumpingrange.get()] : isMovingHorizontally() ? mc.thePlayer.isSprinting() ? [minrunningrange.get(), maxrunningrange.get()] : [minwalkingrange.get(), maxwalkingrange.get()] : [minstillrange.get(), maxstillrange.get()])));