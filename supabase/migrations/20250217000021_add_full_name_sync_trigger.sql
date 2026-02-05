-- Function to sync full_name from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_profile_full_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET full_name = NEW.raw_user_meta_data->>'full_name'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on auth.users update
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.sync_profile_full_name(); 