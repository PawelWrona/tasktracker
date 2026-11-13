package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"tasktracker/apiserver"
	"tasktracker/config"
	"tasktracker/database"
	"tasktracker/store"
)

func main() {
	ctx := context.Background()

	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer cancel()

	config, err := config.New()
	if err != nil {
		return err
	}

	db, err := database.NewPostgresDb(config)
	if err != nil {
		return err
	}
	defer db.Close()

	dataStore := store.New(db)

	tokenManager := apiserver.NewTokenManager(config)

	apiserver := apiserver.New(config, dataStore, tokenManager)

	if err := apiserver.Start(ctx); err != nil {
		return err
	}

	return nil
}
