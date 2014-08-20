var dflo = require("../dflo"),
    Sequence = dflo.Sequence,
    uniqueId = dflo.uniqueId;

describe("dflo", function () {

    describe("Sequence", function () {

        it("generates the next state from the previous state", function () {
            var continuouslyIncreasingSequence = new Sequence({
                generator: function (previous) {
                    return ++previous;
                },
                initial: 0
            });
            expect(continuouslyIncreasingSequence.get()).toBe(0);
            expect(continuouslyIncreasingSequence.next()).toBe(1);
            expect(continuouslyIncreasingSequence.next()).toBe(2);
            expect(continuouslyIncreasingSequence.next()).toBe(3);
        });

        it("returns a wrapper which calls next state", function () {
            var sequence = new Sequence({
                generator: function (i) {
                    return ++i;
                },
                initial: 0
            });
            var wrapper = sequence.wrapper();
            expect(wrapper()).toBe(1);
            expect(wrapper()).toBe(2);
            expect(wrapper()).toBe(3);
            expect(sequence.get()).toBe(3);
        });

        it("accepts additional parameters", function () {
            var sequence = new Sequence({
                generator: function (i, j) {
                    return i + j;
                },
                initial: 0
            });
            var wrapper = sequence.wrapper();
            expect(sequence.next(1)).toBe(1);
            expect(sequence.next(2)).toBe(3);
            expect(wrapper(5)).toBe(8);
        });

        it("stores additional parameters in the wrapper", function () {
            var sequence = new Sequence({
                generator: function (i, j, k) {
                    return i + j + k;
                },
                initial: 0
            });
            var wrapper = sequence.wrapper(10);
            expect(wrapper(5)).toBe(15);
            expect(sequence.next(1, 2)).toBe(18);
            expect(wrapper(2)).toBe(30);
        });

    });

    describe("uniqueId", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 1000; ++i) {
                var id = uniqueId();
                if (id in store)
                    break;
                store[id] = true;
            }
            expect(i).toBe(1000);
        });

    });

});
