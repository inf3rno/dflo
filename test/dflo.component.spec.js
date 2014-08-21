var dflo = require("../dflo"),
    Component = dflo.Component;

describe("dflo", function () {

    describe("Component", function () {

        it("has a unique id", function () {
            expect(new Component().id).not.toEqual(new Component().id);
        });

    });

});