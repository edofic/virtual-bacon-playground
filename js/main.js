var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var Bacon = require('baconjs');
window.Bacon = Bacon;

// model
var streamCount = Bacon
  .repeatedly(0, [1])
  .scan(0, function(count, step) { return (count + step) % 200 });

// view
var streamTree = streamCount.map(function (count) {
    return h('div', {
        style: {
            textAlign: 'center',
            lineHeight: '100px', 
            border: '1px solid red',
            width: (100 + count) + 'px',
            height: '100px'
        }
    }, [String(count)]);
});

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
