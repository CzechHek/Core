list = [
    posX = value.createFloat("posX", -0.5, -2, 2),
    posY = value.createFloat("posY", 0.2, -2, 2),
    posZ = value.createFloat("posZ", 0, -2, 2),
    rotX = value.createFloat("rotX", 30, -180, 180),
    rotY = value.createFloat("rotY", -80, -180, 180),
    rotZ = value.createFloat("rotZ", 60, -180, 180),
    deviation = value.createFloat("deviation", 60, 0, 360),
    deviateXPos = value.createBoolean("deviateXPos", false),
    deviateYPos = value.createBoolean("deviateYPos", false),
    deviateZPos = value.createBoolean("deviateZPos", false),
    deviateXRot = value.createBoolean("deviateXRot", false),
    deviateYRot = value.createBoolean("deviateYRot", true),
    deviateZRot = value.createBoolean("deviateZRot", false),
    swingSpeed = value.createFloat("swingSpeed", 5, 0, 10),
    reset = new _AdaptedValue(new (Java.extend(Java.type("net.ccbluex.liquidbounce.value.BoolValue")))("resetValues", false) {onChanged: function () {posX.set(-0.5); posY.set(0.2); posZ.set(0); rotX.set(30); rotY.set(-80); rotZ.set(60); deviation.set(60); deviateXPos.set(false); deviateYPos.set(false); deviateZPos.set(false); deviateXRot.set(false); deviateYRot.set(true); deviateZRot.set(false); swingSpeed.set(5); reset.set(false)}})
]

module = {
    name: "BlockAnimations",
    author: "CzechHek",
    version: "0.5",
    category: "Render",
    values: list,
    onEnable: function () {
        mc.entityRenderer.itemRenderer = new (Java.extend(ItemRenderer))(mc) {
            func_178103_d: function () {
                offset = Math.pow(Math.sin(progress += 0.002 * swingSpeed.get()), 2) * deviation.get(); offset2 = offset / 100;
                GlStateManager.translate(posX.get() + (deviateXPos.get() ? offset2 : 0), posY.get() + (deviateYPos.get() ? offset2 : 0), posZ.get() + (deviateZPos.get() ? offset2 : 0));
                GlStateManager.rotate(rotX.get() + (deviateXRot.get() ? offset : 0), 0.0, 1.0, 0.0);
                GlStateManager.rotate(rotY.get() + (deviateYRot.get() ? offset : 0), 1.0, 0.0, 0.0);
                GlStateManager.rotate(rotZ.get() + (deviateZRot.get() ? offset : 0), 0.0, 1.0, 0.0);
            },
            func_78440_a: function (partialTicks) {
                prevEquippedProgress = getField(ItemRenderer, "field_78451_d").get(mc.entityRenderer.itemRenderer);
                equippedProgress = getField(ItemRenderer, "field_78454_c").get(mc.entityRenderer.itemRenderer);
                itemToRender = getField(ItemRenderer, "field_78453_b").get(mc.entityRenderer.itemRenderer);
                equipProgress = new Float(1 - (prevEquippedProgress + (equippedProgress - prevEquippedProgress) * partialTicks));
                swingProgress = mc.thePlayer.getSwingProgress(partialTicks);
                pitch = new Float(mc.thePlayer.prevRotationPitch + (mc.thePlayer.rotationPitch - mc.thePlayer.prevRotationPitch) * partialTicks);
                yaw = new Float(mc.thePlayer.prevRotationYaw + (mc.thePlayer.rotationYaw - mc.thePlayer.prevRotationYaw) * partialTicks);
                partialTicks = new Float(partialTicks);

                getMethod(ItemRenderer, "func_178101_a").invoke(mc.entityRenderer.itemRenderer, pitch, yaw);
                getMethod(ItemRenderer, "func_178109_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer);
                getMethod(ItemRenderer, "func_178110_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, partialTicks);

                GlStateManager.enableRescaleNormal();
                GlStateManager.pushMatrix();

                if (itemToRender != null) {
                    if (itemToRender.getItem() == Items.filled_map) getMethod(ItemRenderer, "func_178097_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, pitch, equipProgress, swingProgress);
                    else if (mc.thePlayer.itemInUseCount > 0 || KillAuraModule.blockingStatus && itemToRender.getItem() instanceof ItemSword) {
                        switch (itemToRender.getItemUseAction()) {
                            case EnumAction.NONE:
                                getMethod(ItemRenderer, "func_178096_b").invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(.0));
                                break
                            case EnumAction.EAT:
                            case EnumAction.DRINK:
                                getMethod(ItemRenderer, "func_178104_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, partialTicks);
                                getMethod(ItemRenderer, "func_178096_b").invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(.0));
                                break
                            case EnumAction.BLOCK:
                                getMethod(ItemRenderer, "func_178096_b").invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(.0));
                                this.func_178103_d();
                                break
                            case EnumAction.BOW:
                                getMethod(ItemRenderer, "func_178096_b").invoke(mc.entityRenderer.itemRenderer, equipProgress, new Float(.0));
                                getMethod(ItemRenderer, "func_178098_a").invoke(mc.entityRenderer.itemRenderer, partialTicks, mc.thePlayer);
                        }
                    } else if (!progress) {
                        getMethod(ItemRenderer, "func_178105_d").invoke(mc.entityRenderer.itemRenderer, swingProgress);
                        getMethod(ItemRenderer, "func_178096_b").invoke(mc.entityRenderer.itemRenderer, equipProgress, swingProgress);
                        progress = 0;
                    }
                    getMethod(ItemRenderer, "func_178099_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, itemToRender, ItemCameraTransforms.TransformType.FIRST_PERSON);
                } else if (!mc.thePlayer.isInvisible()) getMethod(ItemRenderer, "func_178095_a").invoke(mc.entityRenderer.itemRenderer, mc.thePlayer, equipProgress, swingProgress);

                GlStateManager.popMatrix();
                GlStateManager.disableRescaleNormal();
                RenderHelper.disableStandardItemLighting();
            }
        };
    },
    onDisable: function () {
        mc.entityRenderer.itemRenderer = new ItemRenderer(mc);
    }
}

progress = 0;
Float = Java.type("java.lang.Float");
script.import("Core.lib");
