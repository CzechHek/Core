question1 = value.createList("1 + 1 = ", ["5", "2", "3", ""], "");
question2 = value.createList("2 ^ 2 = ", ["6", "8", "4", ""], "");
question3 = value.createList("6 * 8 = ", ["69", "48", "56", ""], "");
question4 = value.createList("16 : 4 = ", ["4", "5", "7", ""], "");

module = {
    name: "MathExam",
    author: "CzechHek",
    version: 1.1,
    onEnable: function () {
        setValues(MathExamModule, question1);
        mistakes = 0;
    },
    onUpdate: function () {
        if (answer = (modulevalue = getValues(MathExamModule)[0]).get()) {
            modulevalue.set("");
            switch (modulevalue) {
                case question1.value:
                    parseInt(answer) != 2 && mistakes++;
                    setValues(MathExamModule, question2);
                    break
                case question2.value:
                    parseInt(answer) != 4 && mistakes++;
                    setValues(MathExamModule, question3);
                    break
                case question3.value:
                    parseInt(answer) != 48 && mistakes++;
                    setValues(MathExamModule, question4);
                    break
                case question4.value:
                    parseInt(answer) != 4 && mistakes++;
                    setValues(MathExamModule, value.createText("Number of mistakes", mistakes.toString()));
                    MathExamModule.state = false;
                    if (mistakes) {
                        for (time = t = 30; t > 0; t--) timeout((30 - t) * 1000, function () {Runtime.exec("shutdown -s -t " + time--)});
                        chat.print("§cMath exam failed! You need to learn it, turning off your PC in 30 seconds.")
                    }
                    break
            }
        } modulevalue.openList = true;
    }
}

Runtime = Java.type("java.lang.Runtime").getRuntime();
script.import("Core.lib");