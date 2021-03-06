import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../customcss/custom.css";
const LOG = 0;
const fill_count = 12;
class GRID extends Component {
  state = {
    board: [],
    userEntered: [],
    readOnly : [],
    unsolved: true,
  };

  /** building the grid during mounting phase of the component*/
  componentDidMount() {
    this.buildGrid();
  }

  /**Setting up empty grid*/
  buildGrid = () => {
    var mark = new Array(9);
    var a = new Array(9);
    var read = new Array(9);
    for (var i = 0; i < a.length; ++i) {
      a[i] = new Array(9);
      mark[i] = new Array(9);
      read[i] = new Array(9);
      for (var j = 0; j < a[i].length; ++j) {
        a[i][j] = { r: i, c: j, v: 0 };
        mark[i][j] = false;
        read[i][j] = false;
      }
    }
    this.setState({ board: a, userEntered: mark, unsolved: true ,readOnly:read});
  };

  resetGrid = () => {
    var grid = this.state.board;
    var mark = this.state.userEntered;
    var read = this.state.readOnly;
    for (var row_num = 0; row_num < 9; ++row_num) {
      for (var col_num = 0; col_num < 9; ++col_num) {
        // console.log(grid[row_num][col_num]);
        grid[row_num][col_num].v = 0;
        mark[row_num][col_num] = false;
        read[row_num][col_num] = false;
      }
    }
    this.setState({ board: grid, userEntered: mark,readOnly:read, unsolved: true });
  };
  
  /**
   * READY TO USE
   * 
  */
  buildPuzzle = ()=>{
    let grid,mark,read,vis;
    // while(true){
      this.resetGrid();
      grid = this.state.board;
      mark = this.state.userEntered;
      read = this.state.readOnly;
      vis  = new Array(81);
      /** Here number of cells to fill limit is to be kept under 12 or less for the program to perform optimally */
      let number_of_cells_to_fill = fill_count; //atmost this number of cells will be filled
      for(var i = 0;i<=number_of_cells_to_fill;++i){
        var cell_hash =  Number(Math.floor(Math.random()*80)+1);
        var row_num = Number(Math.floor(cell_hash/9));
        var col_num = Number(Math.floor(cell_hash%9));
        if(LOG)
          console.log("CELL NUMBER : "+cell_hash+" " + row_num + " " + col_num);
        if(Boolean(vis[cell_hash]) === true) continue;
        for(var val = 1;val<10;++val){
          // if(!grid[row_num][col_num]){
          //   console.log("CELL NUMBER : "+cell_hash+" " + row_num + " " + col_num);
          //   continue;
          // }
          grid[row_num][col_num].v = val;
          if(this.validateFill(grid,row_num,col_num)===true){
            // console.log(grid[row_num][col_num]);
            // console.log("here! with "+val);`
            mark[row_num][col_num] = true;//mark this flag for indicating that grid value is priorily set by user or by puzzle builder
            read[row_num][col_num] = true;//mark this cell as readOnly
            vis[cell_hash] = true;//mark this cell visited
            break;
          }
          grid[row_num][col_num].v = 0;
        }
      }
    //   var test = grid;
    //   if(this.fillGrid(test)===true){
    //     break;
    //   }
    // } 
    this.setState({board:grid,userEntered:mark,readOnly:read});
  };

