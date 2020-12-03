///api_version=2
(script = registerScript({
    name: "Reflector",
    authors: ["CzechHek"],
    version: "1.0"
})).import("Core.lib");

module = {
    onEnable: function () {
        print(adaptedMc.debugFPS); //accessing a private field

        blockRenderDispatcher = adaptedMc.blockRenderDispatcher; //storing a private field inside a variable (will store an adapted version of it)

        print(blockRenderDispatcher.blockModelRenderer); //accessing a private field of an adapted block render dispatcher

        adaptedMc.resize(1280, 720); //calling a private method (supports any argument count)

        adaptedLB.isStarting = true; //setting a value of a private field
    }
}

adaptedMc = new Reflector(mc);
adaptedLB = new Reflector(LiquidBounce.INSTANCE); //INSTANCE is needed to change isStarting field
//requires Core 3.17+, supports any java object, automatically converts to srg names