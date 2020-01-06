import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  function Square(props) {
      return (
        <button className={props.isWinner ? 'square square--winner' : 'square'} 
                onClick={props.onClick}>
            {props.value}
        </button>
      );
    }
  
  class Board extends React.Component {

    renderSquare(i, x, y) {
      return <Square key={i}
                    value={this.props.squares[i]}
                    isWinner={this.props.winners.indexOf(i) > -1} 
                    onClick={() => this.props.onClick(i, x, y)}/>;
    }
  
    render() {  
            
      let rows = [];
      let n = this.props.n;
      for (let i = 0; i < n; i++) {
        let columns = [];
        for (let j = 0; j < n; j++)
          columns.push(this.renderSquare(i+j+(i*(n-1)), i+1, j+1)); 
        rows.push(<div key={i} className="boardRow">{columns}</div>);
      }      
      return (
         <div>
          {rows}
        </div> 
        );
      }
    } 
  
  class Game extends React.Component {

    constructor(props) {
        super(props);
        let n = Number.parseInt(prompt('Enter the dimension of the game board', ''));
        if (!n || n < 2)
          n = 3;

        let lines = [];
  
          //define horizontal combinations
         for (let i = 0; i < n; i++) {
           let b = [];
           for (let j = 0; j < n; j++)  {
             b.push(i+j+(i*(n-1)))   
           }
           lines.push(b);
         }
          //define vertical combinations
         for (let i = 0; i < n; i++) {
           let b = [];
           for (let j = 0; j < n; j++) {
             b.push(lines[j][i]);
           }
           lines.push(b);
         }
         //define diagonal combinations
         let right = [];
         for(let i = 0; i < n; i++) {
           i === 0 ? right.push(i) : right.push(right[i-1] + n + 1);
         }
         lines.push(right);
         let left = [];
         for(let i = 0; i < n; i++) {
           i === 0 ? left.push(n-1) : left.push(left[i-1] + n - 1);
         }
         lines.push(left);

        this.state = {
            n: n,
            lines: lines,
            history: [
                { 
                  squares: Array(9).fill(null),
                  x: null,
                  y: null,
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            isReverse: false
        };
        
        

        this.handleToggle = this.handleToggle.bind(this);
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNest: (step % 2) === 0,
        });
    }

    handleClick(i, x, y) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (calculateWinner(this.state.n, squares, this.state.lines) || squares[i]) {
            return;
        }
        
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({ 
            history: history.concat([{
                squares: squares,
                x: x,
                y: y
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext, 
        });
    }

    handleToggle() {
      this.setState({isReverse: !this.state.isReverse});
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const calculation = calculateWinner(this.state.n, current.squares, this.state.lines);

        let moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + " y: " + step.y + " x: " + step.x:
                'To game start';
            return (
                <li key={move}>
                    <button className={move===this.state.stepNumber? 'selected-btn' : ''} onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        if (this.state.isReverse)
          moves = moves.reverse();
        

        let status;
        let winners = [];
        if (calculation) {
          status = 'Winner ' + calculation.winner;
          winners = calculation.squares;
        }
        else 
            status = history.length === (this.state.n**2)+1 ? 'Draw' : 'Next move: ' + (this.state.xIsNext ? 'X' : 'O');

        const toggle = <input id="switch" type="checkbox" onClick={this.handleToggle} ></input>
        
        return (
            <div className="game">
            <div className="game-board">
                <Board squares={current.squares} winners={winners} n={this.state.n}
                        onClick={(i, x, y) => this.handleClick(i, x, y)}/>
            </div>
            <div className="game-info">
              <p>Dimenson: {this.state.n} X {this.state.n}</p>
              <hr/>
                <label htmlFor="switch">Descending?</label>
                {toggle}
                <div>{status}</div>
                <ol>{moves}</ol>
            </div>
            </div>
        );
      }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(n, squares, lines) {
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      let count = 0;
      for (let j = 0; j < n - 1; j++) {
        if (squares[currentLine[j]] && squares[currentLine[j]] === squares[currentLine[j + 1]]) {
          count++;
        }
      }
      if (count === n - 1)
        return {winner: squares[currentLine[0]], squares: lines[i]};
    }
    return null;
  }