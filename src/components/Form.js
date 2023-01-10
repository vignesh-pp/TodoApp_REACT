import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
export default function Form({
  input,
  setInput,
  todos,
  setTodos,
  editTodo,
  setEditTodo,
}) {
  const updateTodo = (title, id, completed) => {
    const newTodo = todos.map((todo) =>
      todo.id === id ? { title, id, completed } : todo
    );
    setTodos(newTodo);
    setEditTodo("");
  };
  useEffect(() => {
    if (editTodo) {
      setInput(editTodo.title);
    } else {
      setInput("");
    }
  }, [setInput, editTodo]);
  const formSubmit = (e) => {
    e.preventDefault();
    if (!editTodo) {
      setTodos([...todos, { id: uuidv4(), title: input, completed: false }]);
      console.log(todos);
      setInput("");
    } else {
      updateTodo(input, editTodo.id, editTodo.completed);
    }
  };
  const onInputChange = (e) => {
    setInput(e.target.value);
  };
  return (
    <div>
      <form onSubmit={formSubmit}>
        <input
          type="text"
          placeholder="Enter..."
          id="todoinput"
          className="task-input"
          value={input}
          onChange={onInputChange}
          required
          style={{
            background: "black",
            border: "none",
            width: "200px",
            height: "40px",
            color: "white",
            borderRadius: "4px",
            padding: "10px",
            margin: "10px",
          }}
        />
        <button type="submit" className="btn btn-primary">
          {editTodo ? "OK" : "Add"}
        </button>
      </form>
    </div>
  );
}
