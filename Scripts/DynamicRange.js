///api_version=2
(script = registerScript({
    name: "DynamicRange",
    authors: ["CzechHek"],
    version: "2.0"
})).import("Core.lib");

module = {
    category: "Combat",
    description: "Changes KillAura range dynamically.",
    values: [
        changeon = value.createList("ChangeOn", ["Attack", "Update"], "Attack"),
        minstillrange = new (Java.extend(FloatValue)) ("MinStillRange", 3, 3, 8) {onChanged: function (o, n) {n > maxstillrange.get() && minstillrange.set(maxstillrange.get())}},
        maxstillrange = new (Java.extend(FloatValue)) ("MaxStillRange", 3.2, 3, 8) {onChanged: function (o, n) {n < minstillrange.get() && maxstillrange.set(minstillrange.get())}},
        minwalkingrange = new (Java.extend(FloatValue)) ("MinWalkingRange", 3.4, 3, 8) {onChanged: function (o, n) {n > maxwalkingrange.get() && minwalkingrange.set(maxwalkingrange.get())}},
        maxwalkingrange = new (Java.extend(FloatValue)) ("MaxWalkingRange", 3.6, 3, 8) {onChanged: function (o, n) {n < minwalkingrange.get() && maxwalkingrange.set(minwalkingrange.get())}},
        minrunningrange = new (Java.extend(FloatValue)) ("MinRunningRange", 3.7, 3, 8) {onChanged: function (o, n) {n > maxrunningrange.get() && minrunningrange.set(maxrunningrange.get())}},
        maxrunningrange = new (Java.extend(FloatValue)) ("MaxRunningRange", 3.9, 3, 8) {onChanged: function (o, n) {n < minrunningrange.get() && maxrunningrange.set(minrunningrange.get())}}
    ],
    onUpdate: function () {
        changeon.get() == "Update" && randomizeRange();
    },
    onAttack: function () {
        changeon.get() == "Attack" && randomizeRange();
    },
    onLoad: function () {
        rangeValue = KillAuraModule.getValue("Range");
    }
}

function randomizeRange() rangeValue.set(rand(isMovingHorizontally() ? mc.thePlayer.isSprinting() ? [minrunningrange.get(), maxrunningrange.get()] : [minwalkingrange.get(), maxwalkingrange.get()] : [minstillrange.get(), maxstillrange.get()]));