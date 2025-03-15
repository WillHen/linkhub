'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash.isequal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { fetchListAndLinks, saveListAndLinks } from './actions';
import { LinkDetails } from './LinkDetails';
import { SkeletonLoader } from './SkeleonLoader';

type EditableLink = {
  new_id?: string;
  title: string;
  id?: string;
  description: string | null;
  url: string;
};

type FormValues = {
  title: string;
  description: string | null;
  links: EditableLink[];
};

const hasFormChanges = (
  initialValues: FormValues,
  currentValues: FormValues
) => {
  return !isEqual(initialValues, currentValues);
};

const validateLinks = (links: EditableLink[]) => {
  for (const link of links) {
    if (!link.title || !link.url) {
      return false;
    }
  }
  return true;
};

export default function EditListPage() {
  const router = useRouter();
  const { list_id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [linksToDelete, setLinksToDelete] = useState<string[]>([]);
  const [user_id, setUser_id] = useState('');
  const [links, setLinks] = useState<EditableLink[]>([]);
  const [initialValues, setInitialValues] = useState<{
    title: string;
    description: string | null;
    links: EditableLink[];
  }>({
    title: '',
    description: '',
    links: [] as EditableLink[]
  });

  const hasChanges = hasFormChanges(initialValues, {
    title,
    description,
    links
  });

  const isFormValid = validateLinks(links) && !formError;

  const [isClient, setIsClient] = useState(false);

  const handleAddLink = () => {
    setLinks([
      ...links,
      { title: '', description: '', url: '', new_id: uuidv4() }
    ]);
  };

  const handleDeleteList = async (listId: string) => {
    try {
      // Delete associated links
      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('list_id', listId);

      if (linksError) {
        throw new Error(linksError.message);
      }

      // Delete the list
      const { error: listError } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId);

      if (listError) {
        throw new Error(listError.message);
      }

      router.push('/protected');
    } catch (error: unknown) {
      const message = (error as Error).message;
      console.error('Error deleting list and links:', message);
    }
  };

  const handleDeleteLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    const linkToDelete = links[index];
    if (linkToDelete && linkToDelete.id) {
      setLinksToDelete((prevLinksToDelete) => [
        ...prevLinksToDelete,
        linkToDelete.id as string
      ]);
    }
    setLinks([...newLinks]);
  };

  const handleLinksChange = (
    index: number,
    value: { title: string; url: string }
  ) => {
    const newLinks = [...links];
    const updatedUrl =
      value.url.startsWith('http://') || value.url.startsWith('https://')
        ? value.url
        : `http://${value.url}`;
    newLinks[index] = {
      ...newLinks[index],
      title: value.title,
      url: updatedUrl
    };
    setLinks(newLinks);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { listData, linksData } = await fetchListAndLinks(
          list_id as string
        );
        setUser_id(listData.user_id as string);
        setTitle(listData.title);
        setDescription(listData.description as string);
        setLinks(linksData);
        setInitialValues({
          title: listData.title,
          description: listData.description,
          links: linksData
        });
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    };

    fetchData();
  }, [list_id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title) {
      setFormError('List title is required');
      return;
    }
    setFormError('');
    try {
      await saveListAndLinks(
        list_id as string,
        title,
        description,
        links,
        user_id
      );

      // Delete the marked links
      if (linksToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .in('id', linksToDelete);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }
      router.push(`/list/view/${list_id}`);
    } catch (err) {
      alert('Error saving list and links: ' + err);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <></>;

  return (
    <>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className='max-w-[960px] flex flex-1 justify-start items-start flex-col'>
          <div className='flex flex-wrap self-stretch justify-between items-start flex-row gap-3 p-4'>
            <div className='min-w-[288px] flex justify-start items-start flex-col gap-3'>
              <div
                data-testid='edit-list-header'
                className='flex flex-row items-center w-[352px]'
                style={{ width: '352px' }}
              >
                <p className='self-stretch text-[#121417] text-[32px] font-bold leading-10'>
                  Edit list
                </p>
                <FontAwesomeIcon
                  data-testid='delete-list-button'
                  icon={faTrash}
                  className='text-[#121417] ml-2 cursor-pointer'
                  onClick={() => handleDeleteList(list_id as string)}
                />
              </div>
            </div>
          </div>
          <div className='max-w-[480px] flex flex-wrap justify-start items-end flex-row gap-4 py-3 px-4'>
            <div className='min-w-[160px] flex flex-1 justify-start items-start flex-col'>
              <div className='flex self-stretch justify-start items-start flex-col pb-2'>
                <p className='self-stretch text-[#121417] font-medium leading-6'>
                  List title
                </p>
              </div>
              <input
                data-testid='list-title-input'
                type='text'
                className='flex self-stretch justify-start items-center flex-row p-[15px] bg-[#FFFFFF] border-solid border-[#DBE0E5] border rounded-xl h-[32px] w-full'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {formError && (
                <p className='text-red-500 text-sm mt-2'>{formError}</p>
              )}
            </div>
          </div>
          <div className='max-w-[480px] flex flex-wrap justify-start items-end flex-row gap-4 py-3 px-4'>
            <div className='min-w-[160px] flex flex-1 justify-start items-start flex-col'>
              <div className='flex self-stretch justify-start items-start flex-col pb-2'>
                <p className='self-stretch text-[#121417] font-medium leading-6'>
                  Description
                </p>
              </div>
              <textarea
                data-testid='list-description-input'
                className='min-h-[144px] flex self-stretch flex-1 justify-start items-start flex-row p-[15px] bg-[#FFFFFF] border-solid border-[#DBE0E5] border rounded-xl w-full'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className='flex self-stretch justify-start items-start flex-col pt-4 pb-2 px-4'>
            <p className='self-stretch text-[#121417] text-lg font-bold leading-[23px]'>
              Links in this list
            </p>
          </div>
          {links.map((link, index) => (
            <LinkDetails
              key={link.id || link.new_id}
              id={link.id as string}
              linkIndex={index}
              title={link.title}
              url={link.url}
              onChange={handleLinksChange}
              onDeleteLink={() => handleDeleteLink(index)}
            />
          ))}
          <form onSubmit={handleSubmit} className='w-full'>
            <div className='flex self-stretch justify-start items-start flex-row py-3 px-4'>
              <div
                data-testid='add-link-button'
                onClick={handleAddLink}
                className='min-w-[84px] max-w-[480px] flex flex-1 justify-center items-center flex-row px-4 bg-[#F0F2F5] rounded-xl h-[40px]'
              >
                <div className='flex justify-start items-center flex-col'>
                  <span className='text-[#121417] text-sm text-center font-bold leading-[21px]'>
                    Add link
                  </span>
                </div>
              </div>
            </div>
            <div className='flex self-stretch justify-start items-start flex-row py-3 px-4'>
              <div className='min-w-[84px] max-w-[480px] flex flex-1 justify-center items-center flex-row px-4 bg-[#1A80E5] rounded-xl h-[40px]'>
                <div className='flex justify-start items-center flex-col'>
                  <button
                    data-testid='update-list-button'
                    disabled={!hasChanges || !isFormValid}
                    type='submit'
                    className='flex flex-1 w-full justify-center items-center flex-row px-4 bg-[#1A80E5] rounded-xl h-[40px]'
                  >
                    <span className='text-[#FFFFFF] text-sm text-center font-bold leading-[21px]'>
                      Save changes
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
