///api_version=2
(script = registerScript({
    name: "AutoL",
    version: "2.21",
    authors: ["Tsikyng Kirisame", "CzechHek"]
})).import("Core.lib");

target = null; //EntityLivingBase?
list = [
    mode = value.createList("Mode", ["TargetHealth", "PacketChat"], "TargetHealth"),
    onlyPlayer = value.createBoolean("OnlyPlayer", true),
    delay = value.createInteger("Delay", 1000, 0, 5000),
    customPrefix = value.createBoolean("CustomPrefix", true),
    customSuffix = value.createBoolean("CustomSuffix", false),
    prefix = value.createText("Prefix", "@[Sakura]"),
    suffix = value.createText("Suffix", "come GitHub to see more code!"),
    //abuse = value.createBoolean("AbuseSuffix", true),
    //language = value.createList("AbuseLanguage", ["Chinese", "English"], "Chinese")
]

/**AutoL Update logs | kira~☆
 * v2.11 change parts settings check from 'if...else' to '? :'
 *       start to write change logs XD
 * v2.12 add more modes
 * v2.13 share abusing text with AutoAbuse module by importing AbuseUtils
 * v2.14 add Entity instanceof EntityPlayer check
 * v2.15 remake Huayuting mode, uses S02PacketChat 
 * v2.16 add English abuse text 
 * v2.17 change Huayuting check from find in last targets to find in the world's players 
 * v2.18 replace 'Mode' (HYT, Hypixel, Normal; to 3 kinds of prefixes) 
 *         with 'CheckMode' (TargetHealth, PacketChat; to 2 kinds of check modes);
 *       add delay setting by using namespace MSTimer from LiquidBounce
 *       change description
 * v2.19 recode, uses more simple code
 * v2.20 uses CzechHek's lib to remake 
**/

module = {//untested!
    description: "Automatically insults the player you've killed.",
    category: "Player",
    values: list,
    tag: mode.get(),
    /**
     * @returns message: String
     * @param entityLivingBase: EntityLivingBase!!
     */
    getMessage: function(entityLivingBase) {
        var part1 = customPrefix.get() ? prefix.get() : "";
        var part2 = entityLivingBase.getName();//entityLivingBase?.getName() ?? "";//idk if lb support this, I recommend to use this way to avoid NullPointerException
        var part3 = " L ";
        var part4 = customSuffix.get() ? suffix.get() : "";
        //var part5 = abuse.get() ? getAbuseText(language.get()) : "";
        return (part1 + part2 + part3 + part4).trim();
    },
    /**
     * @returns playerNames: Array<String>
     * @description get the players' names in the world.
     */
    getPlayerNames: function() {//idk if lb support these functions: map, forEach, filter, etc
        return mc.getNetHandler().getPlayerInfoMap().toArray().map(function(it) { it.getGameProfile().getName(); } ).filter(function(it) { it != mc.thePlayer.getName(); });
    },
    onAttack: function(event) {
        var entity = event.getTargetEntity();
        if (onlyPlayer.get() ? entity instanceof EntityPlayer : entity instanceof EntityLivingBase) 
            target = entity;
    },
    onUpdate: function() {// I don't know if xor operator works to boolean in JavaScript, I know it's avilable in Java.
        if (target && (target instanceof EntityPlayer || !onlyPlayer.get())) {
            if (mode.get() == "TargetHealth" && target.isEntityAlive() ^ mc.thePlayer.isEntityAlive() && msTimer.hasTimePassed(delay.get())) {
                mc.thePlayer.sendChatMessage(getMessage(target));
                msTimer.reset();
                target = null;
            }
        }
    },
    onPacket: function(event) {
        if (event.getPacket() instanceof S02PacketChat) {
            var s02Text = event.getPacket().getChatComponent().getUnformattedText();
            if (mode.get() == "PacketChat" && s02Text.match(mc.thePlayer.getName()) && msTimer.hasTimePassed(delay.get())) {
                getPlayerNames().forEach(function(name) {
                    if (s02Text.match(name)) {
                        mc.thePlayer.sendChatMessage(getMessage(target));
                        msTimer.reset();
                        return;
                    }
                });
            }
        }    
    },
    onLoad: function() {
        msTimer = new MSTimer();
    }
}

//script.import("lib/AbuseUtils.js");