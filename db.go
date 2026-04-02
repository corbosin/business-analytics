package main

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

func openDB() (*sql.DB, error) {
	dsn := "clickhouse://admin:admin@localhost:9000/default?dial_timeout=10s&read_timeout=30s"

	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}

	return db, nil
}