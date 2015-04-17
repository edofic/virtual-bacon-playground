var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var kefir = require('kefir');

// model
var streamCount = kefir
  .repeatedly(0, [1])
  .scan(function(count, step) { return (count + step) % 200 }, 0);

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

function wireDumb(streamTree) {
  var rr;
  var unsub = streamTree.scan(function(state, cur) {
    var prev = state.prev;
    var root = state.root;
    if (prev == undefined || root == undefined) {
      root = createElement(cur);
      document.body.appendChild(root);
      rr = root;
    } else {
      root = patch(root, diff(prev, cur));
    }
    return {prev: cur, root: root};
  }, {}).onValue(function(state) {
    // consume
  });
  return function() {
    unsub();
    rr.remove();
  }
}

function wireRAF(streamTree) {
  var latestTree = undefined;
  var root = undefined;
  var inProgress = false;
  var unsub = streamTree.onValue(function (tree) {
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
  return function () {
    unsub();
    root.remove();
  }
}


// comparison 
var stop = [];
function mkBtn(name, f) {
  var btn= document.createElement("button");
  btn.textContent = name;
  btn.onclick = function () {
    console.log("starting", name)
    var remove = f(streamTree);
    stop.push(remove)
  }
  document.body.appendChild(btn);
}
mkBtn("Dumb", wireDumb)
mkBtn("RAF", wireRAF)
var btn = document.createElement("button");
btn.textContent = "stop";
btn.onclick = function () {
  for (i in stop) {
    stop[i]()
  }
}
document.body.appendChild(btn);


var count = 0;
streamTree.onValue(function(){
  count += 1;
})
setInterval(function() {
  console.log("count", count);
  count = 0;
}, 1000);
