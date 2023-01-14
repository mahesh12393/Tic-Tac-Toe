import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Square(props) {
  return (
    <button className= {props.isWinner? "winningSquare" :  "square"}
     onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  // constructor(props){
  //   super(props);
  //   //this.state={
  //   //}
  // }
  // setWinningPattern(winningList) {
  //   this.setState({
  //     winningPattern:winningList,
  //   })
  // }
  indexExistsInWinner(idx){
    console.log("winning list at this point is ",this.props.winningList);
    if(!this.props.winningList) return false;

    if(this.props.winningList[0] === idx || this.props.winningList[1] === idx || this.props.winningList[2] === idx) {
      return true;
    }
    return false;
  }
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => {
          this.props.onClick(i);
        }}
        isWinner={this.indexExistsInWinner(i)}
      />
    );
  }
  render() {
    let squareCount = 0;
    const wholeSquares = [];
    for (let i = 0; i < 3; i++) {
      const squaresRow = [];
      for (let j = 0; j < 3; j++) {
        squaresRow.push(squareCount);
        squareCount++;
      }
      wholeSquares.push(squaresRow);
    }
    //console.log("the squares array cnstructed is ", wholeSquares);
    return (
      <div>
        {wholeSquares.map((currentSquareRow, idx) => {
          return (
            <div className="board-row" key={idx}>
              {currentSquareRow.map((squareElements, idx) => {
                return this.renderSquare(squareElements);
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      xIsNext: true,
      moveNumber: 0,
      markedSquareList: [],
      selectedPreviousMove: -1, //so initially nothing is selected.
      movesReverse: false,
      isGameCompleted:false,
      winningList:[]
    };
  }

  handleClick(idx) {
    const valueX = "X";
    const valueO = "O";
    const wholeHistory = this.state.history.slice(0, this.state.moveNumber + 1); //not takes the final index as we also want the last move number we increment it by 1.
    const latestHistory = wholeHistory[wholeHistory.length - 1];
    const latestSquares = latestHistory.squares.slice();
    if (latestSquares[idx] || calculateWinner(latestSquares)) {
      return; //if any square is already filled or game is alreasy over not to handle click
    }
    latestSquares[idx] = this.state.xIsNext ? valueX : valueO;
    const updatedMarkedSquaresList = this.state.markedSquareList.slice();
    updatedMarkedSquaresList.push(idx);

    this.setState({
      history: wholeHistory.concat([
        {
          squares: latestSquares,
        },
      ]),
      xIsNext: !this.state.xIsNext,
      moveNumber: wholeHistory.length,
      markedSquareList: updatedMarkedSquaresList,
    });
    console.log("clicked on squares ", idx);
  }

  moveToStep(idx) {
    this.setState({
      moveNumber: idx,
      xIsNext: idx % 2 === 0, // every even move X will be playing
      selectedPreviousMove: idx,
    });
  }
  handleWinningList(value){
    this.setState({
      winningList:value,
    })
  }
  render() {
    const valueX = "X";
    const valueO = "O";
    const gamehistory = this.state.history.slice();
    const historyMoves = gamehistory.map((currentSquares, moveIndex) => {
      let description;
      if (moveIndex === 0) {
        description = "Restart the game";
      } else {
        const row = parseInt(this.state.markedSquareList[moveIndex - 1] / 3); //becuae our first move will be in 0th index as e are extra showing restart game as the first game sao to get actual index we should do -1
        const col = this.state.markedSquareList[moveIndex - 1] % 3;
        description =
          "Go to move " +
          moveIndex +
          " at location in format of (col,row) is " +
          col +
          " " +
          row;
      }
      //console.log("the selected previous move is ",this.state.selectedPreviousMove);
      return (
        <>
          <li key={moveIndex}>
            <button
              key={moveIndex}
              onClick={() => {
                this.moveToStep(moveIndex);
              }}
              className={
                moveIndex === this.state.selectedPreviousMove
                  ? "selectedMoveBoxStyle"
                  : "moveBoxStyle" //which has no styles.
              }
            >
              {description}
            </button>
          </li>
        </>
      );
    });
    const moves = this.state.movesReverse
      ? historyMoves.reverse()
      : historyMoves;
    const currentGame = gamehistory[this.state.moveNumber];
    const winner = calculateWinner(currentGame.squares);
    const NumberOfMoves = this.state.markedSquareList.length;
    let status;
    if (winner) {
      status = `Winner is : ${winner[0]}`; //because patern is there in 1st arg,
    } else if (NumberOfMoves < 9) {
      //even if equal 9 and winner is not decided then it is a draww
      status = `Next player: ${this.state.xIsNext ? valueX : valueO}`;
    } else {
      status = "Hard Luck, the match is draw!!";
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            key={currentGame.squares}
            squares={currentGame.squares}
            onClick={(i) => this.handleClick(i)}
            setWinningPattern={this.state.winningList}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        <div>
          <button
            onClick={() => {
              this.setState({
                movesReverse: !this.state.movesReverse,
              });
            }}
          >
            Toggle Moves History
          </button>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      console.log("the order of winning partern is ", lines[i]);
      return [squares[a],lines[i]];
    }
  }
  return null;
}
