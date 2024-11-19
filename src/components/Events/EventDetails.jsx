import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import { deleteEvent, fetchEvent, HOSTNAME, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';

export default function EventDetails() {
  const [isEventDeletion, setEventDeletion] = useState(false);
  const params = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isDeletePending, isError: isDeleteError, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none' // to prevent reFetching events data immediately after deletion, but only when reqiered next time
      });
      navigate('/events');
    }
  });

  const navigate = useNavigate();

  const handleDeleteEvent = () => {
    mutate({ id: params.id })
  }

  const handleStartDelete = () => {
    setEventDeletion(true);
  }

  const handleStopDelete = () => {
    setEventDeletion(false);
  }

  let content = null;

  if (isPending) {
    content = <p style={{ textAlign: 'center' }}>Loading Event details..</p>
  }

  if (isError) {
    content =
      <div id='events-details-content' className='center'>
        <ErrorBlock title="Failed to fetch event details." message={error.info?.message || 'Service is temporary unavailable!'} />
      </div>;
  }

  if (data) {
    let formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={HOSTNAME + '/' + data.image} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      {isEventDeletion &&
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure you want to delete this Event?</h2>
          <p>Event will be deleted permanently</p>
          <div className='form-actions'>
            {isDeletePending && <p>Deleting event...</p>}
            {!isDeletePending &&
              <>
                <button className='button-text' onClick={handleStopDelete}>Cancel</button>
                <button className='button' onClick={handleDeleteEvent}>Delete</button>
              </>
            }
          </div>
          {isDeleteError &&
            <ErrorBlock
              title='Failed to delete Event'
              message={deleteError.info?.message || 'Service unavailable'}
            />
          }
        </Modal>
      }
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
