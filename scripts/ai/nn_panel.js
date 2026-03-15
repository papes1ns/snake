var RAY_NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
var DIR_NAMES = ['↑ N', '→ E', '↓ S', '← W'];

function NNPanel(containerEl) {
  this.el = containerEl;
  this.visionCells = null;
  this.hiddenCells = null;
  this.outputCells = null;
  this.decisionEl  = null;
  this.built = false;
}

NNPanel.prototype.build = function(hiddenSizes) {
  this.el.innerHTML = '';

  this.el.appendChild(heading('Neural Network', 'h3'));

  // Outer table: one row, 4 columns (vision | hidden1 | hidden2 | output)
  var outer = document.createElement('table');
  outer.setAttribute('cellpadding', '6');
  var outerRow = outer.insertRow();

  // --- Col 1: Vision ---
  var visionTd = outerRow.insertCell();
  visionTd.setAttribute('valign', 'top');
  visionTd.appendChild(heading('Vision'));
  var vt = makeTable(['Ray', 'Wall', 'Food', 'Body']);
  this.visionCells = [];
  for (var i = 0; i < 8; i++) {
    var row = vt.insertRow();
    row.insertCell().textContent = RAY_NAMES[i];
    var wc = row.insertCell();
    var fc = row.insertCell();
    var bc = row.insertCell();
    this.visionCells.push({ wall: wc, food: fc, body: bc });
  }
  visionTd.appendChild(vt);

  // Direction + food delta rows
  var et = makeTable(['Input', 'Value']);
  this.extraCells = {};
  var dirRow = et.insertRow();
  dirRow.insertCell().textContent = 'Dir';
  this.extraCells.dir = dirRow.insertCell();
  var fdyRow = et.insertRow();
  fdyRow.insertCell().textContent = 'Food ΔY';
  this.extraCells.fdy = fdyRow.insertCell();
  var fdxRow = et.insertRow();
  fdxRow.insertCell().textContent = 'Food ΔX';
  this.extraCells.fdx = fdxRow.insertCell();
  visionTd.appendChild(et);

  // --- Col 2 & 3: Hidden layers ---
  this.hiddenCells = [];
  for (var h = 0; h < hiddenSizes.length; h++) {
    var td = outerRow.insertCell();
    td.setAttribute('valign', 'top');
    td.appendChild(heading('Hidden ' + (h + 1)));
    var ht = document.createElement('table');
    ht.setAttribute('border', '1');
    ht.setAttribute('cellpadding', '2');
    var cells = [];
    for (var n = 0; n < hiddenSizes[h]; n++) {
      var row = ht.insertRow();
      var cell = row.insertCell();
      cell.textContent = '·';
      cells.push(cell);
    }
    this.hiddenCells.push(cells);
    td.appendChild(ht);
  }

  // --- Col 4: Output ---
  var outputTd = outerRow.insertCell();
  outputTd.setAttribute('valign', 'top');
  outputTd.appendChild(heading('Output'));
  var ot = makeTable(['Dir', 'Score', '']);
  this.outputCells = [];
  for (var i = 0; i < 4; i++) {
    var row = ot.insertRow();
    var lc = row.insertCell();
    lc.textContent = DIR_NAMES[i];
    var sc = row.insertCell();
    sc.textContent = '-';
    var mc = row.insertCell();
    mc.textContent = '';
    this.outputCells.push({ label: lc, score: sc, bar: mc, row: row });
  }
  outputTd.appendChild(ot);

  this.decisionEl = heading('');
  outputTd.appendChild(this.decisionEl);

  this.el.appendChild(outer);
  this.built = true;
};

NNPanel.prototype.update = function(engine, net) {
  if (!this.el) return;

  if (!this.built) {
    var sizes = net ? net.layers.slice(1, -1) : [18, 18];
    this.build(sizes);
  }

  var vision = engine.getVision();

  for (var i = 0; i < 8; i++) {
    var base = i * 3;
    this.visionCells[i].wall.textContent = vision[base].toFixed(2);
    this.visionCells[i].food.textContent = vision[base + 1] ? '■' : '·';
    this.visionCells[i].body.textContent = vision[base + 2] ? '■' : '·';
  }

  // Direction + food delta (inputs 24-29)
  if (this.extraCells) {
    var dirNames = ['N', 'E', 'S', 'W'];
    var dirVal = '';
    for (var d = 0; d < 4; d++) {
      if (vision[24 + d]) dirVal = dirNames[d];
    }
    this.extraCells.dir.textContent = dirVal;
    this.extraCells.fdy.textContent = vision[28] != null ? vision[28].toFixed(2) : '-';
    this.extraCells.fdx.textContent = vision[29] != null ? vision[29].toFixed(2) : '-';
  }

  if (!net) {
    this.decisionEl.textContent = '(no model)';
    return;
  }

  var outputs = net.forward(vision);

  if (net.lastActivations) {
    for (var h = 0; h < this.hiddenCells.length; h++) {
      var acts  = net.lastActivations[h + 1];
      var cells = this.hiddenCells[h];
      if (!acts) continue;
      for (var j = 0; j < cells.length && j < acts.length; j++) {
        var v = acts[j];
        cells[j].textContent = v.toFixed(1);
        cells[j].setAttribute('bgcolor', v > 1.0 ? '#a4e4a4' : v > 0.1 ? '#ddf5dd' : '#ffffff');
      }
    }
  }

  var bestIdx = 0;
  for (var i = 1; i < outputs.length; i++) {
    if (outputs[i] > outputs[bestIdx]) bestIdx = i;
  }

  for (var i = 0; i < 4; i++) {
    this.outputCells[i].score.textContent = outputs[i].toFixed(2);
    var chosen = (i === bestIdx);
    this.outputCells[i].row.setAttribute('bgcolor', chosen ? '#ffffaa' : '#ffffff');
    this.outputCells[i].label.innerHTML = chosen
      ? '<b>' + DIR_NAMES[i] + '</b>'
      : DIR_NAMES[i];
    this.outputCells[i].bar.textContent = chosen ? '◀' : '';
  }

  this.decisionEl.textContent = DIR_NAMES[bestIdx];
};

function heading(text, tag) {
  var el = document.createElement(tag || 'h4');
  el.textContent = text;
  return el;
}

function makeTable(headers) {
  var t = document.createElement('table');
  t.setAttribute('border', '1');
  t.setAttribute('cellpadding', '3');
  var hr = t.insertRow();
  for (var i = 0; i < headers.length; i++) {
    var th = document.createElement('th');
    th.textContent = headers[i];
    hr.appendChild(th);
  }
  return t;
}

export default NNPanel;
