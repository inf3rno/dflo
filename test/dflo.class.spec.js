var dflo = require("../dflo"),
    Class = dflo.Class,
    abstractMethod = Class.abstractMethod;

describe("dflo", function () {

    describe("Class", function () {

        var warningMessages = {
            abstractClassInstantiation: "Tried to instantiate an abstract class.",
            abstractMethodCall: "Tried to call an abstract method."
        };

        describe("Class()", function () {

            it("throws exception by initialization", function () {
                expect(function () {
                    new Class();
                }).toThrow(warningMessages.abstractClassInstantiation);
            });

        });

        describe("extend(Object properties = null)", function () {

            it("keeps the abstract init if it is not overridden", function () {
                var Descendant = Class.extend();
                expect(function () {
                    new Descendant();
                }).toThrow(warningMessages.abstractClassInstantiation);
            });

            it("does not keep the abstract init if it is overridden", function () {
                var Descendant = Class.extend({
                    init: function () {
                    }
                });
                expect(function () {
                    new Descendant();
                }).not.toThrow();
            });

            it("calls the init of the descendant if it is overridden", function () {
                var mockInit = jasmine.createSpy();
                var Descendant = Class.extend({
                    init: mockInit
                });
                new Descendant();
                expect(mockInit).toHaveBeenCalled();
                new Descendant();
                expect(mockInit.callCount).toBe(2);
            });

            it("does not call the init of an ancestor automatically", function () {
                var mockInits = {
                    ancestor: jasmine.createSpy(),
                    descendant: jasmine.createSpy()
                };
                var Descendant = Class
                    .extend({
                        init: mockInits.ancestor
                    })
                    .extend({
                        init: mockInits.descendant
                    });
                new Descendant(1, 2, 3);
                expect(mockInits.ancestor).not.toHaveBeenCalled();
                expect(mockInits.descendant).toHaveBeenCalledWith(1, 2, 3);
                new Descendant(4, 5, 6);
                expect(mockInits.descendant).toHaveBeenCalledWith(4, 5, 6);
            });


            it("overrides properties in the prototype if they are given", function () {
                var properties = {
                    a: 1,
                    b: "b",
                    c: {}
                };
                var Descendant = Class.extend(properties);
                expect(Descendant.prototype).not.toBe(properties);
                for (var property in properties)
                    expect(Descendant.prototype[property]).toBe(properties[property]);
            });

            it("throws exception by calling method given as an abstract method", function () {
                var Descendant = Class.extend({
                    init: function () {
                    },
                    method: abstractMethod
                });
                expect(function () {
                    var instance = new Descendant();
                    instance.method();
                }).toThrow(warningMessages.abstractMethodCall);
            });

            it("uses prototypal inheritance, so by the instances the instanceOf works on both of the ancestor and descendant", function () {

                var Ancestor = Class.extend({
                    init: function () {
                    }
                });
                var Descendant = Ancestor.extend();
                var instance = new Descendant();

                expect(instance instanceof Class).toBe(true);
                expect(instance instanceof Ancestor).toBe(true);
                expect(instance instanceof Descendant).toBe(true);
            });

        });

    });

});