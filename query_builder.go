package main

import (
	"fmt"
	"strings"
)

func buildQuery(req QueryRequest) (string, error) {
	if len(req.Metrics) == 0 {
		return "", fmt.Errorf("at least one metric is required")
	}
	if req.DateRange.From == "" || req.DateRange.To == "" {
		return "", fmt.Errorf("date_range.from and date_range.to are required")
	}
	if req.DateField == "" {
		return "", fmt.Errorf("date_field is required")
	}
	if req.Grain == "" {
		return "", fmt.Errorf("grain is required")
	}

	dateExpr, ok := dateFieldRegistry[req.DateField]
	if !ok {
		return "", fmt.Errorf("unknown date_field: %s", req.DateField)
	}

	dateGroupExpr := applyGrain(dateExpr, req.Grain)

	selectParts := []string{
		fmt.Sprintf("%s AS `date`", dateGroupExpr),
	}
	groupParts := []string{dateGroupExpr}
	orderParts := []string{dateGroupExpr}

	for _, groupID := range req.Groups {
		groupDef, ok := groupsRegistry[groupID]
		if !ok {
			return "", fmt.Errorf("unknown group: %s", groupID)
		}
		selectParts = append(selectParts, fmt.Sprintf("%s AS `%s`", groupDef.Expr, groupDef.ID))
		groupParts = append(groupParts, groupDef.Expr)
		orderParts = append(orderParts, groupDef.Expr)
	}

	for _, metricID := range req.Metrics {
		metricDef, ok := metricsRegistry[metricID]
		if !ok {
			return "", fmt.Errorf("unknown metric: %s", metricID)
		}
		selectParts = append(selectParts, fmt.Sprintf("%s AS `%s`", metricDef.SQL, metricDef.ID))
	}

	whereParts := []string{
		fmt.Sprintf("%s >= toDateTime('%s 00:00:00')", dateExpr, escapeSQLString(req.DateRange.From)),
		fmt.Sprintf("%s <= toDateTime('%s 23:59:59')", dateExpr, escapeSQLString(req.DateRange.To)),
	}

	for _, f := range req.Filters {
		if len(f.Values) == 0 {
			continue
		}
		filterDef, ok := filtersRegistry[f.Field]
		if !ok {
			return "", fmt.Errorf("unknown filter field: %s", f.Field)
		}

		escaped := make([]string, 0, len(f.Values))
		for _, v := range f.Values {
			escaped = append(escaped, fmt.Sprintf("'%s'", escapeSQLString(v)))
		}

		whereParts = append(whereParts,
			fmt.Sprintf("%s IN (%s)", filterDef.Expr, strings.Join(escaped, ", ")),
		)
	}

	query := "SELECT " + strings.Join(selectParts, ", ") + " FROM routes_raw"
	query += " WHERE " + strings.Join(whereParts, " AND ")
	query += " GROUP BY " + strings.Join(groupParts, ", ")
	query += " ORDER BY " + strings.Join(orderParts, ", ")

	return query, nil
}

func applyGrain(expr string, grain string) string {
	switch grain {
	case "week":
		return fmt.Sprintf("toDate(toStartOfWeek(%s))", expr)
	case "month":
		return fmt.Sprintf("toDate(toStartOfMonth(%s))", expr)
	default:
		return fmt.Sprintf("toDate(%s)", expr)
	}
}

func escapeSQLString(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}