
// 
// GAME OF LIFE OBJECT
//

Meteor.startup( function() {

  GameOfLife = {

    // Parameteres
    rows: Cells.rows,
    cols: Cells.cols,

    // Cache copies of states
    cell_states: [],
    cell_states_tmp: [],

    init: function() {
      // GOL Initialization

      // Create matrices
      this.cell_states = Array.matrix(this.rows, this.cols, 0);
      this.cell_states_tmp = Array.matrix(this.rows, this.cols, 0);

      // Sync initial states
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          this.cell_states[row][col] = Cells.findOne({ row: row, col: col }).alive;
        }
      }
    },

    reset: function() {
      // Kill all cells
      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          Cells.update({row: row, col: col}, {$set: {alive: 0}});
        }
      }
    },

    toggleState: function(id) {
      // Toggle a cell state
      var doc = Cells.findOne(id)
      var new_state = undefined;
      if (doc.alive === 0) { new_state = 1; } else { new_state = 0; }
      Cells.update(id, { $set: { alive: new_state } });
    },

    cellAlive: function(row, col) {
      return this.cell_states[row][col];
    },

    neighboursAlive: function(row, col) {
      // Neighbours alive for a given cell
      var na = (this.cell_states[row][col] !== 0) ? -1 : 0;
      for (var h = -1; h <= 1; h++) {
        for (var w = -1; w <= 1; w++) {
          var tmp_row = row + h;
          var tmp_col = col + w;
          if ((tmp_row >= 0 && tmp_row < this.rows) &&
             (tmp_col >= 0 && tmp_col < this.cols)) {
            if (this.cell_states[tmp_row][tmp_col] === 1) {
              na++;
            }
          }
        }
      }
      return na;
    },

    updateTempValue: function(row, col) {
      // GOL Step Logic

      na        = this.neighboursAlive(row, col);
      alive     = this.cellAlive(row, col);
      tmp_alive = alive;

      if ((na < 2) && (alive === 1)) {
        // Any live cell with fewer than two live neighbours dies
        // , as if caused by under-population
        tmp_alive = 0;

      } else if ((na > 3) && (alive === 1)) {
        // Any live cell with two or three live neighbours 
        // lives on to the next generation.
        tmp_alive = 0;

      } else if ((na === 3) && (alive === 0)) {
        // Any dead cell with exactly three live neighbours becomes 
        // a live cell, as if by reproduction.
        tmp_alive = 1;

      }

      // Update temp cache matrix
      this.cell_states_tmp[row][col] = tmp_alive;
    },

    updateValue: function(row, col) {
      // Updates DB value
      Cells.update(
        { row: row, col: col }, 
        { $set: { alive: this.cell_states_tmp[row][col] } } 
      );
    },

    step: function() {
      // Game of Life step

      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          this.updateTempValue(row, col);
        }
      }

      for (var row = 0; row < this.rows; row++) {
        for (var col = 0; col < this.cols; col++) {
          this.updateValue(row, col);
        }
      }
    }
  };
  
});

