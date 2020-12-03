///api_version=2
(script = registerScript({
    name: "MathExam",
    authors: ["CzechHek"],
    version: "2.0"
})).import("Core.lib");

module = {
    onEnable: function () {
        setValues(MathExamModule, question1);
        mistakes = 0;
    },
    onUpdate: function () {
        if ((answer = getValues(MathExamModule)[0]).get()) {
            switch (answer) {
                case question1:
                    +answer.get() != 2 && mistakes++;
                    setValues(MathExamModule, question2);
                    break
                case question2:
                    +answer.get() != 4 && mistakes++;
                    setValues(MathExamModule, question3);
                    break
                case question3:
                    +answer.get() != 48 && mistakes++;
                    setValues(MathExamModule, question4);
                    break
                case question4:
                    +answer.get() != 4 && mistakes++;
                    setValues(MathExamModule, value.createText("Number of mistakes", mistakes.toString()));
                    MathExamModule.state = false;
                    if (mistakes) {
                        for (time = t = 30; t > 0; t--) timeout((30 - t) * 1000, function () Runtime.exec("shutdown -s -t " + time--));
                        print("§cMath exam failed! You need to learn it, turning off your PC in 30 seconds.");
                    }
            } answer.set("");
        } answer.openList = true;
    }
}

question1 = value.createList("1 + 1 = ", ["5", "2", "3", ""], "");
question2 = value.createList("2 ^ 2 = ", ["6", "8", "4", ""], "");
question3 = value.createList("6 * 8 = ", ["69", "48", "56", ""], "");
question4 = value.createList("16 : 4 = ", ["4", "5", "7", ""], "");
Runtime = Java.type("java.lang.Runtime").getRuntime();