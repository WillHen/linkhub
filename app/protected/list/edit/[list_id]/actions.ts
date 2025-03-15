import { supabase } from '@/lib/supabaseClient';

import { getListsFromSupabase, getLinksFromSupabase } from '@/app/utils';

type EditableLink = {
  new_id?: string;
  title: string;
  id?: string;
  description: string | null;
  url: string;
};


export async function fetchListAndLinks(list_id: string) {
  const { data: listData, error: listError } = await getListsFromSupabase(supabase)
    .eq('id', list_id)
    .single();

  if (listError) {
    throw new Error(listError.message);
  }

  const { data: linksData, error: linksError } = await getLinksFromSupabase(supabase)
    .eq('list_id', list_id);

  if (linksError) {
    throw new Error(linksError.message);
  }

  const EditableLinks = linksData.map((link) => ({
    id: link.id,
    title: link.title,
    description: link.description || '',
    url: link.url
  }));

  return { listData, linksData: EditableLinks };
}

export async function saveListAndLinks(
  list_id: string,
  title: string,
  description: string,
  links: EditableLink[],
  user_id: string
) {
  const { error: listError } = await supabase
    .from('lists')
    .update({ title, description })
    .eq('id', list_id);

  if (listError) {
    throw new Error(listError.message);
  }

  const newLinks = links.filter((link) => !link.id);
  const existingLinks = links.filter((link) => link.id);

  if (newLinks.length > 0) {
    const { error: insertError } = await supabase.from('links').insert(
      newLinks.map(({ title, description, url }) => ({
        title,
        description,
        url,
        list_id,
        user_id
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { error: upsertError } = await supabase.from('links').upsert(
    existingLinks.map((link) => ({
      id: link.id,
      title: link.title,
      description: link.description,
      url: link.url,
      list_id: list_id, // Ensure you include the list_id
      user_id: user_id // Ensure you include the user_id
    })),
    { onConflict: 'id' } // Specify the unique constraint for conflict resolution
  );

  if (upsertError) {
    throw new Error(upsertError.message);
  }
}
