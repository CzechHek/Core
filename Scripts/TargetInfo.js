KillAura = Java.type("net.ccbluex.liquidbounce.LiquidBounce").moduleManager.getModule(Java.type("net.ccbluex.liquidbounce.features.module.modules.combat.KillAura").class);
EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer");
StringUtils = Java.type("net.minecraft.util.StringUtils");
Gui = Java.type("net.minecraft.client.gui.Gui");
GL11 = Java.type("org.lwjgl.opengl.GL11");
Color = Java.type("java.awt.Color");
targetPlayer = "";

Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts");
FontList = Fonts.getFonts();

var font
var ii


list = [
	value.createText("§7§lGeneral Settings", ""),
	x = value.createInteger("X", 430, 0, 1000),
	y = value.createInteger("Y", 310, 0, 1000),
	Scale = value.createFloat("Scale", 1, 0.2, 4),
	ShowTargetOnView = value.createBoolean('ShowTargetOnView', false),
	value.createBoolean("", false),

	value.createText("§7§lBackground Settings", ""),
	BGRed = value.createInteger("BGRed", 0, 0, 255),
	BGGreen = value.createInteger("BGGreen", 0, 0, 255),
	BGBlue = value.createInteger("BGBlue", 0, 0, 255),
	BGAlpha = value.createInteger("BGAlpha", 150, 0, 255),
	value.createBoolean("", false),

	value.createText("§7§lText Settings", ""),
	TextRed = value.createInteger("TextRed", 255, 0, 255),
	TextGreen = value.createInteger("TextGreen", 255, 0, 255),
	TextBlue = value.createInteger("TextBlue", 255, 0, 255),
	TextY = value.createFloat('TextY', 0, -5, 5),
	ShadowText = value.createBoolean('ShadowText', true),
	value.createBoolean("", false),

	value.createText("§7§lBorder Settings", ""),
	BorderValue = value.createBoolean('Border', true),
	BorderRed = value.createInteger("BorderRed", 255, 0, 255),
	BorderGreen = value.createInteger("BorderGreen", 255, 0, 255),
	BorderBlue = value.createInteger("BorderBlue", 255, 0, 255),
	BorderAlpha = value.createInteger("BorderAlpha", 255, 0, 255),
	BorderStrength = value.createFloat("BorderStrength", 2, 0, 8),

	FontValue = value.createInteger('', 0, 0, FontList.length - 1),
	Font = value.createText('Font ', Fonts.getFonts()[0].getDefaultFont().getFont().getName())
]

module = {
	name: "TargetInfo",
	description: "Renders informations about current target.",
	author: "natte && As丶One && Nvaros",
	values: list,
	onRender2D: function () {
		var playerInView = getTargetEntity();
		if (mc.thePlayer != null && (KillAura.target instanceof EntityPlayer || playerInView instanceof EntityPlayer)) {
			targetPlayer = (KillAura.target instanceof EntityPlayer || !ShowTargetOnView.get()) ? KillAura.target : playerInView;
			
			var playerInfo = mc.getNetHandler().getPlayerInfo(targetPlayer.getUniqueID());

			var name = StringUtils.stripControlCodes(targetPlayer.getName());
			var distance = mc.thePlayer.getDistanceToEntity(targetPlayer).toFixed(2);
			var health = isValidHealth(targetPlayer.getHealth()) ? (targetPlayer.getHealth() / 2).toFixed(2) : "-"
			var ping = playerInfo == null ? "0ms" : playerInfo.getResponseTime() + "ms";

			var width = 140;
			var height = 44;

			var BGColor = new Color(BGRed.get(), BGGreen.get(), BGBlue.get(), BGAlpha.get()).getRGB();
			var TextColor = new Color(TextRed.get(), TextGreen.get(), TextBlue.get()).getRGB();
			var BorderColor = new Color(BorderRed.get(), BorderGreen.get(), BorderBlue.get(), BorderAlpha.get()).getRGB();

			var inc = 96 / targetPlayer.getMaxHealth();
			var end = inc * (targetPlayer.getHealth() > targetPlayer.getMaxHealth() || isValidHealth(targetPlayer.getMaxHealth()) ? targetPlayer.getMaxHealth() : targetPlayer.getHealth());

			GL11.glPushMatrix();
			GL11.glScaled(Scale.get(), Scale.get(), Scale.get());

			drawRect(x.get(), y.get(), x.get() + width, y.get() + height, BGColor);
			if (BorderValue.get()) {
				drawBorder(x.get(), y.get(), width, height, BorderStrength.get(), BorderColor);
			}
			
			if (ShadowText.get()) {
				font.drawStringWithShadow("Name: " + name, x.get() + 46.5, y.get() + 4 + TextY.get(), TextColor);
				font.drawStringWithShadow("Distance: " + distance, x.get() + 46.5, y.get() + 12 + TextY.get(), TextColor);
				font.drawStringWithShadow("Health: " + health, x.get() + 46.5, y.get() + 20 + TextY.get(), TextColor);
				font.drawStringWithShadow("Ping: " + ping, x.get() + 46.5, y.get() + 28 + TextY.get(), TextColor);
			} else {
				font.drawString("Name: " + name, x.get() + 46.5, y.get() + 4 + TextY.get(), TextColor);
				font.drawString("Distance: " + distance, x.get() + 46.5, y.get() + 12 + TextY.get(), TextColor);
				font.drawString("Health: " + health, x.get() + 46.5, y.get() + 20 + TextY.get(), TextColor);
				font.drawString("Ping: " + ping, x.get() + 46.5, y.get() + 28 + TextY.get(), TextColor);
			}

			drawFace(x.get() + 0.5, y.get() + 0.5, 8, 8, 8, 8, 44, 44, 64, 64);

			drawRect(x.get() + 44, y.get() + 36, x.get() + width, y.get() + 0.5 + height, new Color(35, 35, 35).getRGB());
			drawRect(x.get() + 44, y.get() + 36, x.get() + 44 + end, y.get() + 0.5 + height, getHealthColor(targetPlayer));

			GL11.glPopMatrix();
		}
	},
	onUpdate: function () {
		if (ii != FontValue.get()) {
			ii = FontValue.get();
			font = Fonts.getFonts()[ii];
			Font.set(font == mc.fontRendererObj ? 'Minecraft' : font.getDefaultFont().getFont().getName());
		}
	},
	onEnable: function () {
		ii = FontValue.get();
		font = FontList[ii];
		Font.set(font == mc.fontRendererObj ? 'Minecraft' : font.getDefaultFont().getFont().getName());
	}
}

