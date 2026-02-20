package main

import (
	"os"
	"os/signal"

	"golang.org/x/term"
)

func main() {
	setupCleanUp()
	print("\033[?25l")

	fd := int(os.Stdout.Fd())
	w, h, err := term.GetSize(fd)

	var gridWidth, gridHeight int

	if err != nil {
		gridWidth = 80
		gridHeight = 24
	} else {
		gridWidth = w * 2
		gridHeight = h * 4
	}

	game := NewGrid(gridWidth, gridHeight)
	game.Randomize()
	game.Run()

}

func setupCleanUp() {
	c := make(chan os.Signal, 1)

	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		print("\033[?25h")

		os.Exit(0)
	}()
}
