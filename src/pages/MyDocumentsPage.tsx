const MyDocumentsPage = () => {
    const myDocs: string[] = ["Calculus Notes", "Econ Midterm Prep"]; // Try with []
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Documents</h1>
        {myDocs.length === 0 ? (
          <p className="text-muted-foreground">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {myDocs.map((doc, i) => (
              <li key={i} className="p-3 bg-background rounded shadow">
                {doc}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default MyDocumentsPage;
  