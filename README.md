<img width="1680" height="910" alt="image" src="https://github.com/user-attachments/assets/38739cfb-ea7c-4ee1-bfc1-354867c413c2" />
<img width="1571" height="847" alt="image" src="https://github.com/user-attachments/assets/4fd45377-1222-483b-9007-0a738743f6f5" />


1. Run clickhouse on docker container and make table with following schema:
   CREATE TABLE default.routes_raw                      ↴│
   │↳(                                                    ↴│
   │↳    `t.ims_code` String,                             ↴│
   │↳    `t.ims_ticket_id` String,                        ↴│
   │↳    `t.ims_trip_id` String,                          ↴│
   │↳    `t.ims_order_id` String,                         ↴│
   │↳    `t.user_id` Nullable(UUID),                      ↴│
   │↳    `t.saas_responsible_id` Nullable(String),        ↴│
   │↳    `t.ticket_status_code` String,                   ↴│
   │↳    `t.purchase_date_msk` DateTime,                  ↴│
   │↳    `t.city_from_name` String,                       ↴│
   │↳    `t.city_to_name` String,                         ↴│
   │↳    `t.boarding_msk` DateTime,                       ↴│
   │↳    `t.alighting_msk` Nullable(DateTime),            ↴│
   │↳    `t.ims_sales_channel_id` Nullable(String),       ↴│
   │↳    `t.payment_method_code` String,                  ↴│
   │↳    `t.tariff_name` String,                          ↴│
   │↳    `t.ticket_price` Decimal(10, 2),                 ↴│
   │↳    `t.paid_amount` Decimal(10, 2),                  ↴│
   │↳    `t.refund_amount` Decimal(10, 2),                ↴│
   │↳    `t.intent_refund` Decimal(10, 2),                ↴│
   │↳    `t.miles_paid` Decimal(10, 2),                   ↴│
   │↳    `t.currency_code` String,                        ↴│
   │↳    `t.promo_code` Nullable(String),                 ↴│
   │↳    `t.promo_discount` Decimal(10, 2),               ↴│
   │↳    `t.cancellation_datetime_msk` Nullable(DateTime),↴│
   │↳    `t.cancellation_initiator` Nullable(String),     ↴│
   │↳    `t.distance_km` Nullable(Float32),               ↴│
   │↳    `t.ims_tenant_id` String,                        ↴│
   │↳    `t.ims_carrier_id` String,                       ↴│
   │↳    `te.tenant_name` String,                         ↴│
   │↳    `te.billing_id` String,                          ↴│
   │↳    `c.carrier_name` String,                         ↴│
   │↳    `sales_channel_name` String,                     ↴│
   │↳    `tr.ims_route_id` String,                        ↴│
   │↳    `tr.ims_vehicle_id` String,                      ↴│
   │↳    `tr.departure_msk` DateTime,                     ↴│
   │↳    `tr.arrival_msk` DateTime,                       ↴│
   │↳    `v.registration_number` String,                  ↴│
   │↳    `v.seats_count` Int32,                           ↴│
   │↳    `v.vehicle_mark` String,                         ↴│
   │↳    `v.vehicle_model` String,                        ↴│
   │↳    `route_city_from` String,                        ↴│
   │↳    `route_city_to` String                           ↴│
   │↳)                                                    ↴│
   │↳ENGINE = MergeTree                                   ↴│
   │↳ORDER BY (`t.purchase_date_msk`, `t.ims_ticket_id`)  ↴│
   │↳SETTINGS index_granularity = 8192                     │
   └───────────────────────────────────────────────────────┘


2. After that just run your server via go run . in directory of project and watch on local host
