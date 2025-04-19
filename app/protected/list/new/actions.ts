import { supabase } from '@/lib/supabaseClient';

interface Link {
  title: string;
  url: string;
  id?: string;
  description?: string | undefined;
  new_id?: string;
}

export const createListAndLinksAction = async (
  title: string,
  description: string,
  links: Link[]
): Promise<string> => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }
  // Update the list
  // Create a new list
  const { data, error: listError } = await supabase
    .from('lists')
    .insert([{ title, description, user_id: user?.id }])
    .select();

  if (listError) {
    throw new Error(listError.message);
  }

  const listId = data?.[0].id;

  if (!links.length) {
    return listId;
  }

  // Insert links
  const { error: linksError } = await supabase.from('links').insert(
    links.map(({ title, description, url }) => ({
      title,
      description,
      url,
      list_id: listId,
      user_id: user?.id
    }))
  );

  if (linksError) {
    throw new Error(linksError.message);
  }
  return listId;
};
