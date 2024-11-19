import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const queryKey = ['events', params.id];

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const updatedEvent = data.eventData;
      await queryClient.cancelQueries({ queryKey: queryKey });
      const prevQueryData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, updatedEvent);
      return { prevQueryData };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(queryKey, context.prevQueryData);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    }
  })

  function handleSubmit(formData) {
    mutate({ eventData: formData, id: params.id });
    // required Optimistic Update!
    // to see changed immediately!
    // and in case if response is NOT oK => roll back update
    // see onMutate () => {}
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isPending &&
        <div className="center"><LoadingIndicator /></div>
      }
      {!isPending && !isError &&
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      }
      {!isPending && isError &&
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
