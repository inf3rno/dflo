(function (dflo) {

    var Class = dflo.Class;
    var InputPort = dflo.InputPort;

    var Publisher = dflo.Publisher;
    var Traverser = dflo.Traverser;

    var Subscriber = dflo.Subscriber;


    var DataBuilder = Class.extend({
        init: function () {
            this.data = {
                nodes: [],
                links: []
            };
            this.map = {};
            this.portIndexes = {};
        },
        next: function (type) {
            if (type == Traverser.COMPONENT) {
                var component = arguments[1];
                var node = {
                    icon: "#undefined",
                    groups: ["node", "component"],
                    label: "Component",
                    inputs: [],
                    outputs: []
                };
                if (component instanceof Subscriber) {
                    node.icon = "#subscriber";
                    node.groups.push("subscriber");
                    node.label = "Subscriber";
                }
                else if (component instanceof Publisher) {
                    node.icon = "#publisher";
                    node.groups.push("publisher");
                    node.label = "Publisher";
                    if (component instanceof Traverser) {
                        node.groups.push("traverser");
                        node.label = "Traverser";
                    }
                }
                this.data.nodes.push(node);
                this.map[component.id] = node;
            }
            else if (type == Traverser.PORT) {
                var port = arguments[1];
                var name = arguments[2];
                var node = this.map[port.component.id];
                var ports = node.outputs;
                if (port instanceof InputPort)
                    ports = node.inputs;
                var index = ports.length;
                this.portIndexes[port.id] = index;
                ports.push(name);
            }
            else if (type == Traverser.CONNECTION) {
                var output = arguments[1];
                var input = arguments[2];
                this.data.links.push({
                    source: this.map[output.component.id],
                    sourceIndex: this.portIndexes[output.id],
                    target: this.map[input.component.id],
                    targetIndex: this.portIndexes[input.id],
                    groups: ["link"]
                });
            }
            else
                throw new Error("Invalid message.");
        },
        getData: function () {
            var data = this.data;
            delete(this.data);
            delete(this.map);
            delete(this.portIndexes);
            return data;
        }
    });


    var GraphView = Class.extend({
        init: function (data) {
            this.data = data;
        },
        render: function () {

            var width = 960;
            var height = 500;

            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

            var defs = svg.append("defs");
            defs.append("marker").attr({
                id: "arrow",
                viewBox: "0 -2 10 10",
                refX: 10,
                refY: 0,
                markerWidth: 10,
                markerHeight: 10,
                orient: "auto"
            }).append("path").attr({
                d: "M0,-2L10,0L0,2"
            });
            defs.append("rect").attr({
                id: "container-big",
                x: -400,
                y: -400,
                width: 800,
                height: 800,
                rx: 120,
                ry: 120
            });
            defs.append("rect").attr({
                id: "container",
                x: -25,
                y: -25,
                width: 50,
                height: 50,
                rx: 10,
                ry: 10
            });
            defs.append("rect").attr({
                id: "port",
                x: -6,
                y: "-1.5",
                width: 12,
                height: 3,
                rx: 3,
                ry: 3
            });
            defs.append("path").attr({
                id: "publisher",
                transform: "translate(-20,-20) scale(0.08)",
                d: "M480,256.048l-160-128V192H160v128h160v64.032L480,256.048z M256,416H64V96h192v32h32V80c0-8.845-7.936-16-16.812-16h-224C38.375,64,32,71.155,32,80v352c0,8.845,6.375,16,15.187,16h224c8.877,0,16.812-7.155,16.812-16v-48h-32V416z"
            });
            defs.append("path").attr({
                id: "subscriber",
                transform: "translate(-20,-20) scale(0.08)",
                d: "M352,256.048l-160-128V192H32v128h160v64.032L352,256.048z M463.188,64h-224C230.375,64,224,71.155,224,80v48h32V96h192v320H256v-32h-32v48c0,8.845,6.375,16,15.188,16h224c8.877,0,16.812-7.155,16.812-16V80C480,71.155,472.064,64,463.188,64z"
            });

            var force = d3.layout.force()
                .gravity(.05)
                .distance(150)
                .charge(-1000)
                .size([width, height])
                .nodes(this.data.nodes)
                .links(this.data.links)
                .start();

            var node = svg.selectAll(".node").data(this.data.nodes).enter().append("g").attr({
                "class": function (d) {
                    return d.groups.join(" ");
                }
            }).call(force.drag);
            node.append("use").attr({
                "class": "container",
                "xlink:href": "#container"
            });
            node.append("use").attr({
                "class": "icon",
                "xlink:href": function (d) {
                    return d.icon;
                }
            });
            node.append("text").attr({
                "class": "label",
                "text-anchor": "middle",
                "alignment-baseline": "middle",
                dy: 40
            }).text(function (d) {
                return d.label
            });

            node.append("g").attr({
                "class": "input",
                transform: "translate(-31,-16)"
            }).selectAll("use").data(function (d) {
                return d.inputs;
            }).enter().append("use").attr({
                y: function (d, index) {
                    return 8 * index;
                },
                "class": "port",
                "xlink:href": "#port"
            }).append("title").text(String);

            node.append("g").attr({
                "class": "output",
                transform: "translate(31,-16)"
            }).selectAll("use").data(function (d) {
                return d.outputs;
            }).enter().append("use").attr({
                y: function (d, index) {
                    return 8 * index;
                },
                "class": "port",
                "xlink:href": "#port"
            }).append("title").text(String);

            var link = svg.selectAll(".link").data(this.data.links).enter().append("path").attr({
                "class": function (d) {
                    return d.groups.join(" ");
                },
                "marker-end": "url(#arrow)"
            });

            force.on("tick", function () {
                link.attr("d", function (d) {
                    var sx = d.source.x + 31 + 6;
                    var sy = d.source.y - 16 + d.sourceIndex * 8;
                    var tx = d.target.x - 31 - 6;
                    var ty = d.target.y - 16 + d.targetIndex * 8;
                    return "M" + sx + "," + sy + " " + tx + "," + ty;
                });
                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });
        }
    });

    var example = {
        DataBuilder: DataBuilder,
        GraphView: GraphView
    };

    window.example = example;

})(window.dflo);



