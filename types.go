package main

type Metric struct {
	ID    string
	Label string
	SQL   string
	Kind  string
}

type Group struct {
	ID    string
	Label string
	Expr  string
}

type FilterDef struct {
	ID    string
	Label string
	Expr  string
}

type FilterRequest struct {
	Field  string   `json:"field"`
	Values []string `json:"values"`
}

type DateRange struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type QueryRequest struct {
	Metrics   []string        `json:"metrics"`
	Groups    []string        `json:"groups"`   // только дополнительные
	Filters   []FilterRequest `json:"filters"`
	DateRange DateRange       `json:"date_range"`
	DateField string          `json:"date_field"` // departure_date | purchase_date
	Grain     string          `json:"grain"`      // day | week | month
}