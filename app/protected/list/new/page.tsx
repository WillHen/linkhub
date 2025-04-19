'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { ListForm, SaveAction } from '@/app/protected/list/components';

import type { FormDetails } from '@/app/protected/list/components/ListForm';

export default function AddListPage() {
  const router = useRouter();
  const [, setError] = useState('');
  const hasUser = useRef(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user');
        }
        const { user } = await userResponse.json();

        if (!user) {
          router.push('/sign-in');
        } else {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error checking user:', error);
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
      // First create the list
      const listResponse = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          user_id: userId
        })
      });

      if (!listResponse.ok) {
        throw new Error('Failed to create list');
      }

      const { list } = await listResponse.json();

      // Then create the links
      if (values.links.length > 0) {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            links: values.links.map((link) => ({
              title: link.title,
              url: link.url,
              list_id: list.id,
              description: link.description
            }))
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create links');
        }
      }

      router.push(`/list/view/${list.id}`);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  return (
    <div className='lg:w-1/2 flex flex-col'>
      <ListForm
        handleSubmit={handleSubmit}
        initialValues={{ title: '', description: '', links: [] }}
        title={'Create List'}
        saveAction={SaveAction.Create}
      />
    </div>
  );
}
