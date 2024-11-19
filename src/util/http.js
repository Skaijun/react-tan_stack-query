import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
export const HOSTNAME = "http://localhost:3000";

export async function fetchEvents({ signal, searchTerm, max }) {
  let url = HOSTNAME + "/events";

  if (searchTerm && max) {
    url += `?search=${searchTerm}&max=${max}`;
  } else if (searchTerm) {
    url += `?search=${searchTerm}`;
  } else if (max) {
    url += `?max=${max}`;
  }

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}

export async function createNewEvent(eventData) {
  let url = HOSTNAME + "/events";

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occured while creating a new event!");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

export async function fetchImages({ signal }) {
  let url = HOSTNAME + "/events/images";

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching images");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { images } = await response.json();

  return images;
}

export async function fetchEvent({ signal, id }) {
  let url = HOSTNAME + "/events/" + id;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching event data");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

export async function deleteEvent({ id }) {
  let url = HOSTNAME + "/events/" + id;

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = new Error("An error occurred while deleting event data");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}

export async function updateEvent({ eventData, id }) {
  let url = HOSTNAME + "/events/" + id;

  const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify({ event: eventData }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = new Error("An error occured while updating the event!");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}
