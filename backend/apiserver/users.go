package apiserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"tasktracker/avatar"
	"time"
	"unicode/utf8"
)

type ListUsersUser struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ListUsersResponse struct {
	Users []ListUsersUser `json:"users"`
}

func (s *ApiServer) ListUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := s.store.Users.All(r.Context())
	if err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	usersResponse := make([]ListUsersUser, 0, len(users))
	for _, u := range users {
		name, _, _ := strings.Cut(u.Email, "@")

		usersResponse = append(usersResponse, ListUsersUser{Id: u.Id, Name: name, Email: u.Email})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ListUsersResponse{Users: usersResponse})
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (r *ChangePasswordRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.CurrentPassword == "" {
		problems["currentPassword"] = "Current password is required"
	}

	if r.NewPassword == "" {
		problems["newPassword"] = "New password is required"
	} else if utf8.RuneCountInString(r.NewPassword) < 8 {
		problems["newPassword"] = "Password must have at least 8 characters"
	} else if !strings.ContainsAny(r.NewPassword, "0123456789") {
		problems["newPassword"] = "Password must contain at least one digit"
	} else if len([]byte(r.NewPassword)) > 72 {
		problems["newPassword"] = "Password is too long"
	} else if r.CurrentPassword == r.NewPassword {
		problems["newPassword"] = "New password must be different"
	}

	return problems
}

func (s *ApiServer) ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(userIdKey).(int64)
	if !ok {
		WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if problems := req.Validate(); len(problems) > 0 {
		WriteValidationError(w, problems)
		return
	}

	existingUser, err := s.store.Users.ByUserId(r.Context(), userId)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if existingUser == nil {
		WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := existingUser.ComparePassword(req.CurrentPassword); err != nil {
		WriteValidationError(w, map[string]string{
			"currentPassword": "Incorrect current password",
		})
		return
	}

	if err := s.store.Users.ChangePasswordAndRevokeSessions(r.Context(), userId, req.NewPassword); err != nil {
		log.Printf("Failed to revoke refresh sessions: %v", err)
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

func (s *ApiServer) ChangeAvatarHandler(w http.ResponseWriter, r *http.Request) {
	const maxUploadBytes int64 = 2 << 20
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes)

	file, _, err := r.FormFile("avatar")
	if err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			WriteError(w, http.StatusRequestEntityTooLarge, "The file is too large")
			return
		}

		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	defer file.Close()

	avatarBytes, err := avatar.ProcessAvatar(file)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid avatar")
		return
	}
}
