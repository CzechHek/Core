KillAura = Java.type("net.ccbluex.liquidbounce.LiquidBounce").moduleManager.getModule(Java.type("net.ccbluex.liquidbounce.features.module.modules.combat.KillAura").class);
AntiBot = Java.type("net.ccbluex.liquidbounce.features.module.modules.misc.AntiBot");
EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer");
Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts");
StringUtils = Java.type("net.minecraft.util.StringUtils");
Gui = Java.type("net.minecraft.client.gui.Gui");
GL11 = Java.type("org.lwjgl.opengl.GL11");
Color = Java.type("java.awt.Color");

FontList = Fonts.getFonts();

list = [
    value.createText("§7§lGeneral Settings", ""),
    posX = value.createInteger("Position-X", 415, 0, 1000),
    posY = value.createInteger("Position-Y", 320, 0, 1000),
    scale = value.createFloat("Scale", 1, 0.2, 4),
    value.createBoolean("", false),

    value.createText("§7§lBackground Settings", ""),
    backgroundRed = value.createInteger("Background-Red", 0, 0, 255),
    backgroundGreen = value.createInteger("Background-Green", 0, 0, 255),
    backgroundBlue = value.createInteger("Background-Blue", 0, 0, 255),
    backgroundAlpha = value.createInteger("Background-Alpha", 60, 0, 255),
    value.createBoolean("", false),

    value.createText("§7§lBorder Settings", ""),
    borderRed = value.createInteger("Border-Red", 255, 0, 255),
    borderGreen = value.createInteger("Border-Green", 255, 0, 255),
    borderBlue = value.createInteger("Border-Blue", 255, 0, 255),
    borderAlpha = value.createInteger("Border-Alpha", 255, 0, 255),
    value.createBoolean("", false),

    value.createText("§7§lText Settings", ""),
    textRed = value.createInteger("Text-Red", 255, 0, 255),
    textGreen = value.createInteger("Text-Green", 255, 0, 255),
    textBlue = value.createInteger("Text-Blue", 255, 0, 255), 
    textFontName = value.createText('Font-Name ', Fonts.getFonts()[0].getDefaultFont().getFont().getName() + " - " + Fonts.getFonts()[0].getDefaultFont().getFont().getSize()),
    textFont = value.createInteger("Font-Index", 0, 0, FontList.length - 1),
    textShadow = value.createBoolean("Text-Shadow", true)
]

var font
var ii

module = {
    name: "TargetInfo",
    description: "Renders informations about current target.",
    author: "natte && As丶One",
    values: list,
    onRender2D: function () {
        backgroundColor = new Color(backgroundRed.get(), backgroundGreen.get(), backgroundBlue.get(), backgroundAlpha.get()).getRGB();
        borderColor = new Color(borderRed.get(), borderGreen.get(), borderBlue.get(), borderAlpha.get()).getRGB();
        textColor = new Color(textRed.get(), textGreen.get(), textBlue.get(), 255).getRGB();

        isAlive = (target = KillAura.target) && target.isEntityAlive() && target.getHealth() > 0;
        isBot = AntiBot.isBot(KillAura.target);

        canRender = isAlive && !isBot;

        if (mc.thePlayer != null && KillAura.target instanceof EntityPlayer) {
            playerInfo = mc.getNetHandler().getPlayerInfo(KillAura.target.getUniqueID());

            name = StringUtils.stripControlCodes(KillAura.target.getName());
            distance = mc.thePlayer.getDistanceToEntity(KillAura.target).toFixed(2);
            
            health = (KillAura.target.getHealth() / 2).toFixed(2);
            ping = playerInfo == null ? "0ms" : playerInfo.getResponseTime() + "ms";

            width = 140;
            height = 44;

            GL11.glPushMatrix();
			GL11.glScaled(scale.get(), scale.get(), scale.get());

            // background
            drawRect(posX.get(), posY.get(), width, height, backgroundColor);

            // info
            font.drawString("Name: " + name, posX.get() + 46.5, posY.get() + 4, textColor, textShadow.get());
            font.drawString("Distance: " + distance, posX.get() + 46.5, posY.get() + 12, textColor, textShadow.get());

            if (canRender)
                font.drawString("Health: " + health, posX.get() + 46.5, posY.get() + 20, textColor, textShadow.get());
            font.drawString("Ping: " + ping, posX.get() + 46.5, posY.get() + (canRender ? 28 : 20), textColor, textShadow.get());

            // face
            drawFace(posX.get() + 0.5, posY.get() + 0.5, 8, 8, 8, 8, 44, 44, 64, 64);

            inc = 96 / KillAura.target.getMaxHealth();
            end = inc * (KillAura.target.getHealth() > KillAura.target.getMaxHealth() ? KillAura.target.getMaxHealth() : KillAura.target.getHealth());

            // health bar background
            if (canRender)
                drawRect(posX.get() + 44, posY.get() + 36, width - 44, height - 35.5, new Color(35, 35, 35).getRGB());

            // health bar
            if (canRender)
                drawRect(posX.get() + 44, posY.get() + 36, end, height - 35.5, getHealthColor(KillAura.target));

            // border
            drawBorder(posX.get(), posY.get(), width, height, 1.0, borderColor);

            GL11.glPopMatrix();
        }
    },
    onUpdate: function () {
        if (ii != textFont.get()) {
            ii = textFont.get()
            font = Fonts.getFonts()[ii]
            textFontName.set(font == mc.fontRendererObj ? 'Minecraft' : font.getDefaultFont().getFont().getName()  + " - " + font.getDefaultFont().getFont().getSize());
        }
    },
    onEnable: function () {
        setupFonts();
    },
    onLoad: function () {
        setupFonts();
    }
}

function setupFonts() {
    if (ii != textFont.get()) {
        ii = textFont.get()
        font = Fonts.getFonts()[ii]
        textFontName.set(font == mc.fontRendererObj ? 'Minecraft' : font.getDefaultFont().getFont().getName()  + " - " + font.getDefaultFont().getFont().getSize());
    }
}

function drawFace(x, y, u, v, uWidth, vHeight, width, height, tileWidth, tileHeight) {
    texture = KillAura.target.getLocationSkin();

    mc.getTextureManager().bindTexture(texture);

    GL11.glEnable(GL11.GL_BLEND);
    GL11.glColor4f(1, 1, 1, 1);

    Gui.drawScaledCustomSizeModalRect(x, y, u, v, uWidth, vHeight, width, height, tileWidth, tileHeight);

    GL11.glDisable(GL11.GL_BLEND);
}

function drawRect(x, y, width, height, color) {
    Gui.drawRect(x, y, x + width, y + height, color);
}

function drawBorder(x, y, width, height, lineSize, borderColor) {
    Gui.drawRect(x, y, x + width, y + lineSize, borderColor);
    Gui.drawRect(x, y, x + lineSize, y + height, borderColor);
    Gui.drawRect(x + width, y, x + width - lineSize, y + height, borderColor);
    Gui.drawRect(x, y + height, x + width, y + height - lineSize, borderColor);
}

function getHealthColor(player) {
    var health = player.getHealth();
    var maxHealth = player.getMaxHealth();

    return Color.HSBtoRGB(Math.max(0.0, Math.min(health, maxHealth) / maxHealth) / 3.0, 1.0, 0.75) | 0xFF000000;
}

script.import("Core.lib");
