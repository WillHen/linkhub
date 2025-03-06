import { createClient } from '@/utils/supabase/server';

import type { ListResponse } from '@/app/types/List';

import Link from 'next/link';

import { ListSegment } from './list/List';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .returns<Array<ListResponse>>();

  return (
    <div className='flex-1 w-full flex flex-col gap-12 flex-wrap'>
      <div
        className='flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4'
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/sdxl10/431556f2-fc02-4250-9980-f806143969ab.png")',
          backgroundPosition: 'center 45%'
        }}
      >
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]'>
            Welcome to LinkHub
          </h1>
          <h2 className='text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal'>
            Organize your links into lists that you can share and explore. Start
            by creating your first list.
          </h2>
        </div>
        <Link
          href='/protected/list/new'
          className='flex items-center gap-2 text-blue-500 hover:underline'
          data-testid='create-list-link'
        >
          <button className='flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]'>
            <span className='truncate'>Create new list</span>
          </button>
        </Link>
      </div>
      <div className='flex flex-col gap-2 items-start'>
        <h2 data-testid='your-lists-header' className='font-bold text-2xl mb-4'>
          Your Lists
        </h2>
        {lists && lists.length > 0 ? (
          <div className='w-full' data-testid='list-container'>
            {lists.map((list, index) => (
              <ListSegment
                key={list.id}
                index={index}
                listId={list.id}
                title={list.title}
                linkCount={list.link_count}
              />
            ))}
          </div>
        ) : (
          <p>No lists available.</p>
        )}
      </div>
    </div>
  );
}
