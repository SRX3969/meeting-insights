import { useState } from "react";
import { Link } from "react-router-dom";
import { useMeetings } from "@/hooks/useMeetings";
import { Input } from "@/components/ui/input";
import { Search, FileText, ChevronRight } from "lucide-react";

const SearchPage = () => {
  const { data: meetings } = useMeetings();
  const [query, setQuery] = useState("");

  const results = query.trim().length > 1
    ? meetings?.filter((m) => {
        const q = query.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          (m.summary || "").toLowerCase().includes(q) ||
          m.transcript.toLowerCase().includes(q) ||
          (m.action_items || []).some((a: string) => a.toLowerCase().includes(q)) ||
          (m.decisions || []).some((d: string) => d.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Search</h1>
        <p className="text-muted-foreground text-sm mt-1">Find meetings, action items, and decisions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all meetings..."
          className="pl-10 rounded-xl text-base h-12"
          autoFocus
        />
      </div>

      {query.trim().length > 1 && (
        <div className="space-y-3">
          {!results?.length ? (
            <div className="notion-card text-center py-14">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No results for "{query}"</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 && "s"} found</p>
              {results.map((m) => (
                <Link
                  key={m.id}
                  to={`/dashboard/meeting/${m.id}`}
                  className="notion-card flex items-center justify-between p-5 hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {m.summary && <span className="ml-2">· {m.summary.slice(0, 80)}...</span>}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </>
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="notion-card text-center py-14">
          <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Start typing to search across all your meetings</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
