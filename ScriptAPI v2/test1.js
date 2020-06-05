value = new Object();

BlockValue = Java.type("net.ccbluex.liquidbounce.value.BlockValue");
BoolValue = Java.type("net.ccbluex.liquidbounce.value.BoolValue");
FloatValue = Java.type("net.ccbluex.liquidbounce.value.FloatValue");
FontValue = Java.type("net.ccbluex.liquidbounce.value.FontValue");
IntegerValue = Java.type("net.ccbluex.liquidbounce.value.IntegerValue");
ListValue = Java.type("net.ccbluex.liquidbounce.value.ListValue");
TextValue = Java.type("net.ccbluex.liquidbounce.value.TextValue");

Object.defineProperty(Object.prototype, "createBlock", {
    value: function (name, value) {
        return new BlockValue(name, value);
    }
});

Object.defineProperty(Object.prototype, "createBoolean", {
    value: function (name, value) {
        return new BoolValue(name, value);
    }
});

Object.defineProperty(Object.prototype, "createFloat", {
    value: function (name, value, min, max) {
        return new FloatValue(name, value, min, max);
    }
});

Object.defineProperty(Object.prototype, "createFont", {
    value: function (name, value) {
        return new FontValue(name, value);
    }
});

Object.defineProperty(Object.prototype, "createInteger", {
    value: function (name, value, min, max) {
        return new IntegerValue(name, value, min, max);
    }
});

Object.defineProperty(Object.prototype, "createList", {
    value: function (name, values, value) {
        return new ListValue(name, values, value);
    }
});

Object.defineProperty(Object.prototype, "createText", {
    value: function (name, value) {
        return new TextValue(name, value);
    }
});

list = [
    settings = value.createList("Settings", ["General", "Background", "Text", "Border"], "General"),
	x = value.createInteger("X", 430, 0, 1000),
	y = value.createInteger("Y", 310, 0, 1000),
	scale = value.createFloat("Scale", 1, 0.2, 4),
	editpos = value.createBoolean("EditPosition", false),
	showpointingat = value.createBoolean("ShowPointingAt", false),
	bgred = value.createInteger("BGRed", 0, 0, 255),
	bggreen = value.createInteger("BGGreen", 0, 0, 255),
	bgblue = value.createInteger("BGBlue", 0, 0, 255),
	bgalpha = value.createInteger("BGAlpha", 150, 0, 255),
	textred = value.createInteger("TextRed", 255, 0, 255),
	textgreen = value.createInteger("TextGreen", 255, 0, 255),
	textblue = value.createInteger("TextBlue", 255, 0, 255),
	texty = value.createFloat("TextY", 0, -5, 5),
	textshadow = value.createBoolean("TextShadow", true),
	fontint = value.createInteger('', 0, 0, fontList.length - 1),
	fontvalue = value.createText('Font ', fontList[0].getDefaultFont().getFont().getName()),
	bordervalue = value.createBoolean("Border", true),
	borderred = value.createInteger("BorderRed", 150, 0, 255),
	bordergreen = value.createInteger("BorderGreen", 150, 0, 255),
	borderblue = value.createInteger("BorderBlue", 150, 0, 255),
	borderalpha = value.createInteger("BorderAlpha", 255, 0, 255),
	borderstrength = value.createInteger("BorderStrength", 1, 1, 8)
]

module = {
    name: "Test1",
    author: "CzechHek",
    version: 1.0,
    values: list
}

registerScript({name: "", authors: [], version: ""}).import("Core2.lib");