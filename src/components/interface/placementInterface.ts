import generateBoard from '../../utilities/battleshipBoardInterface';
import '../style/placement.scss';

interface PlayersData {
    vsComputer: boolean;
    players: string[];
}

interface shipOffsetData {
    direction: string;
    span: number;
}

const ships= document.querySelectorAll('.ship');
const boardsPanel = document.querySelector('.boards-panel')!;
let board1: HTMLDivElement;
let board2: HTMLDivElement;

let shipOffsetData: shipOffsetData;

function getPlayerData() {
    const playersDataJson:string = localStorage.getItem('battleship-players-data')!;
    const playersData:PlayersData = JSON.parse(playersDataJson) as PlayersData;
    return playersData;
}

function setupBoardGame() {
    boardsPanel.innerHTML = '';

    board1 = generateBoard();
    board2 = generateBoard();

    board1.setAttribute('data-index', '0');
    board2.setAttribute('data-index', '1');
    boardsPanel.appendChild(board1);
    boardsPanel.appendChild(board2);

    const squares = document.querySelectorAll('.square[data-coord]');
    squares.forEach(square => {
        square.addEventListener('dragenter', dragenter);
        square.addEventListener('dragleave', dragleave);
    });
}

function toggleShipDirection() {
    this.dataset.vertical === 'false'?
    this.setAttribute('data-vertical', 'true'):
    this.setAttribute('data-vertical', 'false');
}

function setShipOffsetData(e:Event) {
    const shipElement = e.target as HTMLDivElement;

    const totalShipSquares:number = parseInt(shipElement.dataset.length);
    let direction: string;
    let shipLength: number;
    let offset: number;

    shipElement.dataset.vertical === 'true'? direction='top': direction='left';

    if (shipElement.dataset.vertical === 'true') {
        shipLength = shipElement.offsetHeight;
        offset = e.offsetY;
    } else {
        shipLength = shipElement.offsetWidth;
        offset = e.offsetX;
    }

    const offsetPercentage:number = Math.round(offset / shipLength * 100);
    let shipCurrentSquare:number = Math.round(totalShipSquares * offsetPercentage / 100);
    if (shipCurrentSquare < 1) shipCurrentSquare = 1;
    const span:number = shipCurrentSquare - 1;

    shipOffsetData = { direction, span };
}

function getCoordOffsetData(e:Event) {
    const currentSquareDiv = e.target as HTMLDivElement;
    const currentCoordinates = currentSquareDiv.dataset.coord?.split('-')
                              .map(x => parseInt(x));
    const { direction, span } = shipOffsetData;

    return [ currentCoordinates, direction, span ]; 
}

function dragging(e:Event) {
    setShipOffsetData(e);   
    this.classList.add('dragging');
}

function dragend() {
    this.classList.remove('dragging');
}

function dragenter(e:Event) {
    // this.style.background = 'green';
    const offsetData = getCoordOffsetData(e);
    console.log(offsetData);
}

function dragleave() {
    this.style.background = 'none';
}

export function initialize() {
    setupBoardGame();
    console.log(getPlayerData());

    ships.forEach(ship => {
        ship.addEventListener('click', toggleShipDirection);
        ship.addEventListener('dragstart', dragging);
        ship.addEventListener('dragend', dragend);
    });
}

//  squareSeeker
//  highlight dragenter squares
