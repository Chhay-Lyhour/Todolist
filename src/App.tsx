import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Ellipsis,
  ListTodo,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";

type TodoStatus = "To Do" | "In Progress" | "Done";
type ApiTodoStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Filter = "All tasks" | TodoStatus;

type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
};

const API_BASE = "http://localhost:3000/api";
const filters: Filter[] = ["All tasks", "To Do", "In Progress", "Done"];
const statuses: TodoStatus[] = ["To Do", "In Progress", "Done"];

const statusMap: Record<ApiTodoStatus, TodoStatus> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function normalizeTodo(todo: { id: number; title: string; status: ApiTodoStatus }): Todo {
  return {
    id: todo.id,
    title: todo.title,
    status: statusMap[todo.status],
  };
}

function statusTone(status: TodoStatus) {
  if (status === "Done") return "status-done";
  if (status === "In Progress") return "status-progress";
  return "status-todo";
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("All tasks");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [newStatus, setNewStatus] = useState<TodoStatus>("To Do");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingStatus, setEditingStatus] = useState<TodoStatus>("To Do");
  const [username, setUsername] = useState("Lyhour");
  const [profileName, setProfileName] = useState(username);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    async function loadTodos() {
      const response = await fetch(`${API_BASE}/todos`);
      const data = (await response.json()) as Array<{ id: number; title: string; status: ApiTodoStatus }>;
      setTodos(data.map(normalizeTodo));
    }

    loadTodos().catch(() => {
      setTodos([]);
    });
  }, []);

  const counts = useMemo(
    () => ({
      all: todos.length,
      "To Do": todos.filter((todo) => todo.status === "To Do").length,
      "In Progress": todos.filter((todo) => todo.status === "In Progress").length,
      Done: todos.filter((todo) => todo.status === "Done").length,
    }),
    [todos],
  );

  const visibleTodos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return todos.filter((todo) => {
      const matchesFilter = filter === "All tasks" || todo.status === filter;
      const matchesSearch = todo.title.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [todos, filter, search]);

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const response = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        status: newStatus === "To Do" ? "TODO" : newStatus === "In Progress" ? "IN_PROGRESS" : "DONE",
      }),
    });

    if (!response.ok) return;

    const todo = normalizeTodo((await response.json()) as { id: number; title: string; status: ApiTodoStatus });
    setTodos((current) => [todo, ...current]);
    setTitle("");
    setNewStatus("To Do");
  }

  function beginEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingStatus(todo.status);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle || editingId === null) return;

    const response = await fetch(`${API_BASE}/todos/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        status: editingStatus === "To Do" ? "TODO" : editingStatus === "In Progress" ? "IN_PROGRESS" : "DONE",
      }),
    });

    if (!response.ok) return;

    const todo = normalizeTodo((await response.json()) as { id: number; title: string; status: ApiTodoStatus });
    setTodos((current) => current.map((item) => (item.id === editingId ? todo : item)));
    setEditingId(null);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = profileName.trim();
    if (!trimmedName) return;

    const response = await fetch(`${API_BASE}/profile/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: trimmedName }),
    });

    if (!response.ok) return;

    setUsername(trimmedName);
    setProfileOpen(false);
  }

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Today home">
          <span className="brand-mark">
            <Check size={17} strokeWidth={3} />
          </span>
          <span>daylist</span>
        </a>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Workspace">
          <button className="nav-item nav-item-active" type="button">
            <ListTodo size={18} />
            <span>My tasks</span>
            <span className="nav-count">{counts.all}</span>
          </button>
          <button
            className="nav-item"
            type="button"
            onClick={() => setFilter("Done")}
          >
            <CheckCircle2 size={18} />
            <span>Completed</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-section-label">YOUR ACCOUNT</div>
        <Card className="profile-card">
          <CardContent className="profile-card-content">
            <div className="avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="profile-copy">
              <div className="profile-name">{username}</div>
              <div className="profile-role">Personal workspace</div>
            </div>
            <Button
              aria-label="Edit profile"
              className="profile-edit"
              onClick={() => {
                setProfileName(username);
                setProfileOpen(true);
              }}
              size="icon"
              variant="ghost"
            >
              <Ellipsis size={18} />
            </Button>
          </CardContent>
          <Button
            className="account-button"
            onClick={() => {
              setProfileName(username);
              setProfileOpen(true);
            }}
            variant="outline"
          >
            <UserRound size={15} />
            Account &amp; profile
          </Button>
        </Card>
        <p className="sidebar-footnote">Simple things, done well.</p>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-current">My tasks</span>
          </div>
          <div className="topbar-right">
            <span className="today-date">{today}</span>
            <button
              className="topbar-avatar"
              type="button"
              aria-label={`Open ${username}'s profile`}
              onClick={() => {
                setProfileName(username);
                setProfileOpen(true);
              }}
            >
              {username.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                <Sparkles size={14} />
                YOUR PERSONAL TASK SPACE
              </div>
              <h1>Good day, {username.split(" ")[0]} <span className="wave">✦</span></h1>
              <p className="welcome-subtitle">A little progress each day adds up.</p>
            </div>
            <div className="date-card">
              <span className="date-card-label">TODAY</span>
              <span className="date-card-date">
                {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date())}
              </span>
            </div>
          </div>

          <div className="stats-grid">
            <Card className="stat-card">
              <CardContent className="stat-content">
                <span className="stat-icon stat-icon-blue"><ClipboardList size={17} /></span>
                <span className="stat-label">Total tasks</span>
                <strong className="stat-number">{counts.all}</strong>
                <span className="stat-note">on your list</span>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="stat-content">
                <span className="stat-icon stat-icon-amber"><Circle size={17} /></span>
                <span className="stat-label">To do</span>
                <strong className="stat-number">{counts["To Do"]}</strong>
                <span className="stat-note">ready when you are</span>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="stat-content">
                <span className="stat-icon stat-icon-violet"><ArrowUpRight size={17} /></span>
                <span className="stat-label">In progress</span>
                <strong className="stat-number">{counts["In Progress"]}</strong>
                <span className="stat-note">currently underway</span>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="stat-content">
                <span className="stat-icon stat-icon-green"><CheckCircle2 size={17} /></span>
                <span className="stat-label">Completed</span>
                <strong className="stat-number">{counts.Done}</strong>
                <span className="stat-note">nice work!</span>
              </CardContent>
            </Card>
          </div>

          <Card className="tasks-card">
            <CardHeader className="tasks-header">
              <div>
                <CardTitle className="section-title">Your tasks</CardTitle>
                <CardDescription className="section-description">
                  Keep track of what needs to get done.
                </CardDescription>
              </div>
              <Badge className="task-total" variant="secondary">{counts.all} total</Badge>
            </CardHeader>
            <CardContent className="tasks-content">
              <form className="add-form" onSubmit={addTodo}>
                <Input
                  aria-label="New task title"
                  className="task-input"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to get done?"
                  value={title}
                />
                <select
                  aria-label="New task status"
                  className="status-select"
                  onChange={(event) => setNewStatus(event.target.value as TodoStatus)}
                  value={newStatus}
                >
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <Button className="add-button" type="submit">
                  <Plus size={17} />
                  Add task
                </Button>
              </form>

              <div className="task-toolbar">
                <div className="filter-tabs" role="tablist" aria-label="Filter tasks">
                  {filters.map((item) => (
                    <button
                      aria-selected={filter === item}
                      className={`filter-tab ${filter === item ? "filter-tab-active" : ""}`}
                      key={item}
                      onClick={() => setFilter(item)}
                      role="tab"
                      type="button"
                    >
                      {item}
                      <span className="filter-count">
                        {item === "All tasks" ? counts.all : counts[item]}
                      </span>
                    </button>
                  ))}
                </div>
                <label className="search-box">
                  <Search size={15} />
                  <input
                    aria-label="Search tasks"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    value={search}
                  />
                </label>
              </div>

              <div className="todo-list">
                {visibleTodos.map((todo) => (
                  <div className="todo-row" key={todo.id}>
                    {editingId === todo.id ? (
                      <form className="edit-form" onSubmit={saveEdit}>
                        <Input
                          aria-label="Edit task title"
                          autoFocus
                          className="edit-title"
                          onChange={(event) => setEditingTitle(event.target.value)}
                          value={editingTitle}
                        />
                        <select
                          aria-label="Edit task status"
                          className="status-select edit-status"
                          onChange={(event) => setEditingStatus(event.target.value as TodoStatus)}
                          value={editingStatus}
                        >
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <Button aria-label="Save task" size="icon" type="submit"><Check size={16} /></Button>
                        <Button
                          aria-label="Cancel editing"
                          onClick={() => setEditingId(null)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X size={16} />
                        </Button>
                      </form>
                    ) : (
                      <>
                        <button
                          aria-label={`Mark "${todo.title}" as ${todo.status === "Done" ? "not done" : "done"}`}
                          className={`todo-check ${todo.status === "Done" ? "todo-check-done" : ""}`}
                          onClick={async () => {
                            const nextStatus: TodoStatus = todo.status === "Done" ? "To Do" : "Done";
                            const response = await fetch(`${API_BASE}/todos/${todo.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                status: nextStatus === "To Do" ? "TODO" : "DONE",
                              }),
                            });

                            if (!response.ok) return;

                            const updatedTodo = normalizeTodo((await response.json()) as { id: number; title: string; status: ApiTodoStatus });
                            setTodos((current) => current.map((item) => (item.id === todo.id ? updatedTodo : item)));
                          }}
                          type="button"
                        >
                          {todo.status === "Done" && <Check size={13} strokeWidth={3} />}
                        </button>
                        <span className={`todo-title ${todo.status === "Done" ? "todo-title-done" : ""}`}>
                          {todo.title}
                        </span>
                        <Badge className={`status-badge ${statusTone(todo.status)}`} variant="secondary">
                          {todo.status}
                        </Badge>
                        <div className="todo-actions">
                          <Button
                            aria-label={`Edit "${todo.title}"`}
                            onClick={() => beginEdit(todo)}
                            size="icon"
                            variant="ghost"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            aria-label={`Delete "${todo.title}"`}
                            className="delete-button"
                            onClick={async () => {
                              const response = await fetch(`${API_BASE}/todos/${todo.id}`, {
                                method: "DELETE",
                              });

                              if (!response.ok) return;

                              setTodos((current) => current.filter((item) => item.id !== todo.id));
                            }}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {visibleTodos.length === 0 && (
                  <div className="empty-state">
                    <span className="empty-icon"><ListTodo size={22} /></span>
                    <strong>{search ? "No matching tasks" : "Nothing here yet"}</strong>
                    <span>{search ? "Try a different search." : "Add a task above to get started."}</span>
                  </div>
                )}
              </div>
              <div className="list-footer">
                <span>Showing {visibleTodos.length} of {counts.all} tasks</span>
                <span><CheckCircle2 size={14} /> All changes are in your local state</span>
              </div>
            </CardContent>
          </Card>
          <footer className="page-footer">
            <span>Made for a more focused day.</span>
            <span>Keep it simple <span aria-hidden="true">✦</span></span>
          </footer>
        </div>
      </section>

      {profileOpen && (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setProfileOpen(false);
          }}
        >
          <Card aria-labelledby="profile-dialog-title" aria-modal="true" className="profile-dialog" role="dialog">
            <CardHeader className="dialog-header">
              <div className="dialog-icon"><UserRound size={18} /></div>
              <div>
                <CardTitle className="dialog-title" id="profile-dialog-title">Your profile</CardTitle>
                <CardDescription>Update the name shown in your workspace.</CardDescription>
              </div>
              <Button
                aria-label="Close profile"
                className="dialog-close"
                onClick={() => setProfileOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X size={17} />
              </Button>
            </CardHeader>
            <CardContent>
              <form className="profile-form" onSubmit={saveProfile}>
                <label className="field-label" htmlFor="profile-name">Display name</label>
                <Input
                  autoFocus
                  id="profile-name"
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="Your name"
                  value={profileName}
                />
                <div className="dialog-actions">
                  <Button onClick={() => setProfileOpen(false)} type="button" variant="outline">Cancel</Button>
                  <Button type="submit">Save profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

export default App;
