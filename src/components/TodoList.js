import React from "react";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { ImCheckboxChecked } from "react-icons/im";
export default function TodoList({ todos, setTodos, setEditTodo }) {
  const handleDelete = ({ id }) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };
  const handleComplete = (todo) => {
    setTodos(
      todos.map((item) => {
        if (item.id === todo.id) {
          return { ...item, completed: !item.completed };
        }
        return item;
      })
    );
  };
  const handleEdit = ({ id }) => {
    document.getElementById("todoinput").autofocus = true;
    const findTodo = todos.find((todo) => todo.id === id);
    setEditTodo(findTodo);
  };
  return (
    <div style={{ margin: "auto" }}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={{
            listStyle: "none",
            display: "flex",
            margin: "10px 10px 10px 40px",
          }}
        >
          <input
            type="text"
            className="list-item"
            style={{
              color: todo.completed ? "red" : "white",
              border: "none",
              outline: "none",
              background: "gray",
              width: "200px",
              height: "40px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
            value={todo.title}
            onChange={(e) => e.preventDefault()}
            readOnly
          />
          <h3
            onClick={() => handleComplete(todo)}
            style={{
              margin: "10px",
              color: todo.completed ? "lightgreen" : "red",
            }}
          >
            <ImCheckboxChecked />
          </h3>
          <h3
            onClick={() => handleEdit(todo)}
            style={{ margin: "10px", color: "violet" }}
          >
            <FaEdit />
          </h3>
          <h3
            onClick={() => handleDelete(todo)}
            style={{ margin: "10px", color: "orange" }}
          >
            <AiFillDelete />
          </h3>
        </li>
      ))}
    </div>
  );
}
