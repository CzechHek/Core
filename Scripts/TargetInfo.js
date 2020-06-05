GL11 = Java.type("org.lwjgl.opengl.GL11");
Color = Java.type("java.awt.Color");
Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts");
ClickGui = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.ClickGui");
fontList = Fonts.getFonts();

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

var fonti, prevSettings;

module = {
    name: "TargetInfo",
    description: "Renders information about target.",
    author: "natte, CzechHek, As丶One, Nvaros",
    version: 2.3,
    values: list,
    onLoad: function () {
        LiquidBounce.fileManager.loadConfig(LiquidBounce.fileManager.valuesConfig);
        updateValues();
        positionScreen = new (Java.extend(GuiScreen))() {
            func_73868_f: function () {
                return false;
            },
            func_146273_a: function (posX, posY, button) {
                !button && (x.set(posX), y.set(posY));
            }
        }
    },
    onUpdate: function () {
        updateValues();
        editpos.get() && (mc.displayGuiScreen(positionScreen), editpos.set(false));
    },
    onRender2D: function () {
        if (mc.thePlayer && (target = KillAuraClass.target || (showpointingat.get() ? mc.objectMouseOver.entityHit : null) || (mc.currentScreen == positionScreen ? mc.thePlayer : null)) instanceof EntityPlayer) {
            xPos = x.get() / scale.get(); yPos = y.get() / scale.get(); textYPos = texty.get() / scale.get();
            GL11.glPushMatrix();
            GL11.glScaled(scale.get(), scale.get(), scale.get());

            Gui.drawRect(xPos, yPos, xPos + 140, yPos + 44, new Color(bgred.get(), bggreen.get(), bgblue.get(), bgalpha.get()).getRGB());
            bordervalue.get() && drawBorder();

            drawString("Name: " + StringUtils.stripControlCodes(target.getName()), 4, textshadow.get());
            drawString("Distance: " + mc.thePlayer.getDistanceToEntity(target).toFixed(2) + " m", 12, textshadow.get());
            drawString("Health: " + (target.getHealth() ? Math.round(target.getHealth()) + " ❤" : "-"), 20, textshadow.get());
            drawString("Ping: " + ((targetinfo = mc.getNetHandler().getPlayerInfo(target.getUniqueID())) ? targetinfo.getResponseTime() + " ms" : "-"), 28, textshadow.get());
            drawFace();

            target.getHealth() && (Gui.drawRect(xPos + 44, yPos + 36, xPos + 140, yPos + 44.5, new Color(35, 35, 35).getRGB()), Gui.drawRect(xPos + 44, yPos + 36, xPos + 44 + (96 / target.getMaxHealth() * target.getHealth()), yPos + 44.5, (Color.HSBtoRGB(Math.max(0.0, Math.min(target.getHealth(), target.getMaxHealth()) / target.getMaxHealth()) / 3.0, 1.0, 0.75) | 0xFF000000)));
            GL11.glPopMatrix();
        }
    }
}

function drawBorder () {
    color = new Color(borderred.get(), bordergreen.get(), borderblue.get(), borderalpha.get()).getRGB();
    Gui.drawRect(xPos - borderstrength.get(), yPos - borderstrength.get(), xPos + 140 + borderstrength.get(), yPos, color);
    Gui.drawRect(xPos - borderstrength.get(), yPos + 44, xPos + 140 + borderstrength.get(), yPos + 44 + borderstrength.get(), color);
    Gui.drawRect(xPos - borderstrength.get(), yPos, xPos, yPos + 44, color);
    Gui.drawRect(xPos + 140, yPos, xPos + 140 + borderstrength.get(), yPos + 44, color);
}

function drawFace () {
    mc.getTextureManager().bindTexture(target.getLocationSkin());
	GL11.glEnable(GL11.GL_BLEND); GL11.glColor4f(1, 1, 1, 1);
	Gui.drawScaledCustomSizeModalRect(xPos, yPos, 8, 8, 8, 8, 44, 44, 64, 64);
	GL11.glDisable(GL11.GL_BLEND);
}

function drawString (text, yinc, shadow) {
    shadow ? font.drawStringWithShadow(text, xPos + 46.5, yPos + yinc + textYPos, new Color(textred.get(), textgreen.get(), textblue.get()).getRGB()) : font.drawString(text, xPos + 46.5, yPos + yinc + textYPos, new Color(textred.get(), textgreen.get(), textblue.get()).getRGB());
}

function updateValues () {
    (fonti != fontint.get()) && fontvalue.set((font = fontList[fonti = fontint.get()]) == mc.fontRendererObj ? "Minecraft" : font.getDefaultFont().getFont().getName());
    if (mc.currentScreen instanceof ClickGui) {
        if (prevSettings == settings.get()) return
        switch (prevSettings = settings.get()) {
            case "General":
                setValues(TargetInfoClass, [settings, scale, editpos, showpointingat]); break
            case "Background":
                setValues(TargetInfoClass, [settings, bgred, bggreen, bgblue, bgalpha]); break
            case "Text":
                setValues(TargetInfoClass, [settings, textred, textgreen, textblue, texty, textshadow, fontint, fontvalue]); break
            case "Border":
                setValues(TargetInfoClass, [settings, bordervalue, borderred, bordergreen, borderblue, borderalpha, borderstrength]); break
        }
    } else if (prevSettings) {
        setValues(TargetInfoClass, list);
        LiquidBounce.fileManager.saveConfig(LiquidBounce.fileManager.valuesConfig);
        prevSettings = null;
    }
}

script.import("Core.lib");