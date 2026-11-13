# build stage
FROM golang:1.26.0 AS build-stage

# create directory inside golang image
WORKDIR /app

# copy go files with dependencies to golang image's /app directory
COPY go.mod go.sum ./

# download dependencies specified in go.mod and go.sum
RUN go mod download

# copy all files
COPY . .

# compile application: 
# -> disable CGO
# -> compile file for Linux system (Docker works in Linux environment)
# -> compile code and save file called "tasktracker"
RUN CGO_ENABLED=0 GOOS=linux go build -o /tasktracker ./cmd/apiserver


# production stage
FROM gcr.io/distroless/base-debian12 AS release-stage

WORKDIR /app

# takes only file tasktracker from build-stage stage and copies it to this stage's /tasktracker
COPY --from=build-stage /tasktracker /app/tasktracker 

# this container assumes app will be listening on port 8080
EXPOSE 8080

USER nonroot:nonroot

# when the container is started, run compiled file located in /tasktracker
ENTRYPOINT ["/app/tasktracker"]