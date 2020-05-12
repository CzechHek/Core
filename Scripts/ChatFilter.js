showCountValue = value.createBoolean("ShowCount", true),

count = 0;

/**
 * type: Array<String>
 * put your keywords here!(I added some words often appears in chinese MC's server's LB users' spammer, thx to As丶One)
 */
keywords = [
    "点击右侧链接",
    "t.cn",
    ".xyz",
    "smg520",
    "加q",
    "maikama.cn",
    "q群",
    "企鹅",
    "企鹅群",
    "要开挂的",
    "免费外挂",
    "点击链接",
    "anfaka.com",
    "jq.qq.com",
    "不空刀",
    "加群",
    "稳定奔放",
    "免费获取",
    "杀戮不空刀",
    "内部",
    "包教包会",
    "外部群",
    "小卖部",
    "僵尸"
];

module = {
    name: "ChatFilter",
    author: "Tsikyng Kirisame",
    version: 0.1,
    category: "Misc",
    values: list,
    tag: showCountValue.get() ? String(count) : "",
    onPacket: function (event) {
        if (!(event.getPacket() instanceof S02PacketChat)) return;
        
        keywords.forEach(function(it) {
            if (event.getPacket().getChatComponent().getUnformattedText().indexOf(it) + 1) {//index == -1 => continue
                event.cancelEvent();
                count++;
                return;
            }
        });
    }
}

script.import("Core.lib");
