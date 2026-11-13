package apiserver

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type contextKey string

const userIdKey = contextKey("userId")

func (s *ApiServer) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if !strings.HasPrefix(authHeader, "Bearer ") {
			WriteError(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		var token string
		if parts := strings.Split(authHeader, "Bearer "); len(parts) == 2 {
			token = parts[1]
		}

		if token == "" {
			WriteError(w, http.StatusUnauthorized, "Invalid authorization header")
			return
		}

		tokenClaims, err := s.tokenManager.Parse(token)
		if err != nil {
			WriteError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		if tokenClaims.TokenType != "access" {
			WriteError(w, http.StatusUnauthorized, "Invalid token type")
			return
		}

		userId, err := strconv.ParseInt(tokenClaims.Subject, 10, 64)
		if err != nil {
			WriteError(w, http.StatusUnauthorized, "Invalid user ID")
			return
		}

		_, err = s.store.Users.ByUserId(r.Context(), userId)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteError(w, http.StatusUnauthorized, "Authentication required")
				return
			}

			WriteError(w, http.StatusInternalServerError, "Internal server error")
			return
		}

		ctx := context.WithValue(r.Context(), userIdKey, userId)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
