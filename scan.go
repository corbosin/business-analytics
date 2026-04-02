package main

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func scanRows(rows *sql.Rows) ([]map[string]interface{}, error) {
	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	colTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}

	result := make([]map[string]interface{}, 0)

	for rows.Next() {
		scanTargets := make([]interface{}, len(cols))

		for i, ct := range colTypes {
			scanTargets[i] = newScanTarget(ct.DatabaseTypeName())
		}

		if err := rows.Scan(scanTargets...); err != nil {
			return nil, err
		}

		rowMap := make(map[string]interface{}, len(cols))
		for i, col := range cols {
			rowMap[col] = normalizeValue(scanTargets[i], colTypes[i].DatabaseTypeName())
		}

		result = append(result, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

func newScanTarget(dbType string) interface{} {
	t := strings.ToUpper(dbType)

	switch {
	case strings.Contains(t, "DATE"), strings.Contains(t, "DATETIME"):
		return &sql.NullTime{}
	case strings.Contains(t, "DECIMAL"), strings.Contains(t, "UUID"),
		strings.Contains(t, "STRING"), strings.Contains(t, "FIXEDSTRING"),
		strings.Contains(t, "ENUM"):
		return &sql.NullString{}
	case strings.Contains(t, "FLOAT"):
		return &sql.NullFloat64{}
	case strings.Contains(t, "INT"), strings.Contains(t, "UINT"):
		return &sql.NullInt64{}
	case strings.Contains(t, "BOOL"):
		return &sql.NullBool{}
	default:
		var v interface{}
		return &v
	}
}

func normalizeValue(ptr interface{}, dbType string) interface{} {
	t := strings.ToUpper(dbType)

	switch v := ptr.(type) {
	case *sql.NullTime:
		if !v.Valid {
			return nil
		}
		if strings.Contains(t, "DATETIME") {
			return v.Time.Format("2006-01-02 15:04:05")
		}
		return v.Time.Format("2006-01-02")

	case *sql.NullString:
		if !v.Valid {
			return nil
		}
		if strings.Contains(t, "DECIMAL") {
			f, err := strconv.ParseFloat(v.String, 64)
			if err == nil {
				return f
			}
		}
		return v.String

	case *sql.NullFloat64:
		if !v.Valid {
			return nil
		}
		return v.Float64

	case *sql.NullInt64:
		if !v.Valid {
			return nil
		}
		return v.Int64

	case *sql.NullBool:
		if !v.Valid {
			return nil
		}
		return v.Bool

	case *interface{}:
		if *v == nil {
			return nil
		}
		switch x := (*v).(type) {
		case []byte:
			return string(x)
		case time.Time:
			if strings.Contains(t, "DATETIME") {
				return x.Format("2006-01-02 15:04:05")
			}
			if strings.Contains(t, "DATE") {
				return x.Format("2006-01-02")
			}
			return x.Format(time.RFC3339)
		case fmt.Stringer:
			return x.String()
		default:
			return x
		}

	default:
		return nil
	}
}