import { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface LinkProps {
  title: string;
  url: string;
  id: string;
  linkIndex: number;
  onChange: (index: number, value: { title: string; url: string }) => void;
  onDeleteLink: (index: number) => void;
}

const urlPattern = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

export function LinkDetails({
  title,
  url,
  linkIndex,
  id,
  onChange,
  onDeleteLink
}: LinkProps) {
  const [isEditMode, setIsEditMode] = useState(!title && !url);
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableUrl, setEditableUrl] = useState(url);
  const [validationError, setValidationError] = useState('');
  useEffect(() => {
    setEditableTitle(title);
    setEditableUrl(url);
  }, [title, url]);

  return (
    <>
      <div
        data-testid={`link-${linkIndex}`}
        className='min-h-[72px] flex self-stretch justify-between items-center flex-row gap-4 py-2 px-4 bg-[#FFFFFF] h-[72px] mb-1.5'
      >
        <div className='flex justify-center items-start flex-col'>
          <div
            className='flex justify-start items-start flex-col w-[142px]'
            style={{ width: '142px' }}
          >
            {isEditMode ? (
              <input
                type='text'
                data-testid='link-title-input'
                className='self-stretch text-[#121417] font-medium leading-6 p-[15px] bg-[#FFFFFF] border-solid border-[#DBE0E5] border rounded-xl h-[32px] w-full'
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
              />
            ) : (
              <p
                data-testid={`link-title-${linkIndex}`}
                className='self-stretch text-[#121417] font-medium leading-6'
              >
                {title}
              </p>
            )}
          </div>
          <div className='flex justify-start items-start flex-col'>
            {isEditMode ? (
              <input
                data-testid='link-url-input'
                type='text'
                className='text-[#637587] mt-1.5 text-sm leading-[21px] p-[15px] bg-[#FFFFFF] border-solid border-[#DBE0E5] border rounded-xl h-[32px] w-full'
                value={editableUrl}
                onChange={(e) => setEditableUrl(e.target.value)}
              />
            ) : (
              <span
                data-testid={`link-url-${linkIndex}`}
                className='text-[#637587] text-sm leading-[21px]'
              >
                {url}
              </span>
            )}
          </div>
        </div>
        <div className='flex justify-start items-start flex-row gap-2'>
          {isEditMode && (
            <div
              className='min-w-[84px] max-w-[480px] flex justify-center items-center flex-row px-4 bg-[#F0F2F5] rounded-xl h-[32px] cursor-pointer'
              onClick={() => {
                if (
                  !!id &&
                  (!editableTitle ||
                    !editableUrl ||
                    !urlPattern.test(editableUrl))
                ) {
                  setValidationError('Title and a valid URL are required');
                  return;
                }

                if (!id && !editableTitle && !editableUrl) {
                  onDeleteLink(linkIndex);
                  return;
                }
                setValidationError('');
                setEditableTitle(title);
                setEditableUrl(url);
                setIsEditMode(false);
              }}
            >
              <div
                data-testid='cancel-button'
                className='flex justify-start items-center flex-col'
              >
                <span className='text-[#121417] text-sm text-center font-medium leading-[21px]'>
                  Cancel
                </span>
              </div>
            </div>
          )}
          <div
            className='min-w-[84px] max-w-[480px] flex justify-center items-center flex-row px-4 bg-[#F0F2F5] rounded-xl h-[32px] cursor-pointer'
            onClick={
              isEditMode
                ? () => {
                    if (
                      !editableTitle ||
                      !editableUrl ||
                      !urlPattern.test(editableUrl)
                    ) {
                      setValidationError('Title and a valid URL are required');
                      return;
                    } else {
                      setValidationError('');
                      onChange(linkIndex, {
                        title: editableTitle,
                        url: editableUrl
                      });
                      setIsEditMode(false);
                    }
                  }
                : () => setIsEditMode(true)
            }
          >
            <div
              data-testid={`${isEditMode ? 'confirm' : 'edit'}-button`}
              className='flex justify-start items-center flex-col'
            >
              <span className='text-[#121417] text-sm text-center font-medium leading-[21px]'>
                {isEditMode ? 'Confirm' : 'Edit'}
              </span>
            </div>
          </div>
          <div
            data-testid='link-delete'
            className='min-w-[32px] max-w-[32px] flex justify-center items-center flex-row px-4 bg-[#F0F2F5] rounded-xl h-[32px] cursor-pointer'
            onClick={() => onDeleteLink(linkIndex)}
          >
            <div className='flex justify-start items-center flex-col'>
              <FontAwesomeIcon icon={faTrash} className='text-[#121417]' />
            </div>
          </div>
        </div>
      </div>
      {!!validationError && (
        <div className='gap-4 py-2 px-4 text-red-500 text-sm mt-2'>
          {validationError}
        </div>
      )}
    </>
  );
}
