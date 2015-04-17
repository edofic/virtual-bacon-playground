var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var Bacon = require('baconjs');
window.Bacon = Bacon;

// model
var streamCount = Bacon
  .repeatedly(1000, [1])
  .scan(0, function(count, step) { return count + step });

// view
var streamTree = streamCount.map(function (count) {
    return h('div', {
        style: {
            textAlign: 'center',
            lineHeight: (100 + count) + 'px', 
            border: '1px solid red',
            width: (100 + count) + 'px',
            height: (100 + count) + 'px'
        }
    }, [String(count)]);
});

/*
// wiring
streamTree.scan({}, function(state, cur) {
  var prev = state.prev;
  var root = state.root;
  if (prev == undefined || root == undefined) {
    root = createElement(cur);
    document.body.appendChild(root);
  } else {
    root = patch(root, diff(prev, cur));
  }
  return {prev: cur, root: root};
}).forEach(function(state) {
  // consume
});
*/

var latestTree = undefined;
var root = undefined;
var inProgress = false;
streamTree.forEach(function (tree) {
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
  var patches = diff(latestTree, tree);
  requestAnimationFrame(function() {
    latestTree = tree;
    inProgress = false;
    root = patch(root, patches);
  });
  dirty = true;
});
