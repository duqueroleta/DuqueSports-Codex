const LEADS_STORAGE_KEY = 'duque.leads';

function getStoredLeads() {
  try {
    return JSON.parse(window.localStorage.getItem(LEADS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLeadLocally(lead) {
  const storedLeads = getStoredLeads();
  window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify([...storedLeads, lead]));
}

async function submitLead(leadData) {
  const lead = {
    ...leadData,
    createdAt: new Date().toISOString(),
    source: 'duque-sports-ai',
  };
  const endpoint = import.meta.env.VITE_LEADS_ENDPOINT;

  if (!endpoint) {
    saveLeadLocally(lead);
    return { mode: 'local', ok: true };
  }

  const response = await fetch(endpoint, {
    body: JSON.stringify(lead),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    saveLeadLocally(lead);
    throw new Error('Lead endpoint failed');
  }

  saveLeadLocally(lead);
  return { mode: 'remote', ok: true };
}

export { submitLead };
