import Ship from "./ship";
import setupBoard from "../utilities/2dBattleshipArray";
type playerShips = Record<string, Ship>;
type shipCoordinates = Record<string, number[][]>;

export default class GameBoard {
    private board: string[][];
    private ships: playerShips;
    private shipCoordinates: shipCoordinates;

    constructor() {
        this.board = setupBoard();
        this.ships = {};
        this.shipCoordinates = {};
    }

    reset() {
        this.board = setupBoard();
        this.ships = {};
        this.shipCoordinates = {};
    }

    checkAllSunk() {
        let allSunk = true;
        for (const char in this.ships) {
            if (!this.ships[char].isSunk()) {
                allSunk = false;
                break;
            }
        }
        return allSunk;
    }

    seekCoordinates(ship:Ship, square:string) {
        const length:number = ship.getLength();
        const direction:string = ship.getDirection();
        let x = parseInt(square.split('-')[0]);
        let y = parseInt(square.split('-')[1]);

        let canBePlaced  = true;    
        const coordinates:number[][] = [];

        for(let i = 0; i < length; i++) {
            if ( x > 10 || y > 10 ){
                canBePlaced = false;
                break;
            }
            if (this.board[x][y] !== '.') canBePlaced = false;
            coordinates.push([x,y]);
            direction === 'vertical'? x++: y++;
        }

        return {canBePlaced, coordinates};
    }

    private markBoard(char:string, square:number[]) {
        const x = square[0];
        const y = square[1];
        this.board[x][y] = char;
    }

    private setShipCoordinates(char:string, square:number[]) {
        const x = square[0];
        const y = square[1];
        this.shipCoordinates[char].push([x,y]);
    }

    //  responsible for ship placement before the game.
    //  if seekCoordinates() returns true, it will setup the ships and shipCoordinates object with their corresponding characters,
    //  and marks the 2d array board.
    placeShip(ship:Ship, square:string, char:string) {
        const seekPlacement = this.seekCoordinates(ship, square);
        if (seekPlacement.canBePlaced === false) return;

        this.shipCoordinates[char] = [];
        seekPlacement.coordinates.forEach((square:number[]) => {
            this.markBoard(char, square);
            this.setShipCoordinates(char, square);
        });

        this.ships[char] = ship;
    }

    hitShip(char:string, square:number[]) {
        this.ships[char].hit();

        if (this.ships[char].isSunk()) {
            return this.checkAllSunk()?
            {state: 'game-over', coordinates: this.getShipCoordinates(char), squareKey: char}:
            {state: 'sunk', coordinates: this.getShipCoordinates(char), squareKey: char};
        } else {
            return { state: 'hit', coordinates: [square], squareKey: char }
        }
    }

    //  attacking a square will return one of 4 states, and a list / single pair of coordinates.
    //  States - miss, hit, sunk, game-over.
    //  the coordinates are collected for UI animations, AI player, avoiding attack repetitions. 
    receiveAttack(square: number[]) {
        const x = square[0];
        const y = square[1];
        const hitChar = this.board[x][y];

        if (hitChar === '.') {
            this.markBoard('o', square);
            return { state:'miss', coordinates: [[x, y]], squareKey: hitChar };
        } else {
            this.markBoard('x', square);
            return this.hitShip(hitChar, [x,y]);
        }
    }

    getShipCoordinates(char:string) {
        return this.shipCoordinates[char];
    }

    getShipsStatus() {
        type shipStatus = Record<string, {
                hits: number,
                sunk: boolean
            }>;

        const shipsStatus: shipStatus = {};

        for (const property in this.ships) {
            const ship = this.ships[property];

            shipsStatus[property] = {
                hits: ship.numOfHits(),
                sunk: ship.isSunk()
            }
        }
        
        return shipsStatus;
    }

    getBoard() {
        return [...this.board];
    }
}
