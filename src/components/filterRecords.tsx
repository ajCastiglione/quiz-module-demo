import fetchAirtableRecords from "../controllers/fetchAirtableRecrods";
import { useState, Fragment } from "react";
import { Record } from "../types/records";
import "./filterRecords.css";

const FilterRecords = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const fetchData = async () => {
    if (!filter) return;
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
          setCategories(prev => {
            if (!prev.includes(quizRecord.fields.Category)) {
              return [...prev, quizRecord.fields.Category];
            }
            return prev;
          });
        }
      });

      setRecords(questionRecords);
      setFilteredRecords(questionRecords);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch records data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //   Filter the records based on the selected category
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCategory = event.target.value;
    if (selectedCategory) {
      const filteredRecords = records.filter(
        record => record.fields.Category === selectedCategory
      );
      setFilteredRecords(filteredRecords);
    } else {
      // If no category is selected, reset to the original records
      setFilteredRecords(records);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="records">
      <h1>Select Question</h1>
      <form>
        <label htmlFor="filter" className="sr-only">
          Select Question:
        </label>
        <div className="form-group">
          <div className="input-wrap">
            <input
              type="text"
              id="filter"
              name="filter"
              placeholder="Type a keyword to find a question or a quiz"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <button type="button" onClick={fetchData} className="search-button">
              Search
            </button>
          </div>
          <div className="sub-filter">
            <label htmlFor="category" className="sr-only">
              Select Category:
            </label>
            <select
              id="category"
              name="category"
              className="category-select"
              onChange={handleCategoryChange}
            >
              <option value="">Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      {loading && <div>Loading...</div>}
      {filteredRecords.length > 0 && (
        <div className="record-list">
          <h2>Question Title</h2>
          <h2>Quiz</h2>
          <h2>Category</h2>
          {filteredRecords.map(record => (
            <Fragment key={record.id}>
              <p>{record.fields.Title}</p>
              <p>{record.fields["Quiz Title"]}</p>
              <p>{record.fields.Category}</p>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterRecords;
