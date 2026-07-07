const LEADS_STORAGE_KEY = 'duque.leads';
const GOOGLE_SHEETS_LEADS_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyoW36jLXME_tvvWhR_eTtI-Z8F9pwiaZPaQb78U_mB0XIUM7GNwKCBn1VZbCbCmi4SrA/exec';

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

function leadExistsLocally(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return getStoredLeads().some((lead) => lead.email?.trim().toLowerCase() === normalizedEmail);
}

async function submitLead(leadData) {
  if (leadExistsLocally(leadData.email)) {
    return { mode: 'duplicate', ok: true };
  }

  const lead = {
    ...leadData,
    email: leadData.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
    source: 'duque-sports-ai',
  };
  const endpoint = import.meta.env.VITE_LEADS_ENDPOINT || GOOGLE_SHEETS_LEADS_ENDPOINT;

  if (!endpoint) {
    saveLeadLocally(lead);
    return { mode: 'local', ok: true };
  }

  const response = await fetch(endpoint, {
    body: JSON.stringify(lead),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    method: 'POST',
  });

  if (!response.ok) {
    saveLeadLocally(lead);
    throw new Error('Lead endpoint failed');
  }

  const result = await response.json().catch(() => ({ ok: true }));

  if (result.duplicate) {
    saveLeadLocally(lead);
    return { mode: 'duplicate', ok: true };
  }

  saveLeadLocally(lead);
  return { mode: 'remote', ok: true };
}

export { submitLead };
