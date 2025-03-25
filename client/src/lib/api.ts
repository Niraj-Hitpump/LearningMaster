export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(path, options);
}
