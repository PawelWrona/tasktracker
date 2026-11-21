package apiserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *SignUpRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.Email == "" {
		problems["email"] = "email is required"
	}

	if r.Password == "" {
		problems["password"] = "password is required"
	}

	return problems
}

func (s *ApiServer) SignUpHandler(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if problems := req.Validate(); len(problems) > 0 {
		WriteValidationError(w, problems)
		return
	}

	existingUser, err := s.store.Users.ByEmail(r.Context(), req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if existingUser != nil {
		WriteError(w, http.StatusConflict, "User with this email already exists")
		return
	}

	_, err = s.store.Users.CreateUser(r.Context(), req.Email, req.Password)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.WriteHeader(http.StatusCreated)
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *SignInRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.Email == "" {
		problems["email"] = "email is required"
	}

	if r.Password == "" {
		problems["password"] = "password is required"
	}

	return problems
}

type SignInResponse struct {
	AccessToken string `json:"access_token"`
}

func (s *ApiServer) SignInHandler(w http.ResponseWriter, r *http.Request) {
	var req SignInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if problems := req.Validate(); len(problems) > 0 {
		WriteValidationError(w, problems)
		return
	}

	existingUser, err := s.store.Users.ByEmail(r.Context(), req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Printf("failed to fetch user data: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if existingUser == nil {
		WriteError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	if err := existingUser.ComparePassword(req.Password); err != nil {
		WriteError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	accessToken, err := s.tokenManager.GenerateAccessToken(existingUser.Id)
	if err != nil {
		log.Printf("failed to generate user access token: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	refreshTokenExpiresAt := time.Now().Add(30 * 24 * time.Hour)
	refreshToken, err := s.tokenManager.GenerateRefreshToken(existingUser.Id, refreshTokenExpiresAt)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	refreshTokenHash := HashToken(refreshToken)
	_, err = s.store.RefreshSessions.CreateRefreshSession(r.Context(), existingUser.Id, refreshTokenHash)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/auth",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Expires:  refreshTokenExpiresAt,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&SignInResponse{AccessToken: accessToken})
}

func (s *ApiServer) SignOutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err == nil {
		refreshTokenHash := HashToken(cookie.Value)
		if deleteErr := s.store.RefreshSessions.DeleteByTokenHash(r.Context(), refreshTokenHash); deleteErr != nil {
			log.Printf("Failed to delete refresh session: %v", deleteErr)
			WriteError(w, http.StatusInternalServerError, "Internal server error")
			return
		}
	} else if !errors.Is(err, http.ErrNoCookie) {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	w.WriteHeader(http.StatusNoContent)
}

type TokenRefreshResposne struct {
	AccessToken string `json:"access_token"`
}

func (s *ApiServer) TokenRefreshHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			WriteError(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	oldRefreshToken := cookie.Value
	oldRefreshTokenClaims, err := s.tokenManager.Parse(oldRefreshToken)
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			oldRefreshTokenHash := HashToken(oldRefreshToken)

			if deleteErr := s.store.RefreshSessions.DeleteByTokenHash(r.Context(), oldRefreshTokenHash); deleteErr != nil {
				log.Printf("Failed to delete expired refresh session: %v", deleteErr)
			}
		}

		WriteError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}
	if oldRefreshTokenClaims.TokenType != "refresh" {
		WriteError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	userId, err := strconv.ParseInt(oldRefreshTokenClaims.Subject, 10, 64)
	if err != nil {
		WriteError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	newAccessToken, err := s.tokenManager.GenerateAccessToken(userId)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	newRefreshToken, err := s.tokenManager.GenerateRefreshToken(userId, oldRefreshTokenClaims.ExpiresAt.Time)
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	newRefreshTokenHash := HashToken(newRefreshToken)
	oldRefreshTokenHash := HashToken(oldRefreshToken)
	if err := s.store.RefreshSessions.UpdateRefreshSessionTokenHash(r.Context(), userId, newRefreshTokenHash, oldRefreshTokenHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			WriteError(w, http.StatusUnauthorized, "Invalid refresh token")
			return
		}

		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		Path:     "/api/auth",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Expires:  oldRefreshTokenClaims.ExpiresAt.Time,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&TokenRefreshResposne{AccessToken: newAccessToken})
}
