package database

import (
	"context"
	"fmt"
	"tasktracker/config"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func NewPostgresDb(conf *config.Config) (*sqlx.DB, error) {
	dsn := conf.DatabaseUrl()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	db, err := sqlx.ConnectContext(ctx, "postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to postgres database: %w", err)
	}

	return db, nil
}
