var refresh_rate = 1000;
var query_base_path = window.location.protocol+"//"+window.location.host.split(":")[0] + ":4040/now/";
var height = 500;
var window_duration = 3600;

function makeKey(k, s) {
    return k + " " + s
}

function size(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function initSlider(graph, slider_id) {

    var slider_elt = $('#' + slider_id)

    var slider = new Rickshaw.Graph.RangeSlider( {
        graph: graph,
        element: slider_elt
        } );

    setTimeout(function() {
         var values = slider_elt.slider("values")
         var toSet = 0.95 * (values[1] - values[0]) + values[0]
         slider_elt.slider("values", 0, toSet)
         graph.window.xMin = toSet
         graph.update();
     }, 500)
}

function clearGraph(selector) {
    document.getElementById(selector+'-legend').innerHTML = '';
    document.getElementById(selector+'-graph').innerHTML = '';
    document.getElementById(selector+'-slider').innerHTML = '';
}

function withInitialData(query_url, f, json_loc) {
    var data = $.ajax({
        type: 'GET',
        url: query_url,
        dataType: 'json',
            success: function() {},
            data: {},
            async: false
        }).responseJSON[json_loc];

    if (size(data) > 0) {
        f(data)
    } else {
        setTimeout(function() { withInitialData(query_url, f, json_loc) }, refresh_rate)
    }
}

/// COUNTERS
var countsJsonLoc = 'counters_per_second'
var countsGraph = null

function setupCountsGraph( query_url, initial_data, refresh_rate,  height, window_duration, graph_id, legend_id) {
    
    var last_update = initial_data

    var initial_keys = [];
    for (var key in last_update) {
        initial_keys.push({ name: key });
    }

    countsGraph = new Rickshaw.Graph({
        element: document.getElementById(graph_id),
        height: height,
        renderer: 'line',
        series: new Rickshaw.Series.FixedDuration(initial_keys, undefined, {
            timeInterval: refresh_rate,
            maxDataPoints: window_duration,
            timeBase: new Date().getTime() / 1000
        })
    });
    countsGraph.render();

    var y_ticks = new Rickshaw.Graph.Axis.Y( {
        graph: countsGraph,
        orientation: 'right',
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    } );
    y_ticks.render();

    var legend, shelving;
    if (legend_id) {
        legend = new Rickshaw.Graph.Legend( {
            graph: countsGraph,
            element: document.getElementById(legend_id)
        } );

        shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	          graph: countsGraph,
	          legend: legend
        } );
    }

    var axes = new Rickshaw.Graph.Axis.Time( {
        graph: countsGraph,
        timeUnit: new Rickshaw.Fixtures.Time().unit('1 minute')
    } );
    axes.render();

    var hover = new Rickshaw.Graph.HoverDetail({
        graph: countsGraph
    });

    function refreshCountsGraph() {
        $.getJSON(query_url, function(data) {
            if (!(countsJsonLoc in data)) {
                data[countsJsonLoc] = {}
            }

            var to_add = []

            for (var key in last_update) {
                if (!(key in data[countsJsonLoc])) {
                    to_add[key] = 0;
                }
            }

            var data_fields_changed = false;
            for (var key in data[countsJsonLoc]) {
                to_add[key] = data[countsJsonLoc][key]

                if (last_update[key] === undefined) {
                    var data_fields_changed = true;
                }
            }

            countsGraph.series.addData(to_add);

            //update legend if needed
            if (legend_id && data_fields_changed) {
                var old_legend = document.getElementById(legend_id);
                old_legend.innerHTML = '';
                legend = new Rickshaw.Graph.Legend( {
                    graph: countsGraph,
                    element: document.getElementById(legend_id)
                } );
                shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	                  graph: countsGraph,
	                  legend: legend
                } );
            }

            last_update = data[countsJsonLoc];

            countsGraph.render();
            timeout = setTimeout(refreshCountsGraph, refresh_rate);
        });
    }

    //don't call render too early
    setTimeout(refreshCountsGraph, 500)

    return countsGraph;
}

function loadCountsGraphFromForm() {
    try {
        clearGraph('counts');
        loadCountsGraph($('#counts-host').val(), $('#samples-query').val(), query_base_path);
        return false;
    } catch(err) {
        console.log(err);
        return false;
    }
}

