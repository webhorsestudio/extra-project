-- Create property_developers table for storing developer/broker information
create table if not exists property_developers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website text,
  address text,
  logo_url text,
  logo_storage_path text,
  contact_info jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Trigger to update updated_at on row update
create or replace function update_property_developers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists property_developers_updated_at on property_developers;
create trigger property_developers_updated_at
before update on property_developers
for each row execute procedure update_property_developers_updated_at();

-- Add developer_id column to properties table
alter table properties add column if not exists developer_id uuid references property_developers(id) on delete set null;

-- Add comment to explain the column
comment on column properties.developer_id is 'Reference to the developer/broker who listed this property';

-- Create index for better performance
create index if not exists idx_properties_developer_id on properties(developer_id);
create index if not exists idx_property_developers_is_active on property_developers(is_active); 