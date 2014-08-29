var dflo = require("../dflo"),
    Class = dflo.Class,
    Publisher = dflo.Publisher,
    Subscriber = dflo.Subscriber;

describe("examples", function () {

    describe("Observer pattern", function () {

        var Subject = Class.extend({
            init: function (state) {
                this.publisher = new Publisher();
                this.state = state;
            },
            changeState: function (state) {
                this.state = state;
                this.notifyObservers();
            },
            registerObserver: function (observer) {
                this.publisher.ports.stdout.connect(observer.subscriber.ports.stdin);
            },
            unregisterObserver: function (observer) {
                this.publisher.ports.stdout.disconnect(observer.subscriber.ports.stdin);
            },
            notifyObservers: function () {
                this.publisher.publish(this.state);
            }
        });

        var Observer = Class.extend({
            init: function () {
                this.subscriber = new Subscriber({
                    callback: this.notify,
                    context: this
                });
            },
            notify: function (state) {
                this.state = state;
            }
        });

        describe("Subject", function () {

            it("should notify the observers about its internal state changes", function () {
                var subject = new Subject();
                var observer1 = new Observer();
                var observer2 = new Observer();
                subject.registerObserver(observer1);
                subject.registerObserver(observer2);
                var newState = {};
                subject.changeState(newState);
                expect(observer1.state).toBe(newState);
                expect(observer2.state).toBe(newState);
            });

        });

    });

});



