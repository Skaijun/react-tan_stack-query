import { useQuery } from '@tanstack/react-query';
import { Link, redirect, useNavigate, useParams, useSubmit, useNavigation } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const params = useParams();
  const submit = useSubmit();
  const queryKey = ['events', params.id];

  const { data, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000 // to avoid double GET request to fetch event details
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const updatedEvent = data.eventData;
  //     await queryClient.cancelQueries({ queryKey: queryKey });
  //     const prevQueryData = queryClient.getQueryData(queryKey);
  //     queryClient.setQueryData(queryKey, updatedEvent);
  //     return { prevQueryData };
  //   },
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(queryKey, context.prevQueryData);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(queryKey);
  //   }
  // })

  function handleSubmit(formData) {
    // mutate({ eventData: formData, id: params.id });
    // // required Optimistic Update!
    // // to see changed immediately!
    // // and in case if response is NOT oK => roll back update
    // // see onMutate () => {}
    // navigate('../');
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {!isError &&
        <EventForm inputData={data} onSubmit={handleSubmit}>
          {
            state === 'submitting' ? <span className='center'>Saving Event Details..</span> :
              (
                <>
                  <Link to="../" className="button-text">
                    Cancel
                  </Link>
                  <button type="submit" className="button">
                    Update
                  </button>
                </>
              )

          }
        </EventForm>
      }
      {isError &&
        <>
          <ErrorBlock
            title="Failed to fetch event details"
            message={error.info?.message || 'Server error occure!'}
          />
          <div className="form-actions">
            <Link to="../" className='button'>Okay</Link>
          </div>
        </>
      }
    </Modal>
  );
}

export async function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updFormData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, eventData: updFormData });
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}