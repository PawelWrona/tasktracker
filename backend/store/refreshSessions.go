package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type RefreshSessionStore struct {
	db *sqlx.DB
}

func NewRefreshSessionStore(db *sqlx.DB) *RefreshSessionStore {
	return &RefreshSessionStore{
		db: db,
	}
}

type RefreshSession struct {
	Id        int64     `db:"id" json:"id"`
	UserId    int64     `db:"user_id" json:"user_id"`
	TokenHash string    `db:"token_hash" json:"token_hash"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

func (s *RefreshSessionStore) CreateRefreshSession(ctx context.Context, userId int64, tokenHash string) (*RefreshSession, error) {
	const dml = "INSERT INTO refresh_sessions (user_id, token_hash) VALUES($1, $2) RETURNING *;"

	var refreshSession RefreshSession
	if err := s.db.GetContext(ctx, &refreshSession, dml, userId, tokenHash); err != nil {
		return nil, fmt.Errorf("Failed to insert new refresh session: %w", err)
	}

	return &refreshSession, nil
}

func (s *RefreshSessionStore) UpdateRefreshSessionTokenHash(
	ctx context.Context,
	userId int64,
	newTokenHash string,
	oldTokenHash string,
) error {
	const dml = `
		UPDATE refresh_sessions 
		SET token_hash = $1, updated_at = NOW() 
		WHERE token_hash = $2 AND user_id = $3
		RETURNING *;
	`

	result, err := s.db.ExecContext(ctx, dml, newTokenHash, oldTokenHash, userId)
	if err != nil {
		return fmt.Errorf("Failed to update refresh session: %w", err)
	}

	numberOfRowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("Failed to get affected rows: %w", err)
	}

	if numberOfRowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (s *RefreshSessionStore) DeleteByTokenHash(ctx context.Context, tokenHash string) error {
	const dml = "DELETE FROM refresh_sessions WHERE token_hash = $1;"

	result, err := s.db.ExecContext(ctx, dml, tokenHash)
	if err != nil {
		return fmt.Errorf("Failed to delete refresh session: %w", err)
	}

	numberOfRowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("Failed to get affected rows: %w", err)
	}

	if numberOfRowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (s *RefreshSessionStore) DeleteAllByUserId(ctx context.Context, userId int64) error {
	const dml = "DELETE FROM refresh_sessions WHERE user_id = $1"

	_, err := s.db.ExecContext(ctx, dml, userId)
	if err != nil {
		return fmt.Errorf("failed to delete refresh sessions: %w", err)
	}

	return nil
}

func (s *RefreshSessionStore) ByTokenHash(ctx context.Context, tokenHash string) (*RefreshSession, error) {
	const dml = "SELECT * FROM refresh_sessions WHERE token_hash = $1;"

	var refreshSession RefreshSession
	if err := s.db.GetContext(ctx, &refreshSession, dml, tokenHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("Refresh session with token_hash %s does not exist: %w", tokenHash, err)
		}

		return nil, fmt.Errorf("Failed to fetch refresh session by token_hash %s: %w", tokenHash, err)
	}

	return &refreshSession, nil
}
