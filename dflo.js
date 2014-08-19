var extend = function (Ancestor, properties) {
    var Descendant = function () {
        if (this.init instanceof Function)
            this.init.apply(this, arguments);
    };
    Descendant.prototype = Object.create(Ancestor.prototype);
    if (properties)
        for (var property in properties)
            Descendant.prototype[property] = properties[property];
    Descendant.prototype.constructor = Descendant;
    Descendant.extend = function (properties) {
        return extend(this, properties);
    };
    return Descendant;
};

var abstractMethod = function () {
    throw new SyntaxError("Tried to call an abstract method.");
};
var abstractInit = function () {
    throw new SyntaxError("Tried to instantiate an abstract class.");
};

var Class = extend(Object, {
    init: abstractInit
});
Class.abstractInit = abstractInit;
Class.abstractMethod = abstractMethod;

var dflo = {
    Class: Class
};

module.exports = dflo;