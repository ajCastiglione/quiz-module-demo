const fetchAirtableRecords = async (
  base_id: string,
  table_id: string,
  view_name: string,
  query: string
) => {
  const url = `https://api.airtable.com/v0/${base_id}/${table_id}?view=${view_name}&filterByFormula=${encodeURIComponent(
    query
  )}`;

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }
  const data = await response.json();
  return data.records;
};
export default fetchAirtableRecords;
