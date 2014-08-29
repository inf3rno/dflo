var dflo = require("../dflo"),
    Publisher = dflo.Publisher,
    Builder = dflo.Builder,
    Subscriber = dflo.Subscriber,
    warning = dflo.warning;

describe("dflo", function () {

    describe("Builder", function () {

        describe("connectAll()", function () {

            it("connects multiple ports to each other", function () {

                var log = jasmine.createSpy();
                var sub = new Subscriber({
                    callback: log
                });
                var log2 = jasmine.createSpy();
                var sub2 = new Subscriber({
                    callback: log2
                });
                var pub = new Publisher();
                var builder = new Builder();
                builder.connectAll(sub.ports.stdin, pub.ports.stdout, sub2.ports.stdin);

                pub.publish(0, 1, 2);
                expect(log).toHaveBeenCalledWith(0, 1, 2);
                expect(log2).toHaveBeenCalledWith(0, 1, 2);
            });

            it("throws error by passing non port argument", function () {

                var builder = new Builder();
                expect(function () {
                    builder.connectAll(1, 2);
                }).toThrow(warning.PORT_INVALID);

            });

        });

    });
});