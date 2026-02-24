import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

export const endVisit = async (visitUuid: string) => {
  const url = `${restBaseUrl}/visit/${visitUuid}`;
  const stopDatetime = new Date().toISOString();
  const body = {
    stopDatetime,
  };
  const response = await openmrsFetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
};
