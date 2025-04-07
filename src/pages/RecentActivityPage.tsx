const RecentActivityPage = () => {
    const docs: string[] = []; // Change this to test
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
        {docs.length === 0 ? (
          <p className="text-muted-foreground">No documents found.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc, i) => (
              <li key={i} className="p-3 bg-background rounded shadow">
                {doc}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default RecentActivityPage;
  