-- Chat conversations
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  model text not null default 'gpt-4o',
  is_supervisor boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_chats_user_id on chats(user_id);
create index if not exists idx_messages_chat_id on messages(chat_id);

-- RLS policies
alter table chats enable row level security;
alter table messages enable row level security;

create policy "Users can read own chats"
  on chats for select using (auth.uid() = user_id);

create policy "Users can insert own chats"
  on chats for insert with check (auth.uid() = user_id);

create policy "Users can update own chats"
  on chats for update using (auth.uid() = user_id);

create policy "Users can delete own chats"
  on chats for delete using (auth.uid() = user_id);

create policy "Users can read messages from own chats"
  on messages for select using (
    chat_id in (select id from chats where user_id = auth.uid())
  );

create policy "Users can insert messages into own chats"
  on messages for insert with check (
    chat_id in (select id from chats where user_id = auth.uid())
  );
