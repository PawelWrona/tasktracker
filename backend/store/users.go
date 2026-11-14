package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type UserStore struct {
	db *sqlx.DB
}

type User struct {
	Id             int64     `db:"id" json:"id"`
	Email          string    `db:"email" json:"email"`
	HashedPassword string    `db:"password_hash" json:"-"`
	Created_at     time.Time `db:"created_at" json:"created_at"`
	Updated_at     time.Time `db:"updated_at" json:"updated_at"`
}

func NewUserStore(db *sqlx.DB) *UserStore {
	return &UserStore{
		db: db,
	}
}

var ErrUserNotFound = errors.New("user not found")

func (s *UserStore) CreateUser(ctx context.Context, email string, password string) (*User, error) {
	const dml = "INSERT INTO users (email, password_hash) VALUES($1, $2) RETURNING *;"

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("Failed to hash password: %w", err)
	}

	var user User
	if err := s.db.GetContext(ctx, &user, dml, email, string(hashedPassword)); err != nil {
		return nil, fmt.Errorf("Failed to create new user: %w", err)
	}

	return &user, nil
}

func (s *UserStore) ByEmail(ctx context.Context, email string) (*User, error) {
	const dml = "SELECT * FROM users WHERE email = $1;"

	var user User
	if err := s.db.GetContext(ctx, &user, dml, email); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("User with email %s does not exist: %w", email, err)
		}

		return nil, fmt.Errorf("Failed to fetch user by email %s: %w", email, err)
	}

	return &user, nil
}

func (s *UserStore) ByUserId(ctx context.Context, userId int64) (*User, error) {
	const dml = "SELECT * FROM users WHERE id = $1;"

	var user User
	if err := s.db.GetContext(ctx, &user, dml, userId); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("User with id %d does not exist: %w", userId, err)
		}

		return nil, fmt.Errorf("Failed to fetch user by id %d: %w", userId, err)
	}

	return &user, nil
}

func (s *UserStore) All(ctx context.Context) ([]User, error) {
	const dml = `SELECT * FROM users;`

	users := make([]User, 0)
	if err := s.db.SelectContext(ctx, &users, dml); err != nil {
		return nil, fmt.Errorf("Failed to fetch users: %w", err)
	}

	return users, nil
}

func (s *UserStore) ChangePassword(ctx context.Context, userId int64, newPassword string) error {
	const dml = `UPDATE users SET password_hash = $1 WHERE id = $2`

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("Failed to hash password: %w", err)
	}

	result, err := s.db.ExecContext(ctx, dml, string(hashedPassword), userId)
	if err != nil {
		return fmt.Errorf("Failed to change user password: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

func (u *User) ComparePassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.HashedPassword), []byte(password))
}
