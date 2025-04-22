import fetchAirtableRecords from "../controllers/fetchAirtableRecrods";
import { useState } from "react";
import { Record } from "../types/records";
import { useDebounce } from "../utils/utils";
import "./filterRecords.css";

const FilterRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const debouncedChange = useDebounce(() => {
    fetchData();
  }, 500);

  const fetchData = async () => {
    try {
      setLoading(true);
      const base_id = import.meta.env.VITE_AIRTABLE_BASE_ID;
      const table_id = import.meta.env.VITE_AIRTABLE_TABLE_ID;
      const view_name = "viw0PQciGzl6Qd4AP";
      const query = `FIND("${filter}", {Title})`;

      const questionRecords = await fetchAirtableRecords(
        base_id,
        table_id,
        view_name,
        query
      );

      const quiz_table_id = import.meta.env.VITE_AIRTABLE_QUIZ_TABLE_ID;
      const quiz_view_name = "viwL51pRWW6SHZntq";
      // Query the quiz table that matches the quiz ID from the data.
      const quizQuery = `OR(${questionRecords
        .map((record: Record) => `{Quiz OID} = "${record.fields["Quiz ID"]}"`)
        .join(", ")})`;

      const quizData = await fetchAirtableRecords(
        base_id,
        quiz_table_id,
        quiz_view_name,
        quizQuery
      );

      // Update the questionRecords with the quiz category, short title, and title.
      questionRecords.forEach((record: Record) => {
        const quizRecord = quizData.find(
          (quiz: Record) => quiz.fields["Quiz OID"] === record.fields["Quiz ID"]
        );
        if (quizRecord) {
          record.fields["Quiz Title"] = quizRecord.fields.Title;
          record.fields["Quiz Short Title"] = quizRecord.fields["Short Title"];
          record.fields["Category"] = quizRecord.fields.Category;
        }
      });

      setRecords(questionRecords);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="records">
      <h1>Select Question</h1>
      <form>
        <label htmlFor="filter">Select Question:</label>
        <input
          type="text"
          id="filter"
          name="filter"
          placeholder="Enter title to filter"
          value={filter}
          onChange={e => {
            setFilter(e.target.value);
            debouncedChange();
          }}
        />
      </form>
      {loading && <div>Loading...</div>}
      {records.length > 0 && (
        <table className="record-list">
          <thead>
            <tr>
              <th>Question Title</th>
              <th>Quiz</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{record.fields.Title}</td>
                <td>{record.fields["Quiz Title"]}</td>
                <td>{record.fields.Category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FilterRecords;
