package apiserver

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"tasktracker/config"
	"tasktracker/storage"
	"tasktracker/store"
	"time"
)

type ApiServer struct {
	config       *config.Config
	store        *store.Store
	tokenManager *tokenManager
	r2Storage    *storage.R2Storage
}

func New(config *config.Config, store *store.Store, tokenManager *tokenManager, r2Storage *storage.R2Storage) *ApiServer {
	return &ApiServer{
		config:       config,
		store:        store,
		tokenManager: tokenManager,
		r2Storage:    r2Storage,
	}
}

func (s *ApiServer) Start(ctx context.Context) error {
	mux := http.NewServeMux()

	// mux.HandleFunc("POST /auth/signin", s.SignInHandler)
	mux.Handle("POST /auth/signin", http.HandlerFunc(s.SignInHandler))
	mux.Handle("POST /auth/signup", http.HandlerFunc(s.SignUpHandler))
	mux.Handle("POST /auth/signout", http.HandlerFunc(s.SignOutHandler))
	mux.Handle("POST /auth/refresh", http.HandlerFunc(s.TokenRefreshHandler))

	mux.Handle("POST /tasks", s.AuthMiddleware(http.HandlerFunc(s.CreateTaskHandler)))
	mux.Handle("GET /tasks", s.AuthMiddleware(http.HandlerFunc(s.ListTasksHandler)))
	mux.Handle("GET /tasks/assigned-to-me", s.AuthMiddleware(http.HandlerFunc(s.ListUserTasksHandler)))
	mux.Handle("PATCH /tasks/{task_id}", s.AuthMiddleware(http.HandlerFunc(s.UpdateTaskHandler)))

	mux.Handle("GET /users", s.AuthMiddleware(http.HandlerFunc(s.ListUsersHandler)))
	mux.Handle("GET /users/me", s.AuthMiddleware(http.HandlerFunc(s.GetCurrentUserHandler)))
	mux.Handle("PATCH /users/me/change-password", s.AuthMiddleware(http.HandlerFunc(s.ChangePasswordHandler)))
	mux.Handle("PATCH /users/me/change-avatar", s.AuthMiddleware(http.HandlerFunc(s.ChangeAvatarHandler)))

	server := &http.Server{
		Addr:    net.JoinHostPort(s.config.ApiServerHost, s.config.ApiServerPort),
		Handler: mux,
	}

	go func() {
		log.Printf("listening on %s\n", server.Addr)

		if err := server.ListenAndServe(); err != nil {
			fmt.Fprintf(os.Stderr, "error listening and serving: %s", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	if err := server.Shutdown(shutdownCtx); err != nil {
		fmt.Fprintf(os.Stderr, "error shutting down the server: %s", err)
	}

	return nil
}
