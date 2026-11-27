package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"tasktracker/apiserver"
	"tasktracker/config"
	"tasktracker/database"
	"tasktracker/storage"
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

	r2Storage, err := storage.NewR2Storage(ctx, config.R2Bucket, config.R2AccessKeyId, config.R2SecretAccessKey, config.S3EndpointUrl)
	if err != nil {
		return fmt.Errorf("failed to initialize R2 storage: %w", err)
	}

	apiserver := apiserver.New(config, dataStore, tokenManager, r2Storage)

	if err := apiserver.Start(ctx); err != nil {
		return err
	}

	return nil
}