function loadCountsGraph(aHost, query, base_url) {

    var host;
    if (aHost) {
        host = "host/" + aHost;
    } else {
        host = "all";
    }

    var url = query_base_path + host + "/" + query;


    withInitialData(url, function(initial_data) {
        countsGraph = setupCountsGraph(
            url,
            initial_data,
            refresh_rate,
            height,
            window_duration,
            "counts-graph",
            "counts-legend");
        initSlider(graph, "counts-slider");
    }, countsJsonLoc);
}


//SAMPLES
var samplesJsonLoc = 'samples';
var samplesGraph = null

function setupSamplesGraph(query_url, initial_data, stats_to_show, refresh_rate, height, window_duration) {
    var last_update = initial_data

    var initial_keys = [];
    for (var key in last_update) {
        for (s in stats_to_show) {
            initial_keys.push({ name: makeKey(key,stats_to_show[s]) });
        }
    }

    samplesGraph = new Rickshaw.Graph({
        element: document.getElementById("samples-graph"),
        height: height,
        renderer: 'line',
        series: new Rickshaw.Series.FixedDuration(initial_keys, undefined, {
            timeInterval: refresh_rate,
            maxDataPoints: window_duration,
            timeBase: new Date().getTime() / 1000
        })
    });
    samplesGraph.render();

    var y_ticks = new Rickshaw.Graph.Axis.Y( {
        graph: samplesGraph,
        orientation: 'right',
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    } );
    y_ticks.render();

    var legend = new Rickshaw.Graph.Legend( {
        graph: samplesGraph,
        element: document.getElementById('samples-legend')
    } );

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
        graph: samplesGraph,
        legend: legend
    } );

    var axes = new Rickshaw.Graph.Axis.Time( {
        graph: samplesGraph,
        timeUnit: new Rickshaw.Fixtures.Time().unit('1 minute')
    } );
    axes.render();

    var hover = new Rickshaw.Graph.HoverDetail({
        graph: samplesGraph
    });

    function refreshSamplesGraph() {
        $.getJSON(query_url, function(data) {
            if (!(samplesJsonLoc in data)) {
                data[samplesJsonLoc] = {}
            }

            var to_add = {}

            for (var key in last_update) {
                if (!(key in data[samplesJsonLoc])) {
                    for (var s in stats_to_show) {
                        var stat = stats_to_show[s]
                        to_add[makeKey(key,stat)] = 0;
                    }
                }
            }

            var data_fields_changed = false;
            for (var key in data[samplesJsonLoc]) {
                for (var s in stats_to_show) {
                    var stat = stats_to_show[s]
                    to_add[makeKey(key,stat)] = data[samplesJsonLoc][key][stat]
                }

                if (last_update[key] === undefined) {
                    var data_fields_changed = true;
                }
            }

            samplesGraph.series.addData(to_add);

            //update legend if needed
            if (data_fields_changed) {
                var old_legend = document.getElementById('samples-legend');
                old_legend.innerHTML = '';
                legend = new Rickshaw.Graph.Legend( {
                    graph: samplesGraph,
                    element: document.getElementById('samples-legend')
                } );
                shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
                    graph: samplesGraph,
                    legend: legend
                } );
            }

            last_update = data[samplesJsonLoc];

            samplesGraph.render();
            timeout = setTimeout(refreshSamplesGraph, refresh_rate);
        });
    }


    //don't call render too early
    setTimeout(refreshSamplesGraph, 500)

    return samplesGraph;
}

function loadSamplesGraphFromForm() {
    try {
        clearGraph('samples');
        var host = ''
        if ($('#samples-host').val() != '') {
            host = "host/" + $('#samples-host').val()
        } else {
            host = "all"
        }
        var query = $('#samples-query').val();
        var url = query_base_path + host + "/" + query;

        var stats = [];
        $('.samples-series').each(function(index,data) {
          if($(this).is(':checked')){
            stats.push($(this).val())
          }
        });

        if (stats.length === 0) {
            alert("Must select at least one stat!")
        }

        withInitialData(url, function(initial_data) {
            samplesGraph = setupSamplesGraph(
                url,
                initial_data,
                stats,
                refresh_rate,
                height,
                window_duration);

            initSlider(samplesGraph,'samples-slider');
        }, samplesJsonLoc);

        return false;
    } catch(err) {
        console.log(err);
        return false;
    }
}

function initBtns(){
  $('#samples-plot-btn').click(function(e){
    loadSamplesGraphFromForm();
  });
  $('#counts-plot-btn').click(function(e){
    loadCountsGraphFromForm();
  });
}

initBtns();

