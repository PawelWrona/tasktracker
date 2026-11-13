package apiserver

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"tasktracker/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var signingMethod = jwt.SigningMethodHS256

type tokenManager struct {
	config *config.Config
}

func NewTokenManager(config *config.Config) *tokenManager {
	return &tokenManager{config: config}
}

type tokenClaims struct {
	TokenType string `json:"token_type"`
	jwt.RegisteredClaims
}

func (t *tokenManager) GenerateAccessToken(userId int64) (string, error) {
	claims := tokenClaims{
		TokenType: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			Issuer:    "http://" + t.config.ApiServerHost + ":" + t.config.ApiServerPort,
			Subject:   strconv.FormatInt(userId, 10),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(t.config.JWTSecret))
	if err != nil {
		return "", fmt.Errorf("Failed to create access token: %w", err)
	}

	return signedToken, nil
}

func (t *tokenManager) GenerateRefreshToken(userId int64, expiresAt time.Time) (string, error) {
	claims := tokenClaims{
		TokenType: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			Issuer:    "http://" + t.config.ApiServerHost + ":" + t.config.ApiServerPort,
			Subject:   strconv.FormatInt(userId, 10),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(t.config.JWTSecret))
	if err != nil {
		return "", fmt.Errorf("Failed to create refresh token: %w", err)
	}

	return signedToken, nil
}

func (t *tokenManager) Parse(tokenString string) (*tokenClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&tokenClaims{},
		func(token *jwt.Token) (any, error) {
			return []byte(t.config.JWTSecret), nil
		},
		jwt.WithExpirationRequired(),
		jwt.WithIssuer("http://"+t.config.ApiServerHost+":"+t.config.ApiServerPort),
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*tokenClaims)
	if !ok {
		return nil, fmt.Errorf("Incorrect token claims: %v", token.Claims)
	}

	return claims, nil
}

func HashToken(tokenString string) string {
	hasher := sha256.New()
	hasher.Write([]byte(tokenString))

	return hex.EncodeToString(hasher.Sum(nil))
}
