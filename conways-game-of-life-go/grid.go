package main

import (
	"math/rand"
	"time"
)

type Grid struct {
	cells  [][]bool
	width  int
	height int
}

func NewGrid(widht, height int) *Grid {
	g := &Grid{
		cells:  make([][]bool, height),
		width:  widht,
		height: height,
	}

	for i := range g.cells {
		g.cells[i] = make([]bool, widht)
	}

	return g
}

func (g *Grid) countNeighbour(x, y int) int {
	var n int
	for dy := -1; dy <= 1; dy++ {
		for dx := -1; dx <= 1; dx++ {
			if dx == 0 && dy == 0 {
				continue
			}

			nx := (x + dx + g.width) % g.width
			ny := (y + dy + g.height) % g.height

			if g.cells[ny][nx] {
				n++
			}
		}
	}

	return n
}

func (g *Grid) nextGeneration() {
	next := NewGrid(g.width, g.height)

	for y := 0; y < g.height; y++ {
		for x := 0; x < g.width; x++ {
			neighbours := g.countNeighbour(x, y)
			alive := g.cells[y][x]

			if alive && (neighbours == 2 || neighbours == 3) {
				next.cells[y][x] = true
			} else if !alive && (neighbours == 3) {
				next.cells[y][x] = true
			}
		}
	}
	g.cells = next.cells
}

func (g *Grid) getBrailleChar(col, row int) string {
	baseBraile := 0x2800
	baseX := col * 2
	baseY := row * 4

	pattern := 0

	if baseY < g.height && baseX < g.width && g.cells[baseY][baseX] {
		pattern |= 0x01 // dot 1
	}
	if baseY < g.height && baseX+1 < g.width && g.cells[baseY][baseX+1] {
		pattern |= 0x08 // dot 4
	}

	// Row 1
	if baseY+1 < g.height && baseX < g.width && g.cells[baseY+1][baseX] {
		pattern |= 0x02 // dot 2
	}
	if baseY+1 < g.height && baseX+1 < g.width && g.cells[baseY+1][baseX+1] {
		pattern |= 0x10 // dot 5
	}

	// Row 2
	if baseY+2 < g.height && baseX < g.width && g.cells[baseY+2][baseX] {
		pattern |= 0x04 // dot 3
	}
	if baseY+2 < g.height && baseX+1 < g.width && g.cells[baseY+2][baseX+1] {
		pattern |= 0x20 // dot 6
	}

	if baseY+3 < g.height && baseX < g.width && g.cells[baseY+3][baseX] {
		pattern |= 0x40 // dot 7
	}
	if baseY+3 < g.height && baseX+1 < g.width && g.cells[baseY+3][baseX+1] {
		pattern |= 0x80 // dot 8
	}

	runeVal := rune(baseBraile + pattern)
	return string(runeVal)
}

func (g *Grid) render() {
	displayCols := (g.width + 1) / 2
	displayRows := (g.height + 3) / 4

	for row := range displayRows {
		for col := range displayCols {
			print(g.getBrailleChar(col, row))
		}
		if row < displayRows-1 {
			println()
		}
	}
}

func (g *Grid) Randomize() {
	seed := int64(time.Now().UnixNano())
	n := rand.New(rand.NewSource(seed))

	for y := range g.height {
		for x := range g.width {
			g.cells[y][x] = n.Float64() < 0.1
		}
	}
}

func (g *Grid) clearCursor() {
	print("\033[H")
}

func (g *Grid) Run() {
	for {
		g.clearCursor()
		g.render()
		g.nextGeneration()
		time.Sleep(33 * time.Millisecond)
	}
}
