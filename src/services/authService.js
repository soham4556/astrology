import { supabase } from './supabaseClient';

function isMissingUsersTableError(error) {
  if (!error) {
    return false;
  }

  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toUpperCase();

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes("could not find the table 'public.users'") ||
    message.includes('schema cache') ||
    message.includes('relation "users" does not exist')
  );
}

export async function signUpWithEmail({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase.from('users').upsert(
      {
        user_id: user.id,
        email: user.email,
        full_name: fullName,
      },
      { onConflict: 'user_id' },
    );

    if (profileError && !isMissingUsersTableError(profileError)) {
      throw profileError;
    }
  }

  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}
