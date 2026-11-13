package apiserver

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Message string            `json:"message"`
	Errors  map[string]string `json:"errors,omitempty"`
}

func WriteValidationError(w http.ResponseWriter, problems map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)

	json.NewEncoder(w).Encode(
		ErrorResponse{
			Message: "Validation failed",
			Errors:  problems,
		},
	)
}

func WriteError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	json.NewEncoder(w).Encode(
		ErrorResponse{
			Message: message,
		},
	)
}
