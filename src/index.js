/**
 * Created by topher on 12/07/2017.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {range} from "lodash";
import './index.css';

class Cell extends React.Component {

    handleClick = () => {
        this.props.onClick(this.props.row, this.props.col);
    };

    render() {
        let cellClasses = "cell";
        cellClasses += (this.props.isSelected ? " selected" : "");
        cellClasses += (this.props.isFilled ? " filled" : "");
        return <div onClick={this.handleClick} className={cellClasses}></div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        let cells = [];
        for (let i = 0; i < this.props.rows; i++) {
            let rows = [];
            for (let j = 0; j < this.props.cols; j++) {
                rows.push({ row: i, col: j, isSelected: false, isFilled: true });
            }
            cells.push(rows);
        }

        //select a random cell to unfill
        let row = Math.floor(Math.random() * this.props.rows);
        let col = Math.floor(Math.random() * this.props.cols);
        cells[row][col].isFilled = false;

        this.state = {
            cells: cells,
            selectedCell: null,
            filledCellCount: this.props.rows * this.props.cols - 1
        };
    }

    updateCell = (row, column, properties) => {
        let cells = this.state.cells.slice();
        cells[row][column] = Object.assign(cells[row][column], properties);
        this.setState({ cells: cells});
    }

    selectCell = (row, column) => {
        let cell = this.state.cells[row][column];
        if (cell.isSelected) {
            this.updateCell(row, column, { isSelected: false });
            this.setState({ selectedCell: null} );
        } else {
            if (!this.state.selectedCell) {
                if (cell.isFilled) {
                    this.updateCell(row, column, { isSelected: true });
                    this.setState({ selectedCell: this.state.cells[row][column] });
                }
            } else {
                if (!cell.isFilled) {
                    let skippedCell = this.getSkippedCell(this.state.selectedCell, cell);
                    if (skippedCell && skippedCell.isFilled === true) {
                        this.updateCell(row, column, { isFilled: true, isSelected: false});
                        this.updateCell(skippedCell.row, skippedCell.col, { isFilled: false} );
                        this.updateCell(this.state.selectedCell.row, this.state.selectedCell.col, { isFilled: false, isSelected: false });
                        this.setState({ selectedCell: null, filledCellCount: this.state.filledCellCount - 1 });
                    }
                }
            }
        }
    }

    hasWon() {
        return this.state.filledCellCount === 1;
    }

    hasLost() {
        if (this.hasWon())  {
            return false;
        }
        for (let i = 0; i < this.props.rows; i++) {
            for (let j = 0; j < this.props.cols; j++) {
                if (this.cellCanBeSkipped(i, j)) {
                    return false;
                }
            }
        }
        return true;
    }

    cellCanBeSkipped(row, column) {
        let cell = this.state.cells[row][column];
        if (cell.isFilled) {
            if (column > 0 && column < this.props.cols - 1) {
                let leftCell = this.state.cells[row][column - 1];
                let rightCell = this.state.cells[row][column + 1];
                if ((leftCell.isFilled && !rightCell.isFilled) || (!leftCell.isFilled && rightCell.isFilled)) {
                    return true;
                }
            }
            if (row > 0 && row < this.props.rows - 1) {
                let topCell = this.state.cells[row - 1][column];
                let bottomCell = this.state.cells[row + 1][column];
                if ((topCell.isFilled && !bottomCell.isFilled) || (!topCell.isFilled && bottomCell.isFilled)) {
                    return true;
                }
            }
        }
        return false;
    }

    getSkippedCell(sourceCell, destCell) {
       let sourceRow = sourceCell.row,
           sourceCol = sourceCell.col,
           destRow = destCell.row,
           destCol = destCell.col;
       if ((sourceRow === destRow && Math.abs(sourceCol - destCol) === 2)
            || sourceCol === destCol && Math.abs(sourceRow - destRow) === 2) {
           return this.state.cells[(sourceRow + destRow)/2][(sourceCol + destCol)/2];
       }
       return null;
    }

    renderRow(rowIndex) {
        return <div className="cell-row" key={rowIndex}>
            {range(0, this.props.cols).map(colIndex => (
                <Cell
                    onClick={this.selectCell}
                    key={rowIndex + '-' + colIndex}
                    {...this.state.cells[rowIndex][colIndex]} />
            ))}
        </div>;
    }

    render() {
        let status = this.hasWon() ? "You Win!!!" : (this.hasLost() ? "You Lost!!!" : "");
        return (
            <div>
                <div className="status">{status}</div>
                <div>{range(0, this.props.rows).map(i => this.renderRow(i))}</div>
            </div>
        );
    }
}

ReactDOM.render(<Game rows={4} cols={4}/>, document.getElementById('root'));
