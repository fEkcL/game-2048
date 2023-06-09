import { Grid } from "./grid.js"
import { Tile } from "./tile.js"

const gameBoard = document.getElementById('game-board')

const grid = new Grid(gameBoard)
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))

setupInputOnce()

function setupInputOnce() {
    window.addEventListener('keydown', handleInput, {once: true})
}

async function handleInput(event) {
    switch (event.key) {
        case 'ArrowLeft':
            if (!canMoveLeft()) {
                setupInputOnce()
                return
            }
            await moveLeft()
            break
        case 'ArrowUp':
            if (!canMoveUp()) {
                setupInputOnce()
                return
            }
            await moveUp()
            break
        case 'ArrowRight':
            if (!canMoveRight()) {
                setupInputOnce()
                return
            }
            await moveRight()
            break
        case 'ArrowDown':
            if (!canMoveDown()) {
                setupInputOnce()
                return
            }
            await moveDown()
            break

        default:
            setupInputOnce()
            return
    }

    const newTile = new Tile(gameBoard)
    grid.getRandomEmptyCell().linkTile(newTile)

    if (!canMoveLeft() && !canMoveUp() && !canMoveRight() && !canMoveDown()) {
        await newTile.waitForAnimationEnd()
        alert('Game over 🥲')
    }

    setupInputOnce()
}

async function moveUp() {
    await slideTiles(grid.cellsGroupedByColumn)
}

async function moveDown() {
    await slideTiles(grid.cellsGroupedByReversedColumn)
}

async function moveLeft() {
    await slideTiles(grid.cellsGroupedByRow)
}

async function moveRight() {
    await slideTiles(grid.cellsGroupedByReversedRow )
}

async function slideTiles(groupedCells) {
    const promises = []

    groupedCells.forEach(group => sideTilesInGroup(group, promises))

    await Promise.all(promises)

    grid.cells.forEach(cell => {
        cell.hasTileForMarge() && cell.mergeTiles()
    })
}

function sideTilesInGroup(group, promises) {
    for (let i = 1; i < group.length; i++) {
        if (group[i].isEmpty()) {
            continue
        }

        const cellWhitTile = group[i]

        let targetCell
        let j = i - 1
        while (j >= 0 && group[j].canAccept(cellWhitTile.linkedTile)) {
            targetCell = group[j]
            j--
        }

        if (!targetCell) {
            continue
        }

        promises.push(cellWhitTile.linkedTile.waitForTransitionEnd())

        if (targetCell.isEmpty()) {
            targetCell.linkTile(cellWhitTile.linkedTile)
        } else {
            targetCell.linkTileForMarge(cellWhitTile.linkedTile)
        }

        cellWhitTile.unlinkTile()
    }
}

function canMoveUp() {
    return canMove(grid.cellsGroupedByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsGroupedByReversedColumn)
}

function canMoveLeft() {
    return canMove(grid.cellsGroupedByRow)
}

function canMoveRight() {
    return canMove(grid.cellsGroupedByReversedRow)
}

function canMove(groupedCells) {
    return groupedCells.some(group => canMoveInGroup(group))
}

function canMoveInGroup(group) {
    return group.some((cell, index) => {
        if (index === 0) {
            return false
        }

        if (cell.isEmpty()) {
            return false
        }

        const targetCell = group[index -1]
        return targetCell.canAccept(cell.linkedTile)
    })
}