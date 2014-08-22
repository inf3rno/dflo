var dflo = require("../dflo"),
    Component = dflo.Component;

describe("dflo", function () {

    describe("Component", function () {

        describe("id", function () {

            it("has a unique id", function () {
                expect(new Component().id).not.toEqual(new Component().id);
            });

        });


        describe("label", function () {

            it("is a string given in the config, or by default", function () {

                var component1 = new Component({
                    label: "something"
                });
                var component2 = new Component();
                expect(component1.label).toBe("something");
                expect(component2.label).toBe("Component");
            });

        });


    });

});