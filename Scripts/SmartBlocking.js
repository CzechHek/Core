///api_version=2
(script = registerScript({
    name: "SmartBlocking",
    authors: ["CzechHek"],
    version: "1.1"
})).import("Core.lib");

list = [
    maxrange = value.createFloat("MaxRange", 3.5, 3, 8),
    helditem = value.createBoolean("HeldItem", true),
    facing = new (Java.extend(BoolValue)) ("Facing", true) {
        onChanged: function (o, n) {
            updateValues();
        }
    },
    expand = value.createFloat("ExpandHitbox", 0, 0, 2)
]

module = {
    category: "Combat",
    description: "KillAura Addon, adds multiple checks for autoblocking.",
    values: list,
    onUpdate: function () {
        if (target = KillAuraModule.target) {
            shouldBlock = false;
            if (!helditem.get() || (target.getHeldItem() && (item = target.getHeldItem().getItem()) && (item instanceof ItemSword || item instanceof ItemAxe))) {
                if (PlayerExtensionKt.getDistanceToEntityBox(target, mc.thePlayer) < maxrange.get()) {
                    if (facing.get()) {
                        if (target.rayTrace(maxrange.get(), 1).typeOfHit == "MISS") {
                            eyesVec = target.getPositionEyes(1);
                            lookVec = target.getLook(1);
                            pointingVec = eyesVec.addVector(lookVec.xCoord * maxrange.get(), lookVec.yCoord * maxrange.get(), lookVec.zCoord * maxrange.get())
                            border = mc.thePlayer.getCollisionBorderSize() + expand.get();
                            bb = mc.thePlayer.getEntityBoundingBox().expand(border, border, border);
                            shouldBlock = !!bb.calculateIntercept(eyesVec, pointingVec);
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

function updateValues(closing) setValues(SmartBlockingModule, list.slice(0, closing || facing.get() ? 4 : 3));