package main

var metricsRegistry = map[string]Metric{
	"revenue": {
		ID:    "revenue",
		Label: "Выручка",
		SQL: "SUM(CASE " +
			"WHEN `t.ticket_status_code` = 'cancelled' THEN `t.refund_amount` " +
			"ELSE `t.paid_amount` END)",
		Kind: "money",
	},
	"passengers_actual": {
		ID:    "passengers_actual",
		Label: "Количество пассажиров",
		SQL:   "COUNTIf(`t.ticket_status_code` != 'cancelled')",
		Kind:  "number",
	},
	"passengers_all": {
		ID:    "passengers_all",
		Label: "Количество пассажиров (все строки)",
		SQL:   "COUNT()",
		Kind:  "number",
	},
	"trips_count": {
		ID:    "trips_count",
		Label: "Количество рейсов",
		SQL:   "COUNT(DISTINCT `t.ims_trip_id`)",
		Kind:  "number",
	},
	"avg_ticket_price": {
		ID:    "avg_ticket_price",
		Label: "Средняя цена билета",
		SQL:   "AVGIf(`t.ticket_price`, `t.ticket_status_code` != 'cancelled')",
		Kind:  "money",
	},
	"cancelled_count": {
		ID:    "cancelled_count",
		Label: "Количество отмен",
		SQL:   "COUNTIf(`t.ticket_status_code` = 'cancelled')",
		Kind:  "number",
	},
}

var groupsRegistry = map[string]Group{
	"ticket_status":      {ID: "ticket_status", Label: "По статусу билета", Expr: "`t.ticket_status_code`"},
	"ticket_city_from":   {ID: "ticket_city_from", Label: "По городу отправления в билете", Expr: "`t.city_from_name`"},
	"ticket_city_to":     {ID: "ticket_city_to", Label: "По городу прибытия в билете", Expr: "`t.city_to_name`"},
	"currency_code":      {ID: "currency_code", Label: "По валюте", Expr: "`t.currency_code`"},
	"tenant_name":        {ID: "tenant_name", Label: "По партнеру", Expr: "`te.tenant_name`"},
	"carrier_name":       {ID: "carrier_name", Label: "По перевозчику", Expr: "`c.carrier_name`"},
	"sales_channel_name": {ID: "sales_channel_name", Label: "По источнику продажи", Expr: "`sales_channel_name`"},
	"route_city_from":    {ID: "route_city_from", Label: "По городу отправления в маршруте", Expr: "`route_city_from`"},
	"route_city_to":      {ID: "route_city_to", Label: "По городу прибытия в маршруте", Expr: "`route_city_to`"},
	"route_id":           {ID: "route_id", Label: "По id маршрута", Expr: "`tr.ims_route_id`"},
	"payment_method":     {ID: "payment_method", Label: "По методу оплаты", Expr: "`t.payment_method_code`"},
}

var filtersRegistry = map[string]FilterDef{
	"carrier_name":     {ID: "carrier_name", Label: "Перевозчик", Expr: "`c.carrier_name`"},
	"tenant_name":      {ID: "tenant_name", Label: "Партнер", Expr: "`te.tenant_name`"},
	"route_city_from":  {ID: "route_city_from", Label: "Город отправления в маршруте", Expr: "`route_city_from`"},
	"route_city_to":    {ID: "route_city_to", Label: "Город прибытия в маршруте", Expr: "`route_city_to`"},
	"route_id":         {ID: "route_id", Label: "ID маршрута", Expr: "`tr.ims_route_id`"},
	"payment_method":   {ID: "payment_method", Label: "Метод оплаты", Expr: "`t.payment_method_code`"},
	"ticket_status":    {ID: "ticket_status", Label: "Статус билета", Expr: "`t.ticket_status_code`"},
	"ticket_city_from": {ID: "ticket_city_from", Label: "Город отправления в билете", Expr: "`t.city_from_name`"},
	"ticket_city_to":   {ID: "ticket_city_to", Label: "Город прибытия в билете", Expr: "`t.city_to_name`"},
	"currency_code":    {ID: "currency_code", Label: "Валюта", Expr: "`t.currency_code`"},
}

var dateFieldRegistry = map[string]string{
	"departure_date": "`tr.departure_msk`",
	"purchase_date":  "`t.purchase_date_msk`",
}