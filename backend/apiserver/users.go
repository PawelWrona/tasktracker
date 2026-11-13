package apiserver

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
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
	currentPassword string `json:"current_password"`
	newPassword     string `json:"new_password"`
}

func (r *ChangePasswordRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.currentPassword == "" {
		problems["currentPassword"] = "current password is required"
	}

	if r.newPassword == "" {
		problems["newPassword"] = "new password is required"
	} else if r.currentPassword == r.newPassword {
		problems["newPassword"] = "passwords must be different"
	}

	return problems
}

func (s *ApiServer) ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(userIdKey).(int64)

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
		WriteError(w, http.StatusUnauthorized, "User does not exist")
		return
	}

	if err := existingUser.ComparePassword(req.currentPassword); err != nil {
		WriteError(w, http.StatusUnauthorized, "Invalid current password")
		return
	}

	if err := s.store.Users.ChangePassword(r.Context(), userId, req.newPassword); err != nil {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
