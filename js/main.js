var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var Bacon = require('baconjs');
var Delegator = require('dom-delegator')
window.Bacon = Bacon;
window.Delegator = Delegator;


// model
var clicks = new Bacon.Bus();
var streamCount = clicks
  .scan(0, function(count, click) { return count + 1 });

var textInputBus = new Bacon.Bus();
var textInput = textInputBus.startWith("");


// view
var clicker = streamCount.map(function (count) {
    return h('div', {
        style: {
            textAlign: 'center',
            lineHeight: '100px', 
            border: '1px solid red',
            width: '100px',
            height: '100px'
        },
        'ev-click': function () {
          clicks.push(1);
        }
    }, [String(count)]);
});

var echoer = textInput.map(function(textInputValue){
    var input = h('input', {
      type: "text",
      "ev-input": function(ev) {
        textInputBus.push(ev.target.value);
      }
    });
    var txt = " text:" + textInputValue;
    return h('div', [input, txt])
});

var streamTree = Bacon.combineWith(function(clicker, echoer) {
  return h('div', [clicker, echoer]);
}, clicker, echoer);


//wiring
var latestTree = undefined;
var nextTree = undefined;
var root = undefined;
var inProgress = false;
var unsub = streamTree.forEach(function (tree) {
  nextTree = tree;
  if (inProgress) {
    return;
  }
  if (root == undefined || latestTree == undefined) {
    root = createElement(tree);
    document.body.appendChild(root);
    latestTree = tree;
    return;
  }
  inProgress = true;
  requestAnimationFrame(function() {
    inProgress = false;
    root = patch(root, diff(latestTree, nextTree));
  });
});

var delegator = Delegator();
