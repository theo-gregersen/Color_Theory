document.addEventListener("keydown", keypressHandler, false);

var GM;
var ACT;

// NOT LOADING NEW CODE???

// handles game control input (arrow keys and r)
function keypressHandler(event) {
    var key = event.which || event.keyCode;

    if (key == 37) { window.GM.makeMove("left") }
    else if (key == 39) { window.GM.makeMove("right") }
    else if (key == 38) { window.GM.makeMove("up") }
    else if (key == 40) { window.GM.makeMove("down") }
    else if (key == 82) { window.GM.newGame() }

    if (window.GM.loseCheck()) {
        alert("game over");
    }
}

function GameManager() {
    this.lost = false;
    this.won = false;
    this.game = new Grid(4);
}

GameManager.prototype.newGame = function () {
    this.lost = false;
    this.won = false;
    for (var i = 0; i < this.game.tileList.length; i++) { // still broken
        this.game.removeTile(this.game.tileList[i]);
    }
    this.game = new Grid(4);
    this.game.addNewTile();
    ACT.updateGraphics(this.game);
}

GameManager.prototype.makeMove = function (direction) {
    this.game.moveAllTiles(direction);
    this.game.addNewTile();
    ACT.updateGraphics(this.game);
}

GameManager.prototype.loseCheck = function () { // incorrect logic!
    this.lost = true;
    return this.game.spacesLeft().length == 0;
}

// represents a position in the tile grid
function GridPosition(x, y) {
    this.x = x;
    this.y = y;
}

// represents a Grid for tiles
function Grid(size) {
    this.size = size;
    this.grid = this.buildGrid();
    this.nextTileId = 0;
    this.tileList = [];
}

// returns a 2D array filled with null spaces
Grid.prototype.buildGrid = function () {
    var grid = [];
    for (var y = 0; y < this.size; y++) {
        var row = [];
        for (var x = 0; x < this.size; x++) {
            row.push(null);
        }
        grid.push(row);
    }
    return grid;
}

// returns an array of available GridPositions
Grid.prototype.spacesLeft = function () {
    var spaces = [];
    var itry = 0;
    for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
            if (this.grid[y][x] == null) {
                spaces.push(new GridPosition(x, y));
            }
        }
    }
    return spaces;
}

// returns a random GridPosition from available spaces
Grid.prototype.randomAvailableSpace = function () {
    var spaces = this.spacesLeft();
    if (spaces.length > 0) {
        var s = spaces[(Math.floor(Math.random() * spaces.length))];
        return s;
    }
}

// creates a new tile and adds it to a random available spot in the grid, updates the grid's nextTileId
Grid.prototype.addNewTile = function () {
    position = this.randomAvailableSpace();
    newTile = new Tile(position, randomColor(), "tile" + this.nextTileId);
    this.grid[position.y][position.x] = newTile;
    this.tileList.push(newTile);
    var newDiv = document.createElement("div");
    newDiv.className = "tile";
    newDiv.id = "tile" + this.nextTileId;
    this.nextTileId += 1;
    document.getElementById("grid").appendChild(newDiv);
}

// removes a tile from the game
Grid.prototype.removeTile = function (tile) {
    this.grid[tile.position.y][tile.position.x] = null;
    var index = this.tileList.indexOf(tile);  
    if (index !== -1) this.tileList.splice(index, 1);
    var element = document.getElementById(tile.id);
    element.parentNode.removeChild(element);
}

// changes a tile's position in the grid
Grid.prototype.moveTile = function (tile, direction) {
    var currentPosition = tile.position;
    this.grid[currentPosition.y][currentPosition.x] = null;
    var newPosition = tile.findMoveSpot(direction, this.grid);
    var newCell = this.grid[newPosition.y][newPosition.x];
    if (newCell != null && newCell.color == tile.color) {
        this.mergeTiles(newCell, tile);
    } else {
        tile.moveTo(newPosition);
        this.grid[newPosition.y][newPosition.x] = tile;
    }
}

