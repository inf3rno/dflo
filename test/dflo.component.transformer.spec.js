var dflo = require("../dflo"),
    Publisher = dflo.Publisher,
    Subscriber = dflo.Subscriber,
    Transformer = dflo.Transformer,
    warning = dflo.warning;

describe("dflo", function () {

    describe("Transformer", function () {

        it("transforms the message with the async callback given in the config", function () {

            var publisher = new Publisher();
            var summarizer = new Transformer({
                callback: function (data, done) {
                    var sum = 0;
                    data.forEach(function (num) {
                        sum += num;
                    });
                    setTimeout(function () {
                        done([sum]);
                    }, 1);
                }
            });
            var log = jasmine.createSpy();
            var subscriber = new Subscriber({
                callback: log
            });
            publisher.ports.stdout.connect(summarizer.ports.stdin);
            summarizer.ports.stdout.connect(subscriber.ports.stdin);

            runs(function () {
                publisher.publish(1, 2, 3);
            });
            waitsFor(function () {
                return log.callCount;
            });
            runs(function () {
                expect(log).toHaveBeenCalledWith(6);
            });
        });

        it("throws error if we send the same array back as results", function () {

            var publisher = new Publisher();
            var transformer = new Transformer({
                callback: function (data, done) {
                    done(data);
                }
            });
            publisher.ports.stdout.connect(transformer.ports.stdin);

            expect(function () {
                publisher.publish(0, 1, 2);
            }).toThrow(warning.CANNOT_TRANSFORM_SAME_ARRAY);
        });

        it("throws error if we send a non array value as results", function () {
            var publisher = new Publisher();
            var transformer = new Transformer({
                callback: function (data, done) {
                    done(1);
                }
            });
            publisher.ports.stdout.connect(transformer.ports.stdin);

            expect(function () {
                publisher.publish();
            }).toThrow(warning.MESSAGE_DATA_INVALID);
        });

        it("can send error messages if cannot transform", function () {

            var publisher = new Publisher();
            var transformer = new Transformer({
                callback: function (data, done) {
                    var a = data[0];
                    var b = data[1];
                    if (!b)
                        done(null, ["Cannot divide by zero."]);
                    else
                        done([a / b]);
                }
            });
            var log = jasmine.createSpy();
            var subscriber = new Subscriber({
                callback: log
            });
            var err = jasmine.createSpy();
            var subscriber2 = new Subscriber({
                callback: err
            });
            publisher.ports.stdout.connect(transformer.ports.stdin);
            transformer.ports.stdout.connect(subscriber.ports.stdin);
            transformer.ports.stderr.connect(subscriber2.ports.stdin);

            publisher.publish(6, 3);
            expect(log).toHaveBeenCalledWith(2);
            expect(log.callCount).toBe(1);
            expect(err.callCount).toBe(0);

            publisher.publish(1, 0);
            expect(log.callCount).toBe(1);
            expect(err.callCount).toBe(1);
            expect(err).toHaveBeenCalledWith("Cannot divide by zero.");
        });

        it("throws error if we send a non array error data", function () {
            var publisher = new Publisher();
            var transformer = new Transformer({
                callback: function (data, done) {
                    done(null, 1);
                }
            });
            publisher.ports.stdout.connect(transformer.ports.stdin);
            expect(function () {
                publisher.publish();
            }).toThrow(warning.ERROR_DATA_INVALID)
        });

    });

});