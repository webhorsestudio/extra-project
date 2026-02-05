-- Create property_amenities table for storing amenities
create table if not exists property_amenities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  image_storage_path text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Trigger to update updated_at on row update
create or replace function update_property_amenities_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists property_amenities_updated_at on property_amenities;
create trigger property_amenities_updated_at
before update on property_amenities
for each row execute procedure update_property_amenities_updated_at(); 