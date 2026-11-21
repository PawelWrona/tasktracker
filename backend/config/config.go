package config

import (
	"fmt"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	ApiServerHost     string `env:"APISERVER_HOST"`
	ApiServerPort     string `env:"APISERVER_PORT"`
	DBName            string `env:"DB_NAME"`
	DBHost            string `env:"DB_HOST"`
	DBUser            string `env:"DB_USER"`
	DBPassword        string `env:"DB_PASSWORD"`
	DBPort            int    `env:"DB_PORT"`
	DBUrl             string `env:"DB_URL"`
	JWTSecret         string `env:"JWT_SECRET"`
	R2AccessKeyId     string `env:"R2_ACCESS_KEY_ID"`
	R2SecretAccessKey string `env:"R2_SECRET_ACCESS_KEY"`
	R2Bucket          string `env:"R2_BUCKET"`
	S3EndpointUrl     string `env:"S3_ENDPOINT_URL"`
}

func (c *Config) DatabaseUrl() string {
	return fmt.Sprintf(
		"postgresql://%s:%s@%s:%d/%s?sslmode=disable",
		c.DBUser,
		c.DBPassword,
		c.DBHost,
		c.DBPort,
		c.DBName,
	)
}

func New() (*Config, error) {
	cfg, err := env.ParseAs[Config]()
	if err != nil {
		return nil, fmt.Errorf("Failed to load config: %w", err)
	}

	return &cfg, nil
}
