
create table staff(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 role text default 'staff',
 color text default '#3B82F6'
);

create table shifts(
 id uuid primary key default gen_random_uuid(),
 staff_id uuid references staff(id),
 date date,
 start_time time,
 end_time time
);
