package main

import (
	"log"
	"net/http"
)

func main() {
	db, err := openDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/query", queryHandler(db))
	http.HandleFunc("/filter-options", filterOptionsHandler(db))

	http.Handle("/", http.FileServer(http.Dir("./static")))

	log.Println("server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}