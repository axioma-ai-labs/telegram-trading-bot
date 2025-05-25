create table private_keys (
  wallet_address text primary key,
  encrypted_private_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for security
alter table private_keys enable row level security;

-- Only allow authenticated service role to access the table
create policy "Service can manage private keys"
  on private_keys
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');