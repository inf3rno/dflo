var dflo = require("../dflo"),
    CustomComponent = dflo.CustomComponent;

describe("dflo", function () {

    describe("CustomComponent", function () {

        it("creates a custom component and calls the init function given as the first argument", function () {

            var log = jasmine.createSpy();

            new CustomComponent(log);
            expect(log.callCount).toBe(1);


        });

        it("calls the init with the other arguments", function () {

            var log = jasmine.createSpy();

            new CustomComponent(log, 1, 2, 3);
            expect(log.callCount).toBe(1);
            expect(log).toHaveBeenCalledWith(1, 2, 3);

        });

        it("calls the init in the context of the new component instance", function () {

            var log = jasmine.createSpy();
            var init = function () {
                log(this);
            };

            var component = new CustomComponent(init);
            expect(log.callCount).toBe(1);
            expect(log).toHaveBeenCalledWith(component);

            var component2 = new CustomComponent(init);
            expect(log.callCount).toBe(2);
            expect(log).toHaveBeenCalledWith(component2);

            expect(component).not.toEqual(component2);
        });

    });

});