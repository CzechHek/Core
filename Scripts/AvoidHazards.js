///api_version=2
(script = registerScript({
	name: "AvoidHazards",
	version: "1.1",
	authors: ["CzechHek"]
})).import("Core.lib");

module = {
	description: "Prevents you from walking into blocks that might be harmful to you.",
	values: [
		fire = value.createBoolean("Fire", true),
		cobweb = value.createBoolean("Cobweb", true),
		cactus = value.createBoolean("Cactus", true),
		lava = value.createBoolean("Lava", true),
		water = value.createBoolean("Water", false),
		pressureplate = value.createBoolean("PressurePlate", false)
	],
	onBlockBB: function (e) {
		if (!mc.thePlayer) return

		switch (e.getBlock()) {
			case Blocks.fire:
				if (fire.get()) break
				else return

			case Blocks.web:
				if (cobweb.get()) break
				else return

			case Blocks.cactus:
				if (cactus.get()) break
				else return

			case Blocks.water:
			case Blocks.flowing_water:
				if (water.get() && mc.thePlayer.fallDistance < 3.34627 && !mc.thePlayer.isInWater()) break
				else return

			case Blocks.lava:
			case Blocks.flowing_lava:
				if (lava.get()) break
				else return

			case Blocks.heavy_weighted_pressure_plate:
			case Blocks.light_weighted_pressure_plate:
			case Blocks.stone_pressure_plate:
			case Blocks.wooden_pressure_plate:
				if (pressureplate.get()) return e.setBoundingBox(new AxisAlignedBB(e.getX(), e.getY(), e.getZ(), e.getX() + 1, e.getY() + 0.25, e.getZ() + 1));
			default: return
		}

		e.setBoundingBox(new AxisAlignedBB(e.getX(), e.getY(), e.getZ(), e.getX() + 1, e.getY() + 1, e.getZ() + 1));
	}
}