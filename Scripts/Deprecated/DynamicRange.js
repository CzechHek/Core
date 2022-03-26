///api_version=2
(script = registerScript({
    name: "DynamicRange",
    authors: ["CzechHek"],
    version: "2.1"
})).import("Core.lib");

module = {
    category: "Combat",
    description: "Changes KillAura range dynamically.",
    values: [
        changeon = value.createList("ChangeOn", ["Attack", "Update"], "Attack"),
        minstillrange = new (Java.extend(FloatValue)) ("MinStillRange", 3, 3, 8) {onChanged: function (o, n) n > maxstillrange.get() && minstillrange.set(maxstillrange.get())},
        maxstillrange = new (Java.extend(FloatValue)) ("MaxStillRange", 3.2, 3, 8) {onChanged: function (o, n) n < minstillrange.get() && maxstillrange.set(minstillrange.get())},
        minwalkingrange = new (Java.extend(FloatValue)) ("MinWalkingRange", 3.4, 3, 8) {onChanged: function (o, n) n > maxwalkingrange.get() && minwalkingrange.set(maxwalkingrange.get())},
        maxwalkingrange = new (Java.extend(FloatValue)) ("MaxWalkingRange", 3.6, 3, 8) {onChanged: function (o, n) n < minwalkingrange.get() && maxwalkingrange.set(minwalkingrange.get())},
        minrunningrange = new (Java.extend(FloatValue)) ("MinRunningRange", 3.7, 3, 8) {onChanged: function (o, n) n > maxrunningrange.get() && minrunningrange.set(maxrunningrange.get())},
        maxrunningrange = new (Java.extend(FloatValue)) ("MaxRunningRange", 3.9, 3, 8) {onChanged: function (o, n) n < minrunningrange.get() && maxrunningrange.set(minrunningrange.get())},
        minjumpingrange = new (Java.extend(FloatValue)) ("MinJumpingRange", 3.7, 3, 8) {onChanged: function (o, n) n > maxjumpingrange.get() && minjumpingrange.set(maxjumpingrange.get())},
        maxjumpingrange = new (Java.extend(FloatValue)) ("MaxJumpingRange", 3.9, 3, 8) {onChanged: function (o, n) n < minjumpingrange.get() && maxjumpingrange.set(minjumpingrange.get())}
    ],
    onUpdate: function () {
        changeon.get() == "Update" && updateRange();
    },
    onAttack: function () {
        changeon.get() == "Attack" && updateRange();
    },
    onLoad: function () {
        rangeValue = KillAuraModule.getValue("Range");
    }
}

VALUE_FIELD = getField(Value, "value");
Float = Java.type("java.lang.Float");

function updateRange() VALUE_FIELD.set(rangeValue, new Float(rand(isInputVertically(true) ? [minjumpingrange.get(), maxjumpingrange.get()] : isMovingHorizontally() ? mc.thePlayer.isSprinting() ? [minrunningrange.get(), maxrunningrange.get()] : [minwalkingrange.get(), maxwalkingrange.get()] : [minstillrange.get(), maxstillrange.get()])));