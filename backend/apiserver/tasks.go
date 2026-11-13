package apiserver

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"tasktracker/optional"
	"tasktracker/store"
	"time"
)

type CreateTaskRequest struct {
	CreatedByUserId  int64      `json:"created_by_user_id"`
	AssignedToUserId *int64     `json:"assigned_to_user_id"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	Status           string     `json:"status"`
	Priority         string     `json:"priority"`
	DueDate          *time.Time `json:"due_date"`
}

func (r *CreateTaskRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.Title == "" {
		problems["title"] = "Title is required"
	}

	if r.Status != "" &&
		r.Status != "todo" &&
		r.Status != "in_progress" &&
		r.Status != "done" {
		problems["status"] = "Incorrect status"
	}

	if r.Priority != "" &&
		r.Priority != "low" &&
		r.Priority != "medium" &&
		r.Priority != "high" {
		problems["priority"] = "Incorrect priority"
	}

	return problems
}

func (r *CreateTaskRequest) SetDefaults() {
	if r.Status == "" {
		r.Status = "todo"
	}

	if r.Priority == "" {
		r.Priority = "medium"
	}
}

func (s *ApiServer) CreateTaskHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if problems := req.Validate(); len(problems) > 0 {
		WriteValidationError(w, problems)
		return
	}

	req.SetDefaults()

	createdByUserId, ok := r.Context().Value(userIdKey).(int64)
	if !ok {
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	_, err := s.store.Tasks.CreateTask(
		r.Context(),
		store.CreateTaskParams{
			CreatedByUserId:  createdByUserId,
			AssignedToUserId: req.AssignedToUserId,
			Title:            req.Title,
			Description:      req.Description,
			Status:           req.Status,
			Priority:         req.Priority,
			DueDate:          req.DueDate,
		},
	)
	if err != nil {
		log.Printf("failed to create task: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.WriteHeader(http.StatusCreated)
}

type ListTasksResponse struct {
	Tasks []store.Task `json:"tasks"`
}

func (s *ApiServer) ListTasksHandler(w http.ResponseWriter, r *http.Request) {
	tasks, err := s.store.Tasks.All(r.Context())
	if err != nil {
		log.Printf("failed to fetch tasks: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&ListTasksResponse{Tasks: tasks})
}

func (s *ApiServer) ListUserTasksHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value(userIdKey).(int64)

	tasks, err := s.store.Tasks.ByAssignedToUserId(r.Context(), userId)
	if err != nil {
		log.Printf("failed to fetch tasks: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(&ListTasksResponse{Tasks: tasks})
}

type UpdateTaskRequest struct {
	AssignedToUserId optional.Optional[int64]     `json:"assigned_to_user_id"`
	Title            optional.Optional[string]    `json:"title"`
	Description      optional.Optional[string]    `json:"description"`
	Status           optional.Optional[string]    `json:"status"`
	Priority         optional.Optional[string]    `json:"priority"`
	DueDate          optional.Optional[time.Time] `json:"due_date"`
}

func (r *UpdateTaskRequest) Validate() map[string]string {
	problems := make(map[string]string)

	if r.Title.Set {
		if r.Title.Value == nil {
			problems["title"] = "Title cannot be null"
		} else if strings.TrimSpace(*r.Title.Value) == "" {
			problems["title"] = "Title cannot be empty"
		} else if len(*r.Title.Value) > 255 {
			problems["title"] = "Title cannot exceed 255 characters"
		}
	}

	if r.Status.Set {
		if r.Status.Value == nil {
			problems["status"] = "Status cannot be null"
		} else {
			switch *r.Status.Value {
			case "todo", "in_progress", "done":
			default:
				problems["status"] = "Incorrect status"
			}
		}
	}

	if r.Priority.Set {
		if r.Priority.Value == nil {
			problems["priority"] = "Priority cannot be null"
		} else {
			switch *r.Priority.Value {
			case "low", "medium", "high":
			default:
				problems["priority"] = "Incorrect priority"
			}
		}
	}

	if r.AssignedToUserId.Set && r.AssignedToUserId.Value != nil {
		if *r.AssignedToUserId.Value <= 0 {
			problems["assigned_to_user_id"] = "Invalid user ID"
		}
	}

	return problems
}

func (s *ApiServer) UpdateTaskHandler(w http.ResponseWriter, r *http.Request) {
	taskIdStr := r.PathValue("task_id")
	if taskIdStr == "" {
		WriteError(w, http.StatusNotFound, "Invalid task id")
		return
	}

	taskId, err := strconv.ParseInt(taskIdStr, 10, 64)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid task id")
		return
	}

	var req UpdateTaskRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if problems := req.Validate(); len(problems) > 0 {
		WriteValidationError(w, problems)
		return
	}

	params := store.UpdateTaskParams{
		AssignedToUserId: req.AssignedToUserId,
		Title:            req.Title,
		Description:      req.Description,
		Status:           req.Status,
		Priority:         req.Priority,
		DueDate:          req.DueDate,
	}

	_, err = s.store.Tasks.UpdateTask(r.Context(), taskId, params)
	if err != nil {
		if errors.Is(err, store.ErrTaskNotFound) {
			WriteError(w, http.StatusNotFound, "Task not found")
			return
		}

		log.Printf("failed to update task: %v", err)
		WriteError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