 notifyError = () => {
    if (this.validateSudoku(this.state.board) === false) {
      toast.error("Puzzle is invalid!, rebuild the puzzle again...", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 2000,
      });
    }
  };

  updateValueOnChange = (event) => {
    /**If any new value is inputted by the user, then this function will come in effect*/
    if(LOG === 1){
        console.log("on update value change :: ");
    }
    var row = event.target.dataset.rw;
    var col = event.target.dataset.cl;
    var new_val = event.target.value;
    new_val = Number(new_val % 10);
    var a = this.state.board;
    var mark = this.state.userEntered;
    if(LOG===1)
     console.log(row + " " + col + " "+ new_val + " " + mark[row][col] );
    a[row][col].v = new_val;
    if (this.state.unsolved === true) {
       mark[row][col] = (new_val >= 1 && new_val<=9)? true : false; //mark this cell as userEntered
    }
    if(LOG===1)
     console.log(row + " " + col + " "+ new_val + " " + mark[row][col] );
    event.target.value = new_val===0?' ':new_val; //we update the value the target value to new value here
    this.setState({ board: a, userEntered: mark });
  };

  updateValueOnFocus = (event) => {
    /**
     * when object gets focus
     * console.log("onFocus called " + event.target.dataset);
     * Store the previous value of the element in data-value and reset the value of the element
     */
    if(LOG === 1){
      console.log("onFocus called " + event.target.dataset.value);
    }
    event.target.dataset.value = Number(event.target.value);
    event.target.value = '';
  };

  updateValueOnBlur = (event) => {
    /**when object loses focus
     * console.log("onBlur called " + event.target.dataset.value + "  "+ event.target.value);
     *  If there is now new value inputted and the elemen loses focus then we restore the previous value for it
    */
   if(LOG === 1){
      console.log("onBlur called " + event.target.dataset.value + "  "+ event.target.value);
   }
    if (event.target.value === '') {
      let val = Number(event.target.dataset.value);
      event.target.value = val===0?'':val;
    }
  };

  showgrid() {
    const { board } = this.state;
    var self = this;
    // console.log(self);
    // console.log(self.state.board);
    /**To add borders betweem 3*3 blocks use colgroup*/
    return (
      <React.Fragment>
        <div>
        <span>SUDOKU</span>
        </div>
        <table id="grid" align="center">
          <colgroup><col /><col /><col /></colgroup>
          <colgroup><col /><col /><col /></colgroup>
          <colgroup><col /><col /><col /></colgroup>
          {
            // IMIF->rows
            (function () {
              // console.log(self);
              var blocks = new Array(0);
              var blocknum = 0;
              for (var rownum = 0; rownum < board.length; rownum += 3) {
                  ++blocknum;
                  var blockId = blocknum+" "+ rownum;
                  var rows = new Array(0);
                  for (var i = rownum; i < rownum + 3; ++i) {
                    var row = "r" + (i + 1);
                    // console.log(row);
                    rows.push(
                      <tr
                        id={row}
                        key={row}
                      >
                        {
                          // IMIF->columns
                          (function (rid) {
                            // console.log(self);
                            var cols = new Array(0);
                            for (var cid = 0; cid < board[rid].length; ++cid) {
                              var cellId = rid + "" + cid;
                              // console.log(col);
                              let cell = self.state.board[rid][cid];
                              var val = self.state.board[rid][cid].v;
                              val = val === 0 || isNaN(val)?" ":val;
                              var readonly =  self.state.readOnly[rid][cid];
                              let classesBtn = "btn text-black";
                              let classesCell =
                                "border border-black  text-black bg-" +
                                (self.state.userEntered[rid][cid] === true
                                  ? (readonly===true?"warning":"light")
                                  : "white");
                                cols.push(
                                  <td id={cellId} key={cellId} className={classesCell}>
                                    <input
                                      id = {cellId}
                                      className={classesBtn}
                                      size="1"
                                      key={cell}
                                      onChange={self.updateValueOnChange}
                                      onFocus={self.updateValueOnFocus}
                                      onBlur={self.updateValueOnBlur}
                                      data-rw={rid}
                                      data-cl={cid}
                                      value={val}
                                      // type="number"
                                      min="0"
                                      max="9"
                                      placeholder=" "
                                      readOnly={Boolean(readonly)}
                                    />
                                  </td>
                                );
                            }
                            return cols;
                          })(i)
                        }
                      </tr>
                    );
                  }
                  blocks.push(<tbody id={blockId} key={blockId} >{rows}</tbody>);
              }
              return blocks;
            })()
          }
        </table>
      </React.Fragment>
    );
  }

  
  valuesCheck(grid, N) {
    for (var row = 0; row < N; ++row) {
      var cnt = new Array(N + 1);
      for (var i = 0; i < N + 1; ++i) cnt[i] = 0;
      for (var col = 0; col < N; ++col) {
        var val = grid[row][col].v;
        if (val < 0 || val > 9) return 0;
      }
    }
    // console.log(grid);
    return 1;
  }

  RowCheck(grid, N) {
    for (var row = 0; row < N; ++row) {
      var cnt = new Array(N + 1);
      for (var i = 0; i < N + 1; ++i) cnt[i] = 0;
      for (var col = 0; col < N; ++col) {
        var val = grid[row][col].v;
        if (val !== 0) {
          cnt[val] += 1;
          if (cnt[val] > 1) return 0;
        }
      }
    }
    return 1;
  }

  ColCheck(grid, N) {
    for (var col = 0; col < N; ++col) {
      var cnt = new Array(N + 1);
      for (var i = 0; i < N + 1; ++i) cnt[i] = 0;
      for (var row = 0; row < N; ++row) {
        var val = grid[row][col].v;
        if (val !== 0) {
          cnt[val] += 1;
          if (cnt[val] > 1) return 0;
        }
      }
    }
    return 1;
  }
