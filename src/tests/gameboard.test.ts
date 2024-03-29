import { expect, it, describe, beforeEach } from "vitest";
import GameBoard from "../gameTemplates/gameboard";
import setupBoard from "../utilities/2dBattleshipArray";
import Ship from "../gameTemplates/ship";

const boardTemplate = [
    ['0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    ['1', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['2', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['3', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['4', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['5', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['6', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['7', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['8', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['9', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
    ['10', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',],
];

let gameBoard: GameBoard;

beforeEach(() => {
    gameBoard = new GameBoard();
});

describe('Board coordinates', () => {
    it('gameBoard instance should be equal to boardTemplate.', () => {
        expect(gameBoard.getBoard()).toEqual(boardTemplate);
    });
});

//  placing ship coordinates are arranged (up to down), (left to right) starting from initial square.
describe('Seek ship placement', () => {
    it('vertical ship(3) on coordinates 1-3 should be true with returning coordinates [1,3], [2,3], [3,3].', () => {
        const cruiser = new Ship(3);
        expect(gameBoard.seekCoordinates(cruiser, '1-3')).toEqual(
            { canBePlaced:true, coordinates:[[1,3], [2,3], [3,3]] }
        );
    });

    it('vertical ship(5) on coordinates 8-10 should be false with returning coordinates [8,10], [9,10], [10,10].', () => {
        const carrier = new Ship(5);
        expect(gameBoard.seekCoordinates(carrier, '8-10')).toEqual(
            { canBePlaced:false, coordinates:[[8,10], [9,10], [10,10]] }
        );
    });

    it('horizontal ship(4) on coordinates 2-7 should be true with returning coordinates [2,7], [2,8], [2,9], [2,10].', () => {
        const battleship = new Ship(4);
        battleship.toggleDirection();
        expect(gameBoard.seekCoordinates(battleship, '2-7')).toEqual(
            { canBePlaced:true, coordinates:[[2,7], [2,8], [2,9], [2,10]] }
        );
    });

    it('vertical ship(5) on coordinates 2-9 after placing horizontal ship(2) on coordinates 3-9 should be false with returning coordinates [2,9], [3,9], [4,9], [5,9], [6,9].', () => {
        const destroyer = new Ship(2);
        destroyer.toggleDirection();
        gameBoard.placeShip(destroyer, '3-9', 'd');
        const carrier = new Ship(5);

        expect(gameBoard.seekCoordinates(carrier, '2-9')).toEqual(
            { canBePlaced:false, coordinates:[[2,9], [3,9], [4,9], [5,9], [6,9]] }
        );
    });
});

describe('Marking ship characters on board', () => {
    let modifiedBoard: string[][];

    beforeEach(() => {
        modifiedBoard = setupBoard();
    });

    it('vertical battleship(4) on coordinates 7-4 should be equal to modified board.', () => {
        modifiedBoard[7][4] = 'b';
        modifiedBoard[8][4] = 'b';
        modifiedBoard[9][4] = 'b';
        modifiedBoard[10][4] = 'b';

        const battleship = new Ship(4);
        gameBoard.placeShip(battleship, '7-4', 'b');

        expect(gameBoard.getBoard()).toEqual(modifiedBoard);
    });

    it('horizontal destroyer(2) on coordinates 8-7 and vertical submarine(3) on coordinates 2-3 should be equal to modified board.', () => {
        modifiedBoard[8][7] = 'd';
        modifiedBoard[8][8] = 'd';
        modifiedBoard[2][3] = 's';
        modifiedBoard[3][3] = 's';
        modifiedBoard[4][3] = 's';

        const destroyer = new Ship(2);
        destroyer.toggleDirection();
        const submarine = new Ship(3);
        gameBoard.placeShip(destroyer, '8-7', 'd');
        gameBoard.placeShip(submarine, '2-3', 's');

        expect(gameBoard.getBoard()).toEqual(modifiedBoard);
    });

    it('horizontal cruiser(3) on coordinates 3-3 will not be marked on board after placing vertical battleship(4) on coordinates 2-5', () => {
        modifiedBoard[2][5] = 'b';
        modifiedBoard[3][5] = 'b';
        modifiedBoard[4][5] = 'b';
        modifiedBoard[5][5] = 'b';

        const battleship = new Ship(4);
        const cruiser = new Ship(3);
        cruiser.toggleDirection();
        gameBoard.placeShip(battleship, '2-5', 'b');
        gameBoard.placeShip(cruiser, '3-3', 'r');

        expect(gameBoard.getBoard()).toEqual(modifiedBoard);
    });
});

describe('ships status', () => {
    let battleship:Ship;
    let cruiser:Ship;
    let destroyer:Ship;

    beforeEach(() => {
        battleship = new Ship(4);
        cruiser = new Ship(3);
        destroyer = new Ship(2);

        battleship.toggleDirection();
        cruiser.toggleDirection();

        gameBoard.placeShip(battleship, '1-7', 'b');
        gameBoard.placeShip(cruiser, '2-4', 'r');
        gameBoard.placeShip(destroyer, '3-7', 'd');
    });

    it('must hit ship if attacked on its coordinate.', () => {
        const char = 'd';
        gameBoard.receiveAttack([3,7]);

        expect(gameBoard.getShipsStatus()[char]).toEqual(
            {
                hits: 1,
                sunk: false
            }
        );
    });

    it('ship should sink if amount of hits is equal to its length.', () => {
        const char = 'r';
        gameBoard.receiveAttack([2,4]);
        gameBoard.receiveAttack([2,5]);
        gameBoard.receiveAttack([2,6]);

        expect(gameBoard.getShipsStatus()[char]).toEqual(
            {
                hits: 3,
                sunk: true
            }
        );
    });
});

describe('game board states', () => {
    let submarine:Ship;
    let destroyer:Ship;

    beforeEach(() => {
        submarine = new Ship(3);
        destroyer = new Ship(2);

        gameBoard.placeShip(submarine, '8-1', 's');
        gameBoard.placeShip(destroyer, '3-7', 'd');
    });

    it('missed attack should return "miss" with right coordinates and square-key', () => {
        expect(gameBoard.receiveAttack([2,5])).toEqual(
            { state: 'miss', squareKey: '.', coordinates: [[2,5]] }
        );
    });

    it('attacked ship should return "hit" with right coordinates and square-key', () => {
        expect(gameBoard.receiveAttack([8,1])).toEqual(
            { state: 'hit', squareKey:'s', coordinates: [[8,1]] }
        );
    });

    it('attacked ship on its last square should return "sunk" along with its square-key and all coordinates', () => {
        gameBoard.receiveAttack([9,1]);
        gameBoard.receiveAttack([10,1]);

        expect(gameBoard.receiveAttack([8,1])).toEqual(
            { state: 'sunk', squareKey: 's', coordinates: [[8,1], [9,1], [10,1]] }
        );
    });

    it('last ship attack on its last square should return "game-over" along with its square-key and all coordinates', () => {
        gameBoard.receiveAttack([9,1]);
        gameBoard.receiveAttack([10,1]);
        gameBoard.receiveAttack([8,1]);
        gameBoard.receiveAttack([3,7]);

        expect(gameBoard.receiveAttack([4,7])).toEqual(
            { state: 'game-over', squareKey: 'd', coordinates: [[3,7], [4,7]] }
        );
    });

    it('should reset gameBoard', () => {
        gameBoard.reset();

        expect(gameBoard.getShipsStatus()).toEqual({});
        expect(gameBoard.getBoard()).toEqual(setupBoard());
    });
});
