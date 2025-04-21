import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Form({
  input,
  setInput,
  todos,
  setTodos,
  editTodo,
  setEditTodo,
}) {
  const [dueDate, setDueDate] = useState("");

  const updateTodo = (title, id, completed, dueDate) => {
    const newTodo = todos.map((todo) =>
      todo.id === id ? { title, id, completed, dueDate } : todo
    );
    setTodos(newTodo);
    setEditTodo(null);
  };

  useEffect(() => {
    if (editTodo) {
      setInput(editTodo.title);
      setDueDate(editTodo.dueDate || "");
    } else {
      setInput("");
      setDueDate("");
    }
  }, [editTodo, setInput]);

  const formSubmit = (e) => {
    e.preventDefault();
    if (!editTodo) {
      setTodos([
        ...todos,
        { id: uuidv4(), title: input, completed: false, dueDate },
      ]);
    } else {
      updateTodo(input, editTodo.id, editTodo.completed, dueDate);
    }
    setInput("");
    setDueDate("");
  };

  return (
    <form onSubmit={formSubmit} className="d-flex gap-2 flex-wrap mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Enter a task"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={100}
        required
      />
      <input
        type="date"
        className="form-control"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        {editTodo ? "Update" : "Add"}
      </button>
      <p className="text-muted small w-100">{input.length}/100 characters</p>
    </form>
  );
}
