import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { ImCheckboxChecked } from "react-icons/im";
import { MdClearAll } from "react-icons/md";
import { useState } from "react";

export default function TodoList({ todos, setTodos, setEditTodo, darkTheme }) {
  const [filter, setFilter] = useState("all");

  const handleDelete = ({ id }) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleComplete = (todo) => {
    setTodos(
      todos.map((item) =>
        item.id === todo.id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleEdit = ({ id }) => {
    setEditTodo(todos.find((todo) => todo.id === id));
  };

  const handleClearAll = () => {
    if (window.confirm("This will remove all tasks. Continue?")) {
      setTodos([]);
    }
  };

  const filteredTodos = todos.filter((todo) =>
    filter === "active"
      ? !todo.completed
      : filter === "completed"
      ? todo.completed
      : true
  );

  const iconBase = "cursor-pointer";
  const iconStyle = (color) => ({
    color,
    transition: "0.2s",
  });
  const triggerBounce = (e) => {
    e.currentTarget.classList.add("tap-bounce");
    setTimeout(() => e.currentTarget.classList.remove("tap-bounce"), 200);
  };

  return (
    <div>
      {/* Filter + Clear */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="btn-group">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${
                filter === f ? "btn-info text-white" : "btn-outline-secondary"
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-sm btn-danger" onClick={handleClearAll}>
          <MdClearAll /> Clear All
        </button>
      </div>

      {/* Todos */}
      <ul className="list-group">
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            className={`list-group-item d-flex justify-content-between align-items-center mb-2 ${
              darkTheme ? "bg-dark text-white" : "bg-light text-dark"
            }`}
          >
            <div className="flex-grow-1">
              <span
                className={`d-block ${
                  todo.completed
                    ? "text-decoration-line-through text-success"
                    : ""
                }`}
              >
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="small text-muted">
                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="d-flex gap-3">
              <ImCheckboxChecked
                className={`icon-hover icon-complete ${
                  todo.completed ? "done" : ""
                } ${darkTheme ? "icon-glow-dark" : "icon-glow-light"}`}
                size={20}
                onClick={(e) => {
                  triggerBounce(e);
                  handleComplete(todo);
                }}
              />

              <FaEdit
                className={`icon-hover icon-edit ${
                  darkTheme ? "icon-glow-dark" : "icon-glow-light"
                }`}
                size={18}
                onClick={(e) => {
                  triggerBounce(e);
                  handleEdit(todo);
                }}
              />

              <AiFillDelete
                className={`icon-hover icon-delete ${
                  darkTheme ? "icon-glow-dark" : "icon-glow-light"
                }`}
                size={20}
                onClick={(e) => {
                  triggerBounce(e);
                  handleDelete(todo);
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Count */}
      <p className="text-center mt-3 small text-muted">
        Total: {todos.length} | Active:{" "}
        {todos.filter((t) => !t.completed).length} | Completed:{" "}
        {todos.filter((t) => t.completed).length}
      </p>
    </div>
  );
}