// doubles one tile's color and removes the other
Grid.prototype.mergeTiles = function (tileToDouble, tileToRemove) {
    tileToDouble.color = tileToDouble.color + tileToRemove.color;
    this.removeTile(tileToRemove);
}

// applies changes to grid based off movement
Grid.prototype.moveAllTiles = function (direction) {
    if (direction == "left") { // start left to right
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                var tile = this.grid[y][x];
                if (tile != null) {
                    this.moveTile(tile, "left");
                }
            }
        }
    } else if (direction == "right") { // start right to left
        for (var y = 0; y < this.size; y++) {
            for (var x = this.size - 1; x >= 0; x--) {
                var tile = this.grid[y][x];
                if (tile != null) {
                    this.moveTile(tile, "right");
                }
            }
        }
    } else if (direction == "up") { // start top to bottom
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                var tile = this.grid[y][x];
                if (tile != null) {
                    this.moveTile(tile, "up");
                }
            }
        }
    } else if (direction == "down") { // start bottom to top
        for (var x = 0; x < this.size; x++) {
            for (var y = this.size - 1; y >= 0; y--) {
                var tile = this.grid[y][x];
                if (tile != null) {
                    this.moveTile(tile, "down");
                }
            }
        }
    }
}

// represents a color tile
function Tile(position, color, id) {
    this.position = position;
    this.color = color;
    this.id = id;
}

// returns a GridPosition representing the spot the tile will be moved to
Tile.prototype.findMoveSpot = function (direction, grid) {
    if (direction == "left") {
        for (var i = 0; i < grid.length; i++) {
            var cell = grid[this.position.y][i];
            if (cell == null || cell.color == this.color) {
                return new GridPosition(i, this.position.y);
            }
        }
    } else if (direction == "right") {
        for (var i = grid.length - 1; i >= 0; i--) {
            var cell = grid[this.position.y][i];
            if (cell == null || cell.color == this.color) {
                return new GridPosition(i, this.position.y);
            }
        }
    } else if (direction == "up") {
        for (var i = 0; i < grid.length; i++) {
            var cell = grid[i][this.position.x];
            if (cell == null || cell.color == this.color) {
                return new GridPosition(this.position.x, i);
            }
        }
    } else if (direction == "down") {
        for (var i = grid.length - 1; i >= 0; i--) {
            var cell = grid[i][this.position.x];
            if (cell == null || cell.color == this.color) {
                return new GridPosition(this.position.x, i);
            }
        }
    }
    return this.position;
}

// changes the tile's position to the provided one
Tile.prototype.moveTo = function (newPosition) {
    this.position = newPosition;
}

// returns a GridPosition containing the tile's position in pixel values
Tile.prototype.pixelPosition = function () {
    var style = getComputedStyle(document.documentElement);
    var tileSize = parseInt(style.getPropertyValue('--ts-constant'), 10);
    var gridSpacing = parseInt(style.getPropertyValue('--grid-spacing'), 10);
    var pxx = this.position.x * (tileSize + 11); // why is gridspacing not the right interval?
    var pxy = this.position.y * (tileSize + 11);
    return new GridPosition(pxx, pxy);
}

// returns a random primary color
function randomColor() {
    return 1;
}

// handles graphics updates
function Actuator() {

}

// combined tile is being removed from list
// updates tile positions and colors
Actuator.prototype.updateGraphics = function (grid) {
    for (var i = 0; i < grid.tileList.length; i++) {
        cur = document.getElementById(grid.tileList[i].id);
        position = grid.tileList[i].pixelPosition();
        cur.style.left = (position.x).toString() + "px";
        cur.style.top = (position.y).toString() + "px";
        cur.innerHTML = grid.tileList[i].color;
    }
}

// function for onload events
function startup() {
    window.ACT = new Actuator();
    window.GM = new GameManager();
    window.GM.newGame();
}