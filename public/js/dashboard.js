/* globals Chart:false, feather:false */
(function () {
  'use strict'
  // import { ajaxRequest } from './main';
  feather.replace({ 'aria-hidden': 'true' })

  // Graphs
  var ctx = document.getElementById('myChart')
  // eslint-disable-next-line no-unused-vars
  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16'
      ],
      datasets: [{
        data: [
          27530.248,
          7677.773,
          11055.557,
          3619.577,
          5229.207,
          32197.359,
          2091.432,
          24697.404,
          22488.390,
          10391.152,
          17615.506,
          38590.637,
          3566.138,
          15967.710,
          23993.169,
          10681.990
        ],
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  })
})()
