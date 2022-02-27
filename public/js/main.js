'use strict'
// ajaxRequest launches a deceiptively simple looking jquery ajax request
// based on the url based in as an argument, then changes the contents
// of the div with ~ same ID.
function ajaxRequest(ajaxUrl, divId) {
   console.log(`ajaxRequest: ${ajaxUrl}`);
   $.get(ajaxUrl, function (data) {
      // results = JSON.parse(data);
      document.getElementById(divId).innerHTML= '<ul>' + JSON.stringify(data) + '</ul>';
         // expecting an array of arrays here. the 1st value in contained 
         // array: title; the 2nd: its url. return each like so:
         //return "<li><a href='javascript:void(0)' onclick='ajaxSentimentCheck(" + JSON.stringify(value[0]).replace(/'/g, '-') + ", \"" + value[1] + "\")'>" + value[0] + "</a></li>";      
      });
      //console.log('returning to: ' + divId + ' this: ' + results + 'derived from: ' + data);
      
   
}

// export ajaxRequest;

// document.onload(ajaxRequest("/api/v1/flume", "flume"));
// document.on("load", ajaxRequest("/api/v1/rachio", "rachio"));


// working with plot.ly's graphing js lib
function graphToken(token) {
   $.get('/api/v1/usage/all', results => {      
      let values = JSON.parse(results);
      console.log('graphToken results :', results);
      let indices = [];
      var popularities = values.map((value, index) => {         
         console.log('value', value.zone_id, value.sum, index)
         indices[index] = value.zone_id;         
         return value.sum;
      })
      // var popularity = {
      //    x: indices, y: popularities, type: 'pie]',
      //    line: { color: '#0d6efd', width: '2' }
      // };
      var popularity = {
         labels: indices, values: popularities, type: 'pie',
         textinfo: "label+percent", textposition: "outside",
         automargin: true
      };
      
      //console.log('popularity: ', JSON.stringify(popularity));
      var data = [popularity];
      // want to set titeFont smaller depending on length of token
      // var titleFontSize = (token.length > 17 ? "10" : "13");

      // hard earned info
      var layout = {
         title: 'Total Water Usage by Zone',
         titleFont: {
            family: '"Helvetica Neue",Helvetica,Arial,sans-serif',
            size: '20',
         },
         plot_bgcolor: '#fff',
         //paper_bgcolor: '#262626',
         paper_bgcolor: 'rgba(0,0,0,0)',
         //plot_bgcolor: 'rgba(0,0,0,0)',
         height: '580',
         font: {
            family: '"Helvetica Neue",Helvetica,Arial,sans-serif',
            size: '14',
            color: '#000000'
         } /*,
         xaxis: {
            ticks: 'outside',
            showline: 'true',
            type: 'number',
            visible: 'true'            
         }*/
      };
      // wave the magic wand
      Plotly.newPlot('graph', data, layout);

   });
}

graphToken();