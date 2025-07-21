import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import AddPropertyClient from './AddPropertyClient'
import { redirect } from 'next/navigation'

export default async function AddPropertyPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/users/login');
  }

  // Optionally: fetch profile and check role === 'admin' here
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single();
  // if (!profile || profile.role !== 'admin') {
  //   redirect('/users/login');
  // }

  return <AddPropertyClient user={user} />;
} 
