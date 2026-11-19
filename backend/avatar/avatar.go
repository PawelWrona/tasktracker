package avatar

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"io"

	stdDraw "image/draw"

	xdraw "golang.org/x/image/draw"
	_ "golang.org/x/image/webp"
)

const (
	avatarSize   = 256
	maxDimension = 4096
)

func ProcessAvatar(file io.ReadSeeker) ([]byte, error) {
	config, format, err := image.DecodeConfig(file)
	if err != nil {
		return nil, fmt.Errorf("invalid image: %w", err)
	}

	switch format {
	case "jpeg", "png", "webp":
	default:
		return nil, fmt.Errorf("unsupported image format")
	}

	if config.Width <= 0 ||
		config.Height <= 0 ||
		config.Width > maxDimension ||
		config.Height > maxDimension {
		return nil, fmt.Errorf("invalid image dimensions")
	}

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	img, _, err := image.Decode(file)
	if err != nil {
		return nil, fmt.Errorf("cannot decode image: %w", err)
	}

	bounds := img.Bounds()

	width := bounds.Dx()
	height := bounds.Dy()

	side := min(width, height)

	x := bounds.Min.X + (width-side)/2
	y := bounds.Min.Y + (height-side)/2

	cropRect := image.Rect(x, y, x+side, y+side)

	dst := image.NewRGBA(
		image.Rect(0, 0, avatarSize, avatarSize),
	)

	stdDraw.Draw(
		dst,
		dst.Bounds(),
		&image.Uniform{C: color.White},
		image.Point{},
		stdDraw.Src,
	)

	xdraw.CatmullRom.Scale(
		dst,
		dst.Bounds(),
		img,
		cropRect,
		stdDraw.Over,
		nil,
	)

	var buf bytes.Buffer

	err = jpeg.Encode(&buf, dst, &jpeg.Options{
		Quality: 85,
	})
	if err != nil {
		return nil, fmt.Errorf("cannot encode avatar: %w", err)
	}

	return buf.Bytes(), nil
}
