package store

import "github.com/jmoiron/sqlx"

type Store struct {
	Users           *UserStore
	RefreshSessions *RefreshSessionStore
	Tasks           *TaskStore
}

func New(db *sqlx.DB) *Store {
	return &Store{
		Users:           NewUserStore(db),
		RefreshSessions: NewRefreshSessionStore(db),
		Tasks:           NewTaskStore(db),
	}
}
