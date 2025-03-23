'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

import { createListAndLinksAction } from './actions';

import {
  ListForm,
  SkeletonLoader,
  SaveAction
} from '@/app/protected/list/components';

import type { FormDetails } from '@/app/protected/list/components/ListForm';

export default function AddListPage() {
  const router = useRouter();
  const [, setError] = useState('');
  const hasUser = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
      }
    };
    if (!hasUser.current) {
      checkUser();
      hasUser.current = true;
    }
  }, []);

  const handleSubmit = async (values: FormDetails) => {
    try {
      setIsSubmitting(true);
      const listId = await createListAndLinksAction(
        values.title,
        values.description,
        values.links
      );
      router.push(`/list/view/${listId}`);
    } catch (error) {
      setIsSubmitting(false);
      setError(String(error));
    }
  };

  if (isSubmitting) {
    return <SkeletonLoader />;
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex justify-start items-start flex-col gap-3'>
        <div
          data-testid='create-list-header'
          className='flex flex-row items-center'
        >
          <p className='self-stretch text-[#121417] font-bold leading-10 text-3xl'>
            New list
          </p>
        </div>
      </div>
      <ListForm
        handleSubmit={handleSubmit}
        initialValues={{ title: '', description: '', links: [] }}
        saveAction={SaveAction.Create}
      />
    </div>
  );
}
