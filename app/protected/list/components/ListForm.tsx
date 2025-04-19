import { Field, FieldArray, Form, Formik, ErrorMessage } from 'formik';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import isEqual from 'lodash.isequal';

import { LinkDetails } from './LinkDetails';
import { SkeletonLoader } from './SkeletonLoader';

interface Link {
  title: string;
  url: string;
  id?: string;
  description?: string | undefined;
  new_id?: string;
}

export enum SaveAction {
  Create = 'create',
  Update = 'update'
}

export type FormDetails = {
  title: string;
  description: string;
  links: Link[];
};

const validationSchema = Yup.object().shape({
  title: Yup.string().required('List title is required'),
  description: Yup.string(),
  links: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Link title is required'),
      url: Yup.string()
        .matches(
          /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i,
          'Invalid URL'
        )
        .required('Link URL is required')
    })
  )
});

export function ListForm({
  initialValues,
  handleSubmit,
  saveAction,
  title,
  isLoading,
  deleteList
}: {
  initialValues: FormDetails;
  handleSubmit: (values: FormDetails, linksToDelete: string[]) => Promise<void>;
  saveAction: SaveAction;
  title: string;
  isLoading?: boolean;
  deleteList?: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linksToDelete, setLinksToDelete] = useState<string[]>([]);

  if (isSubmitting || isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className='w-full lg:max-w-[1200px] mx-auto p-8 bg-white shadow-md rounded-lg'>
      <div className='flex justify-between items-center mb-8'>
        <h1
          className='text-3xl font-bold mb-8 text-gray-800'
          data-testid={
            (saveAction === SaveAction.Create ? 'new-' : 'edit-') +
            'list-header'
          }
        >
          {title}
        </h1>
        {saveAction === SaveAction.Update && deleteList && (
          <button
            type='button'
            onClick={deleteList}
            className='text-red-600 hover:text-red-800 transition'
            data-testid='delete-list-button'
          >
            Delete List
          </button>
        )}
      </div>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={true}
        validateOnMount={false}
        enableReinitialize
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            await handleSubmit(values, linksToDelete);
          } catch (error: unknown) {
            console.error('Error saving list:', (error as Error).message);
          }
        }}
      >
        {({ values, setFieldValue }) => {
          return (
            <Form>
              {/* List Title */}
              <div className='mb-8'>
                <label
                  htmlFor='title'
                  className='block text-lg font-medium text-gray-700 mb-2'
                >
                  List Title
                </label>
                <Field
                  id='title'
                  name='title'
                  type='text'
                  placeholder='Enter list title'
                  data-testid='list-title-input'
                  className='w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <ErrorMessage
                  name='title'
                  component='div'
                  className='text-red-500 text-sm mt-1'
                />
              </div>

              {/* List Description */}
              <div className='mb-8'>
                <label
                  htmlFor='description'
                  className='block text-lg font-medium text-gray-700 mb-2'
                >
                  List Description
                </label>
                <Field
                  id='description'
                  name='description'
                  type='text'
                  placeholder='Enter list description'
                  data-testid='list-description-input'
                  className='w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Links Section */}
              <div className='mb-8'>
                <h2 className='text-xl font-medium text-gray-700 mb-4'>
                  Links
                </h2>
                <FieldArray name='links' validateOnChange={false}>
                  {({ push, remove }) => (
                    <div>
                      {values.links.map((link, index) => (
                        <LinkDetails
                          key={index}
                          linkIndex={index}
                          title={link.title}
                          url={link.url}
                          id={link.id}
                          new_id={link.new_id}
                          onChange={(index, value, id, new_id) => {
                            if (id) {
                              setFieldValue(`links[${index}]`, {
                                id,
                                ...value
                              });
                            } else if (new_id) {
                              setFieldValue(`links[${index}]`, {
                                new_id,
                                ...value
                              });
                            } else {
                              setFieldValue(`links[${index}]`, {
                                new_id: uuidv4(),
                                ...value
                              });
                            }
                          }}
                          onDeleteLink={(index) => {
                            remove(index);
                            if (link.id) {
                              const id = link.id as string;
                              setLinksToDelete((prev) => [...prev, id]);
                            }
                          }}
                        />
                      ))}
                      <button
                        type='button'
                        data-testid='add-link-button'
                        className='w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition mt-4'
                        onClick={() => {
                          push({ title: '', url: '', new_id: uuidv4() });
                        }}
                      >
                        Add Link
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Submit Button */}
              <button
                data-testid={`${saveAction}-list-button`}
                type='submit'
                className={`w-full py-4 px-4 text-white font-bold rounded-lg ${
                  isEqual(initialValues, values)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 transition'
                }`}
                disabled={isEqual(initialValues, values)}
              >
                {saveAction === SaveAction.Create ? 'Create' : 'Update'} List
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
