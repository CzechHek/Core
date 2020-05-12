var target = null; //EntityLivingBase?
list = [
    onlyPlayer = value.createBoolean("OnlyPlayer", true);
    delay = value.createInteger("Delay", 1000, 0, 5000),
]

module = {
    name: "AutoL",
    description: "Automatically insults the player you've killed.",
    category: "Player",
    version: 2.1,
    author: "Tsikyng Kirisame, CzechHek",
    values: list,
    onAttack: function (event) {
        var entity = event.getTargetEntity();
        if (onlyPlayer.get() ? entity instanceof EntityPlayer : entity instanceof EntityLivingBase) 
            target = entity;
    },
    onUpdate: function () {// I don't know if xor operator works to boolean in JavaScript, I know it's avilable in Java.
        if (target && target.isEntityAlive() ^ mc.thePlayer.isEntityAlive() && (target instanceof EntityPlayer || !onlyPlayer.get()))
            if (msTimer.hasTimePassed(delay.get())) {//I'll add a new mode after a while
                mc.thePlayer.sendChatMessage("@L " + target.getName());
                msTimer.reset();
                target = null;
            }
        }
    }
    onLoad: function () {
        msTimer = new MSTimer();
    }
}

EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer");
EntityLivingBase = Java.type("net.minecraft.entity.EntityLivingBase");
MSTimer = Java.type('net.ccbluex.liquidbounce.utils.timer.MSTimer');

script.import("Core.lib");
