package main

import (
	"flag"
	"fmt"
	"os"
	"os/user"
	"path/filepath"
	"syscall"
	"time"
)

func main() {
	allFlag := flag.Bool("a", false, "show hidden files")
	longFlag := flag.Bool("l", false, "use long listing format")

	flag.Parse()

	path := "."
	if flag.NArg() > 0 {
		path = flag.Arg(0)
	}

	files, err := os.ReadDir(path)
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	for _, file := range files {

		name := file.Name()

		if !*allFlag && name[0] == '.' {
			continue
		}

		if *longFlag {
			printLong(path, file)
		} else {
			fmt.Println(name)
		}
	}
}

func printLong(path string, entry os.DirEntry) {

	fullPath := filepath.Join(path, entry.Name())

	info, err := os.Stat(fullPath)
	if err != nil {
		return
	}

	stat := info.Sys().(*syscall.Stat_t)

	uid := fmt.Sprint(stat.Uid)
	gid := fmt.Sprint(stat.Gid)

	u, err := user.LookupId(uid)
	if err == nil {
		uid = u.Username
	}

	g, err := user.LookupGroupId(gid)
	if err == nil {
		gid = g.Name
	}

	mode := info.Mode()
	size := info.Size()
	modTime := info.ModTime().Format("Jan _2 15:04")

	fmt.Printf(
		"%s %3d %8s %8s %8d %s %s\n",
		mode,
		stat.Nlink,
		uid,
		gid,
		size,
		modTime,
		entry.Name(),
	)
}
