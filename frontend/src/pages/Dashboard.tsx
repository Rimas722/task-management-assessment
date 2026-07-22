import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/axios";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [status, setStatus] = useState<"Pending" | "In Progress" | "Completed">(
    "Pending",
  );
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  const fetchTasks = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/tasks", {
        params: {
          search: search || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          priority: priorityFilter !== "All" ? priorityFilter : undefined,
          sortBy,
        },
      });
      setTasks(response.data);
    } catch (err: any) {
      setError("Failed to load tasks. Please try refreshing.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, sortBy]);

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Pending");
    const today = new Date().toISOString().split("T")[0];
    setDueDate(today);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate.split("T")[0]);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFormError("Due date cannot be earlier than today.");
      return;
    }

    try {
      const payload = { title, description, priority, status, dueDate };

      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "Error saving task. Please try again.",
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete task.");
      console.error(err);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-sm text-gray-500">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600">{user?.name}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-xs transition"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dueDate">Due Date (Urgent)</option>
            </select>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            + New Task
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500 font-medium animate-pulse">
              Loading tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="text-lg font-medium text-gray-700">No tasks found</p>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first task above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {task.title}
                    </h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {task.description || (
                      <span className="italic text-gray-400">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span
                      className={`rounded border px-2 py-0.5 font-medium ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="flex-1 rounded border border-gray-300 bg-gray-50 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTaskId ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete project documentation"
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any extra details or notes here..."
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority *
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