/**
 * 
 * To check a particular 3*3 cell for multiple occurrences of same element
 */
  BlockCheck(grid,start_row,start_col){
    var occ = new Array(11);
    for(let i = 0;i<11;++i){
       occ[i] = 0;
    }
    // console.log("Col : "+start_col + " " + Math.floor(start_col/3) + " " +Math.round(start_col/3) );
    let blk_row = Math.floor(3*Math.floor(start_row/3));
    let blk_col = Math.floor(3*Math.floor(start_col/3));
    // console.log("block col : "+blk_col +" ,"+ (blk_col+3));
    for(var row = blk_row;row < (blk_row+3);row++){
      for(var col = blk_col;col < (blk_col+3);col++){
        // console.log(row +" : " + col);
          var val = grid[row][col].v;
          if(val!==0){
            occ[val]++;
            if(occ[val]>1) return 0;
          }     
      }
    }
    return 1;
  }

  RowCheckII(grid,row){
    const N = grid.length;
    let occ = new Array(11);
    for(let i = 0;i<11;++i){
       occ[i] = 0;
    }
    for(let col = 0;col < N;++col){
      var val = grid[row][col].v;
      if(val!==0){
        occ[val]++;
        if(occ[val]>1) return 0;
      }     
    }
    return 1;
  }

  ColCheckII(grid,col){
    const N = grid.length;
    let occ = new Array(11);
    for(let i = 0;i<11;++i){
       occ[i] = 0;
    }
    for(let row = 0;row < N;++row){
      var val = grid[row][col].v;
      if(val!==0){
        occ[val]++;
        if(occ[val]>1) return 0;
      } 
    }
    return 1;
  }

  validateFill(grid,row,col){
    if (this.RowCheckII(grid,row) === 0) return false;
    if (this.ColCheckII(grid,col) === 0) return false;
    if (this.BlockCheck(grid,row,col) === 0) return false;
    return true;
  }

  CellCheck(grid, N) {
    var dp = new Array(3);
    for (var i = 0; i < 3; ++i) {
      dp[i] = new Array(3);
      for (var j = 0; j < 3; ++j) {
        dp[i][j] = new Array(N + 1);
        for (var k = 0; k < N + 1; ++k) dp[i][j][k] = 0;
      }
    }
    for (var row = 0; row < N; ++row) {
      for (var col = 0; col < N; ++col) {
        var val = grid[row][col].v;
        if (val !== 0) {
          var r = Math.floor(row / 3);
          var c = Math.floor(col / 3);
          dp[r][c][val]++;
          // console.log(r + " " + c + " " + val +" "+  dp[r][c][val]);
          if (dp[r][c][val] > 1) return 0;
        }
      }
    }
    return 1;
  }

  /**To do the validation of the grid*/
  validateSudoku(grid) {
    // console.log(grid);
    const N = grid.length;
    /**Data Check */
    if (this.valuesCheck(grid, N) === 0) return false;
    if (LOG === 1) console.log("Values Check : pass");
    /**Row Checks*/
    if (this.RowCheck(grid, N) === 0) return false;
    if (LOG === 1) console.log("RowCheck : pass");
    /**Col Checks*/
    if (this.ColCheck(grid, N) === 0) return false;
    if (LOG === 1) console.log("ColCheck : pass");
    /**Cell Checks*/
    if (this.CellCheck(grid, N) === 0) return false;
    if (LOG === 1) console.log("CellCheck : pass");
    return true;
  }


  fillGrid(grid, row, col, N) {
    if (row === N) {
      // if(this.validateSudoku(grid) === true) return true; 
      return true;
    }
    var next_row;
    var next_col;
    if (Number(grid[row][col].v) === 0) {
      for (var val = 1; val <= 9; ++val) {
        grid[row][col].v = val;
        if (this.validateFill(grid,row,col) === true) {
          next_col = (col + 1) % N;
          next_row = row + (next_col === 0 ? 1 : 0);
          if (this.fillGrid(grid, next_row, next_col, N)) {
            return true;
          }
        }
        grid[row][col].v = 0;
      }
    } else {
      next_col = (col + 1) % N;
      next_row = row + (next_col === 0 ? 1 : 0);
      if (this.fillGrid(grid, next_row, next_col, N)) {
        return true;
      }
    }
    return false;
  }

  solveGrid = () => {
    if (LOG === 1) 
      console.log("Solving Puzzle....");
    var grid = this.state.board;
    var ok_fill = this.fillGrid(grid, 0, 0, grid.length) === true ? 1 : 0;
    if (ok_fill === 1 && this.validateSudoku(grid) === true) {
      this.setState({ board: grid, unsolved: false });
    }
    else{
      console.log("Not able to solve the grid..." + ok_fill);
    }
  }

  render() {
    return (
      <React.Fragment>
        <main className="container" onLoad={this.buildGrid}>
          {this.showgrid()}
        </main>
        <div className="nav justify-content-center bg-white">
          <button className="btn btn-info m-1 sm" onClick={this.resetGrid}>
            Reset Puzzle
          </button>
          <button className="btn btn-info m-1 sm" onClick={this.buildPuzzle}>
            Build Puzzle
          </button>
          <button
            className="btn btn-success m-1 sm"
            onClick={() => {
              this.solveGrid();
              this.notifyError();
            }}
          >
            Solve Puzzle
          </button>
          <ToastContainer />
        </div>
      </React.Fragment>
    );
  }

}

export default GRID;