function drawFace(x, y, u, v, uWidth, vHeight, width, height, tileWidth, tileHeight) {
	var texture = targetPlayer.getLocationSkin();

	mc.getTextureManager().bindTexture(texture);

	GL11.glEnable(GL11.GL_BLEND);
	GL11.glColor4f(1, 1, 1, 1);

	Gui.drawScaledCustomSizeModalRect(x, y, u, v, uWidth, vHeight, width, height, tileWidth, tileHeight);

	GL11.glDisable(GL11.GL_BLEND);
}

function drawRect(x1, y1, x2, y2, color) {
	Gui.drawRect(x1, y1, x2, y2, color);
}

function drawBorder(x, y, width, height, thickness, color) {
	drawRect(x - thickness, y - thickness, x + width + thickness, y, color);
	drawRect(x - thickness, y + height, x + width + thickness, y + height + thickness, color);
	drawRect(x - thickness, y, x, y + height, color);
	drawRect(x + width, y, x + width + thickness, y + height, color);
}

function getHealthColor(player) {
	var maxHealth = player.getMaxHealth();
	var health = isValidHealth(player.getHealth()) ? player.getHealth() : maxHealth;

	return Color.HSBtoRGB(Math.max(0.0, Math.min(health, maxHealth) / maxHealth) / 3.0, 1.0, 0.75) | 0xFF000000;
}

function isValidEntity(entity) {
	return mc.thePlayer.canEntityBeSeen(entity) &&  entity != mc.getRenderViewEntity() && entity.getName() != mc.thePlayer.getName() && entity instanceof EntityPlayer
}

function isValidHealth(health) {
	return !isNaN(health) && health >= 0;
}

function getTargetEntity() {

	var entityBox;
	var pointedEntity;
	var list = [];
	var filteredEntityList = [];
	var calculateIntercept;
	var lowestDistance = 1E5;
	var distanceToEntity;

	var lookVec = mc.thePlayer.getLookVec();
	var eyePos = mc.getRenderViewEntity().getPositionEyes(1);
	var vec = eyePos.addVector(lookVec.xCoord * 300, lookVec.yCoord * 300, lookVec.zCoord * 300);
	list = mc.theWorld.loadedEntityList;
	for (var i in list) {
		if (isValidEntity(list[i])) {
			filteredEntityList.push(list[i]);
		}
	}
	
	for (var j in filteredEntityList) {
		entityBox = filteredEntityList[j].getEntityBoundingBox().expand(0.15, 0.2, 0.15);
		calculateIntercept = entityBox.calculateIntercept(eyePos, vec);
		if (calculateIntercept != null) {
			distanceToEntity = mc.thePlayer.getDistanceToEntity(filteredEntityList[j]);
			if (distanceToEntity < lowestDistance) {
				lowestDistance = distanceToEntity;
				pointedEntity = filteredEntityList[j];
			}
		}	
	}
	return pointedEntity;
}

script.import("Core.lib");
