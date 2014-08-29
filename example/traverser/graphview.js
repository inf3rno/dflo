(function (dflo) {

    var Class = dflo.Class;
    var InputPort = dflo.InputPort;

    var Publisher = dflo.Publisher;
    var Traverser = dflo.Traverser;

    var Subscriber = dflo.Subscriber;

    var Transformer = dflo.Transformer;


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
                else if (component instanceof Transformer) {
                    node.icon = "#transformer";
                    node.groups.push("transformer");
                    node.label = "Transformer";
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
            defs.append("path").attr({
                id: "transformer",
                transform: "translate(-20,-20) scale(0.08)",
                d: "M266.157,295.312l37.154-37.204l-49.437-49.452l-37.188,37.188c-5.906-3.111-12.063-5.626-18.498-7.671v-52.579h-69.972v52.579c-6.436,2.045-12.592,4.576-18.531,7.671l-37.188-37.172l-49.437,49.469l37.187,37.172c-3.123,5.906-5.625,12.063-7.687,18.499H0v69.971h52.563c2.061,6.436,4.563,12.592,7.687,18.499l-37.187,37.188l49.469,49.469l37.155-37.188c5.939,3.095,12.064,5.594,18.531,7.655V512h69.972v-52.563c6.435-2.061,12.592-4.592,18.498-7.687l37.188,37.188l49.469-49.469l-37.187-37.155c3.094-5.939,5.625-12.063,7.654-18.531h52.595v-69.971h-52.595C271.782,307.376,269.251,301.219,266.157,295.312z M163.188,418.749c-38.625,0-69.937-31.312-69.937-69.937c0-38.655,31.312-69.952,69.937-69.952c38.656,0,69.939,31.297,69.939,69.952C233.127,387.437,201.844,418.749,163.188,418.749zM512,138.563V89.658h-36.781c-1.407-4.519-3.187-8.813-5.344-12.938l25.937-26.016l-34.561-34.579l-26,26c-4.096-2.173-8.438-3.936-12.938-5.36V0h-48.877v36.765c-4.499,1.424-8.842,3.203-12.97,5.36l-26-25.984l-34.592,34.58l26,26c-2.156,4.125-3.939,8.419-5.344,12.938H283.75v48.905h36.781c1.404,4.516,3.188,8.813,5.344,12.938l-26,26l34.624,34.592l25.968-26c4.128,2.157,8.438,3.907,12.97,5.36v36.765h48.877v-36.749c4.499-1.437,8.842-3.219,12.938-5.376l26,26l34.624-34.592l-26-25.968c2.157-4.157,3.937-8.438,5.344-12.97H512z M397.875,163.015c-27.001,0-48.905-21.888-48.905-48.89c0-27.031,21.904-48.922,48.905-48.922c27.03,0,48.906,21.891,48.906,48.922C446.781,141.126,424.905,163.015,397.875,163.015z"
            });

            var force = d3.layout.force()
                .gravity(.005)
                .distance(150)
                .charge(-50)
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



