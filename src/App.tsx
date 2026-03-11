import { useState, useMemo, useCallback, useEffect } from 'react';
import { ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { roles, allServices, allTags, type Role } from './data/roles';
import SearchBar from './components/SearchBar';
import RoleCard from './components/RoleCard';
import RoleDetail from './components/RoleDetail';

function matchesQuery(role: Role, q: string): boolean {
  const lower = q.toLowerCase();
  if (role.name.toLowerCase().includes(lower)) return true;
  if (role.shortDescription.toLowerCase().includes(lower)) return true;
  if (role.tags.some((t) => t.toLowerCase().includes(lower))) return true;
  if (role.permissions.some(
    (p) =>
      p.displayName.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.action.toLowerCase().includes(lower) ||
      p.service.toLowerCase().includes(lower)
  )) return true;
  return false;
}

function App() {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleService = useCallback((s: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }, []);

  const toggleTag = useCallback((t: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedServices(new Set());
    setSelectedTags(new Set());
  }, []);

  const hasFilters = selectedServices.size > 0 || selectedTags.size > 0;

  const filtered = useMemo(() => {
    return roles.filter((role) => {
      if (query && !matchesQuery(role, query)) return false;
      if (selectedTags.size > 0 && !role.tags.some((t) => selectedTags.has(t))) return false;
      if (selectedServices.size > 0 && !role.permissions.some((p) => selectedServices.has(p.service))) return false;
      return true;
    });
  }, [query, selectedServices, selectedTags]);

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRole) setSelectedRole(null);
        else if (filterPanelOpen) setFilterPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedRole, filterPanelOpen]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">Azure Roles Explorer</h1>
            <p className="text-slate-500 text-xs hidden sm:block">
              Understand what each developer role can do in your landing zone
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero intro */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            What can I request access to?
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Browse the custom roles available in your Azure landing zone. Each role covers a specific
            set of tasks — click any role to see exactly what it lets you do, in plain English.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <button
            onClick={() => setFilterPanelOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors shrink-0
              ${hasFilters
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            aria-expanded={filterPanelOpen}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {selectedServices.size + selectedTags.size}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filterPanelOpen && (
          <div
            id="filter-panel"
            className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Filter roles</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By Azure Service</p>
                <div className="flex flex-wrap gap-2">
                  {allServices.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleService(s)}
                      className={`text-sm px-3 py-1 rounded-full border transition-colors
                        ${selectedServices.has(s)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By Category</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`text-sm px-3 py-1 rounded-full border transition-colors
                        ${selectedTags.has(t)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {filtered.length === roles.length
              ? `${roles.length} roles available`
              : `${filtered.length} of ${roles.length} roles`}
            {query && (
              <> matching <span className="font-medium text-slate-700">"{query}"</span></>
            )}
          </p>
          {(query || hasFilters) && (
            <button
              onClick={() => { setQuery(''); clearFilters(); }}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Role grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                searchQuery={query}
                onClick={() => setSelectedRole(role)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-500 font-medium">No roles match your search</p>
            <p className="text-slate-400 text-sm mt-1">Try different keywords or clear your filters</p>
            <button
              onClick={() => { setQuery(''); clearFilters(); }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear search and filters
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Permission types</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Read</span>
              View or list resources
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Write</span>
              Create or modify resources
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Delete</span>
              Permanently remove resources
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Action</span>
              Perform a specific operation
            </span>
          </div>
        </div>
      </main>

      {/* Detail panel */}
      {selectedRole && (
        <RoleDetail role={selectedRole} onClose={() => setSelectedRole(null)} />
      )}
    </div>
  );
}

export default App
