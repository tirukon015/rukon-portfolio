import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "append-only-cloud-backup-supabase-storage-rls",
  title: "An Append-Only Cloud Backup for a Local-First iOS App",
  description:
    "SpenDrop's optional cloud backup never overwrites: per-user Storage folders, no UPDATE policies, a content hash, and a restore that copies local data first.",
  date: "2026-12-06",
  category: "Full-Stack Development",
  tags: ["Supabase", "Supabase Storage", "Row Level Security", "Backups", "iOS", "Local-First", "PostgreSQL"],
  contentType: "Technical Guide",
  searchIntent: "informational",
  seoTitle: "Append-Only Backups With Supabase Storage and RLS",
  relatedProjects: ["spendrop"],
  relatedPosts: [
    "supabase-google-sign-in-ios-pkce-without-google-sdk",
    "swiftdata-versioned-schema-migration-without-losing-data",
    "two-ways-to-use-supabase-row-level-security",
    "testing-without-paid-apis-or-hardware-and-where-fakes-lie",
  ],
  sections: [
    {
      heading: "A backup that cannot destroy the thing it protects",
      body: [
        "[SpenDrop](/work/spendrop) is local-first: every expense, person and account lives in a SwiftData store on the iPhone, and the app works with no account. Version 1.4.0 added optional sign-in and a cloud backup to Supabase, for the case every local-first app eventually meets: a lost or replaced phone.",
        "The design goal was that the backup could never make things worse. A sync that overwrites the cloud copy can overwrite a good backup with a damaged local store; a restore that replaces the local store can wipe records made since the backup. So the cloud side is append-only (new files, never edits), restore merges instead of replacing, and every server rule is enforced by Postgres, not by the app. This guide walks through the pieces, for anyone building backups for a mobile or local-first app on Supabase.",
        {
          type: "callout",
          label: "Verification status",
          text: "The backup is implemented and covered by 13 cloud-backup checks in the app's test runner, which run against an in-memory fake of the Supabase HTTP API. The SQL below has not yet been executed on a live Supabase project, so the row-level security policies are written but not yet proven against the real server. SpenDrop is verified on the iOS simulator only and is not on the App Store.",
        },
      ],
    },
    {
      heading: "Files in Storage, metadata in a table",
      body: [
        "Each backup is one JSON file, the same format as the app's local export, uploaded to a private Storage bucket called `backups` at `<user id>/<device id>/<backup id>.json`. A row in a `public.backups` table records what the file contains: device id and name, app, schema and backup-format versions, created time, the object path, counts of expenses, people, accounts and money movements, and the size. The list of backups in the app comes from that table, so the user can see what a backup holds before restoring it.",
        "The table ties the two together with a constraint: the first folder of the object path must be the row's own user id. A row cannot point at somebody else's file even if a bug in the app tried.",
        {
          type: "code",
          lang: "sql",
          code: `create table if not exists public.backups (
    id              uuid primary key,
    user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
    device_id       text not null,
    -- ...device name, versions, counts, size...
    object_path     text not null,
    constraint backups_object_path_owner check (split_part(object_path, '/', 1) = user_id::text)
);

alter table public.backups enable row level security;

create policy "backups: owner can read" on public.backups
    for select to authenticated using (user_id = (select auth.uid()));
create policy "backups: owner can insert" on public.backups
    for insert to authenticated with check (user_id = (select auth.uid()));
create policy "backups: owner can delete" on public.backups
    for delete to authenticated using (user_id = (select auth.uid()));
-- no UPDATE policy: backups are append-only.`,
          caption: "From supabase/migrations/20260929000000_spendrop_cloud_backup.sql, abridged.",
        },
      ],
    },
    {
      heading: "Append-only is enforced by what is missing",
      body: [
        "There is no UPDATE policy on the table and none on the bucket. With row-level security enabled, an operation with no permitting policy is denied, so neither a row nor a file can ever be modified, by the app or by anyone holding a user's token. The bucket policies use the same ownership rule as the table: read, upload and delete only where `(storage.foldername(name))[1]` equals the caller's `auth.uid()`.",
        "The client asks for the same thing explicitly. Uploads are sent with `x-upsert: false`, so if a path already existed the upload would fail instead of replacing it. Since every backup gets a new UUID, that should never happen, and if it did, failing is the right outcome.",
        "Append-only does not mean unbounded. After a successful upload the app keeps the newest ten backups for the current device and deletes older ones, files first and then their rows. Deletion is allowed by policy; editing is not.",
      ],
    },
    {
      heading: "Uploading only when something changed",
      body: [
        "Backups run after local saves (debounced by 20 seconds so a burst of edits becomes one upload), when the app goes to the background, when connectivity returns, and on demand from \"Backup Now\". To avoid filling the bucket with identical copies, the app computes a SHA-256 hash of the backed-up content, with every collection sorted by id and the export timestamp left out, and skips the upload when it matches the last successful one.",
        "An upload is two requests: the file, then the metadata row. If the row insert fails after the file was stored, the app deletes the file it just uploaded, so the bucket never holds files the table does not know about. Failures never block local use; they only change the status the Account screen shows: waiting for internet, backup failed with Retry, or signed out when the session has expired.",
      ],
    },
    {
      heading: "Restoring by merging, after a local safety copy",
      body: [
        "Restore downloads the chosen file, decodes it, and refuses it if its backup format is newer than this app understands. Then, before touching anything, it writes a local safety copy of the current data. Only if that succeeds does it merge the backup into the store by stable id, using the same importer as a local JSON import: records are matched by id, people are never merged by name, possible duplicates are reported rather than skipped, and records edited more recently on the device are kept. If any step before the merge fails, nothing is applied.",
        "Restore also refuses to run while the app is in safe mode, the state it enters when the local store could not be opened. That mode and the pre-upgrade copies behind it are described in [SwiftData Migrations That Can't Lose Data](/blog/swiftdata-versioned-schema-migration-without-losing-data).",
      ],
    },
    {
      heading: "Deleting an account, and the limits",
      body: [
        "\"Delete Cloud Account\" removes the user's backup files through the Storage API, then calls a database function that deletes only the caller:",
        {
          type: "code",
          lang: "sql",
          code: `create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'not signed in';
    end if;
    delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;`,
        },
        "`security definer` lets the function delete from `auth.users`, which the user's role cannot touch directly, so it is locked down: an empty `search_path`, no argument that could name another user, and execute granted to signed-in users only. The metadata rows go with the user through `on delete cascade`. Signing out or deleting the cloud account never touches local data.",
        "The limits are deliberate and stated in the app. Backups are protected by HTTPS, sign-in and row-level security, with the provider's encryption at rest, but they are not end-to-end encrypted: a key only the user holds would make a forgotten key an unrecoverable backup. Receipt images are not included. Supabase free projects pause after inactivity, which affects the backup but never local use. And until the SQL runs on a real project, the policies are a design that has passed tests against a fake, not a proven deployment; how far such fakes can be trusted is the subject of [Testing Without Paid APIs or Hardware](/blog/testing-without-paid-apis-or-hardware-and-where-fakes-lie). Sign-in itself is covered in [Google Sign-In on iOS Through Supabase](/blog/supabase-google-sign-in-ios-pkce-without-google-sdk).",
      ],
    },
  ],
};
