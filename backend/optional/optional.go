package optional

import (
	"bytes"
	"encoding/json"
)

type Optional[T any] struct {
	Set   bool //was value set in update form?
	Value *T   //what is the new value?
}

func (o *Optional[T]) UnmarshalJSON(data []byte) error {
	o.Set = true

	if bytes.Equal(bytes.TrimSpace(data), []byte("null")) {
		o.Value = nil
		return nil
	}

	var value T
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}

	o.Value = &value
	return nil
}
