package storage

import (
	"bytes"
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2Storage struct {
	client *s3.Client
	bucket string
}

func NewR2Storage(
	ctx context.Context,
	bucketName string,
	accessKeyId string,
	secretAccessKey string,
	endpointUrl string,
) (*R2Storage, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, secretAccessKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpointUrl)
	})

	return &R2Storage{
		client: client,
		bucket: bucketName,
	}, nil
}

func (s *R2Storage) Upload(ctx context.Context, key string, data []byte) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String("image/jpeg"),
	})

	return err
}

// func (s *R2Storage) Get(ctx context.Context, key string) ([]byte, error) {
// 	obj, err := s.client.GetObject(ctx, &s3.GetObjectInput{
// 		Bucket: aws.String(s.bucket),
// 		Key:    aws.String(key),
// 	})
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer obj.Body.Close()

// 	data, err := io.ReadAll(obj.Body)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return data, err
// }

func (s *R2Storage) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	return err
}
