package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"tasktracker/optional"
	"time"

	"github.com/jmoiron/sqlx"
)

type TaskStore struct {
	db *sqlx.DB
}

type Task struct {
	Id               int64      `db:"id" json:"id"`
	CreatedByUserId  int64      `db:"created_by_user_id" json:"created_by_user_id"`
	AssignedToUserId *int64     `db:"assigned_to_user_id" json:"assigned_to_user_id"`
	Title            string     `db:"title" json:"title"`
	Description      *string    `db:"description" json:"description"`
	Status           string     `db:"status" json:"status"`
	Priority         string     `db:"priority" json:"priority"`
	DueDate          *time.Time `db:"due_date" json:"due_date"`
	CreatedAt        time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at" json:"updated_at"`
}

func NewTaskStore(db *sqlx.DB) *TaskStore {
	return &TaskStore{
		db: db,
	}
}

var ErrTaskNotFound = errors.New("task not found")

type CreateTaskParams struct {
	CreatedByUserId  int64
	AssignedToUserId *int64
	Title            string
	Description      string
	Status           string
	Priority         string
	DueDate          *time.Time
}

func (s *TaskStore) CreateTask(ctx context.Context, params CreateTaskParams) (*Task, error) {
	const dml = `
		INSERT INTO tasks(
			created_by_user_id, 
			assigned_to_user_id, 
			title, 
			description, 
			status, 
			priority, 
			due_date
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING *;
	`

	var task Task
	if err := s.db.GetContext(
		ctx,
		&task,
		dml,
		params.CreatedByUserId,
		params.AssignedToUserId,
		params.Title,
		params.Description,
		params.Status,
		params.Priority,
		params.DueDate,
	); err != nil {
		return nil, fmt.Errorf("Failed to create new task: %w", err)
	}

	return &task, nil
}

func (s *TaskStore) All(ctx context.Context) ([]Task, error) {
	const dml = `SELECT * FROM tasks;`

	tasks := make([]Task, 0)
	if err := s.db.SelectContext(ctx, &tasks, dml); err != nil {
		return nil, fmt.Errorf("Failed to fetch tasks: %w", err)
	}

	return tasks, nil
}

func (s *TaskStore) ByAssignedToUserId(ctx context.Context, userId int64) ([]Task, error) {
	const dml = `SELECT * FROM tasks WHERE assigned_to_user_id = $1;`

	tasks := make([]Task, 0)
	if err := s.db.SelectContext(ctx, &tasks, dml, userId); err != nil {
		return nil, fmt.Errorf("Failed to fetch tasks by assigned_to_user_id %d: %w", userId, err)
	}

	return tasks, nil
}

type UpdateTaskParams struct {
	AssignedToUserId optional.Optional[int64]
	Title            optional.Optional[string]
	Description      optional.Optional[string]
	Status           optional.Optional[string]
	Priority         optional.Optional[string]
	DueDate          optional.Optional[time.Time]
}

func (s *TaskStore) UpdateTask(ctx context.Context, taskId int64, params UpdateTaskParams) (*Task, error) {
	const dml = `
        UPDATE tasks
        SET
            assigned_to_user_id = CASE
                WHEN $1::boolean THEN $2::bigint
                ELSE assigned_to_user_id
            END,
            title = CASE
                WHEN $3::boolean THEN $4::varchar
                ELSE title
            END,
            description = CASE
                WHEN $5::boolean THEN $6::text
                ELSE description
            END,
            status = CASE
                WHEN $7::boolean THEN $8::varchar
                ELSE status
            END,
            priority = CASE
                WHEN $9::boolean THEN $10::varchar
                ELSE priority
            END,
            due_date = CASE
                WHEN $11::boolean THEN $12::timestamptz
                ELSE due_date
            END,
            updated_at = NOW()
        WHERE id = $13
        RETURNING *;
    `

	var task Task

	if err := s.db.GetContext(
		ctx,
		&task,
		dml,
		params.AssignedToUserId.Set,
		params.AssignedToUserId.Value,
		params.Title.Set,
		params.Title.Value,
		params.Description.Set,
		params.Description.Value,
		params.Status.Set,
		params.Status.Value,
		params.Priority.Set,
		params.Priority.Value,
		params.DueDate.Set,
		params.DueDate.Value,
		taskId,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrTaskNotFound
		}

		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return &task, nil
}
