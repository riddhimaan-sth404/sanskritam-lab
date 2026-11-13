-- SanskritLab security hardening
-- Safely applies owner-scoped RLS policies and signup auto-provisioning when target tables exist.

do $$
begin
  -- 1. sc_* shared tables: remove anonymous full access
  if to_regclass('public.sc_noise_logs') is not null then
    drop policy if exists anon_all_sc_noise_logs on public.sc_noise_logs;
    drop policy if exists auth_all_sc_noise_logs on public.sc_noise_logs;
    drop policy if exists sc_noise_logs_insert_any on public.sc_noise_logs;
    create policy "sc_noise_logs_insert_auth" on public.sc_noise_logs for insert with check (auth.role() = 'authenticated');
  end if;

  if to_regclass('public.sc_light_logs') is not null then
    drop policy if exists anon_all_sc_light_logs on public.sc_light_logs;
    drop policy if exists auth_all_sc_light_logs on public.sc_light_logs;
    drop policy if exists sc_light_logs_insert_any on public.sc_light_logs;
    create policy "sc_light_logs_insert_auth" on public.sc_light_logs for insert with check (auth.role() = 'authenticated');
  end if;

  if to_regclass('public.sc_photo_captures') is not null then
    drop policy if exists anon_all_sc_photo_captures on public.sc_photo_captures;
    drop policy if exists auth_all_sc_photo_captures on public.sc_photo_captures;
    drop policy if exists sc_photo_captures_insert_auth on public.sc_photo_captures;
    drop policy if exists sc_photo_captures_update_auth on public.sc_photo_captures;
    create policy "sc_photo_captures_insert_auth" on public.sc_photo_captures for insert with check (auth.role() = 'authenticated');
    create policy "sc_photo_captures_update_auth" on public.sc_photo_captures for update using (auth.role() = 'authenticated');
  end if;

  if to_regclass('public.sc_discipline_scores') is not null then
    drop policy if exists anon_all_sc_discipline_scores on public.sc_discipline_scores;
    drop policy if exists auth_all_sc_discipline_scores on public.sc_discipline_scores;
    drop policy if exists sc_discipline_scores_insert_auth on public.sc_discipline_scores;
    drop policy if exists sc_discipline_scores_select_auth on public.sc_discipline_scores;
    create policy "sc_discipline_scores_insert_auth" on public.sc_discipline_scores for insert with check (auth.role() = 'authenticated');
    create policy "sc_discipline_scores_select_auth" on public.sc_discipline_scores for select using (auth.role() = 'authenticated');
  end if;

  if to_regclass('public.sc_users') is not null then
    drop policy if exists anon_all_sc_users on public.sc_users;
    drop policy if exists auth_all_sc_users on public.sc_users;
    drop policy if exists sc_users_insert_auth on public.sc_users;
    create policy "sc_users_insert_auth" on public.sc_users for insert with check (auth.role() = 'authenticated');
  end if;

  -- 2. profiles: users can create their own row
  if to_regclass('public.profiles') is not null then
    drop policy if exists "Users can insert own profile" on public.profiles;
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;

  -- 3. Owner-scoped RLS policies
  if to_regclass('public.streaks') is not null then
    drop policy if exists streaks_select_own on public.streaks;
    drop policy if exists streaks_insert_own on public.streaks;
    drop policy if exists streaks_update_own on public.streaks;
    drop policy if exists streaks_delete_own on public.streaks;
    create policy "streaks_select_own" on public.streaks for select using (auth.uid() = user_id);
    create policy "streaks_insert_own" on public.streaks for insert with check (auth.uid() = user_id);
    create policy "streaks_update_own" on public.streaks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    create policy "streaks_delete_own" on public.streaks for delete using (auth.uid() = user_id);
  end if;

  if to_regclass('public.user_scores') is not null then
    drop policy if exists user_scores_select on public.user_scores;
    drop policy if exists user_scores_insert on public.user_scores;
    drop policy if exists user_scores_update on public.user_scores;
    create policy "user_scores_select" on public.user_scores for select using (auth.uid() = user_id);
    create policy "user_scores_insert" on public.user_scores for insert with check (auth.uid() = user_id);
    create policy "user_scores_update" on public.user_scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if to_regclass('public.badges') is not null then
    drop policy if exists badges_select_own on public.badges;
    create policy "badges_select_own" on public.badges for select using (auth.uid() = user_id);
  end if;

  if to_regclass('public.challenge_progress') is not null then
    drop policy if exists challenge_progress_select_own on public.challenge_progress;
    drop policy if exists challenge_progress_insert_own on public.challenge_progress;
    drop policy if exists challenge_progress_update_own on public.challenge_progress;
    drop policy if exists challenge_progress_delete_own on public.challenge_progress;
    create policy "challenge_progress_select_own" on public.challenge_progress for select using (auth.uid() = user_id);
    create policy "challenge_progress_insert_own" on public.challenge_progress for insert with check (auth.uid() = user_id);
    create policy "challenge_progress_update_own" on public.challenge_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    create policy "challenge_progress_delete_own" on public.challenge_progress for delete using (auth.uid() = user_id);
  end if;

  if to_regclass('public.comments') is not null then
    drop policy if exists comments_select_any on public.comments;
    drop policy if exists comments_insert_own on public.comments;
    drop policy if exists comments_update_own on public.comments;
    drop policy if exists comments_delete_own on public.comments;
    create policy "comments_select_any" on public.comments for select using (auth.role() = 'authenticated');
    create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = author_id);
    create policy "comments_update_own" on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
    create policy "comments_delete_own" on public.comments for delete using (auth.uid() = author_id);
  end if;

  if to_regclass('public.community_posts') is not null then
    drop policy if exists community_posts_select_any on public.community_posts;
    drop policy if exists community_posts_insert_own on public.community_posts;
    drop policy if exists community_posts_update_own on public.community_posts;
    drop policy if exists community_posts_delete_own on public.community_posts;
    create policy "community_posts_select_any" on public.community_posts for select using (auth.role() = 'authenticated');
    create policy "community_posts_insert_own" on public.community_posts for insert with check (auth.uid() = author_id);
    create policy "community_posts_update_own" on public.community_posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
    create policy "community_posts_delete_own" on public.community_posts for delete using (auth.uid() = author_id);
  end if;

  if to_regclass('public.test_attempts') is not null then
    drop policy if exists test_attempts_select_own on public.test_attempts;
    drop policy if exists test_attempts_insert_own on public.test_attempts;
    create policy "test_attempts_select_own" on public.test_attempts for select using (auth.uid() = user_id);
    create policy "test_attempts_insert_own" on public.test_attempts for insert with check (auth.uid() = user_id);
  end if;

  if to_regclass('public.mentorship_sessions') is not null then
    drop policy if exists mentorship_sessions on public.mentorship_sessions;
    drop policy if exists mentorship_sessions_insert_participant on public.mentorship_sessions;
    create policy "mentorship_sessions" on public.mentorship_sessions for select using (auth.uid() = mentor_id or auth.uid() = learner_id);
    create policy "mentorship_sessions_insert_participant" on public.mentorship_sessions for insert with check (auth.uid() = mentor_id or auth.uid() = learner_id);
  end if;
end $$;
