import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import { Delete, Edit, CheckCircle } from "@mui/icons-material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Sound from "../src/assets/sounds/alarm.mp3"; // Adjust the path as necessary
import axios from "axios";
import InfoIcon from "@mui/icons-material/Info";

const apiurl = "http://localhost:5000/api/"; // Replace with your actual API URL

function App() {
  const [todos, setTodos] = useState(
    JSON.parse(localStorage.getItem("todos")) || []
  );
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState(
    JSON.parse(localStorage.getItem("categories")) || [
      "All",
      "Work",
      "Study",
      "Shopping",
      "Fitness",
      "Personal",
    ]
  );
  const [category, setCategory] = useState("Personal");
  const [filterCategory, setFilterCategory] = useState("All");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [audioInstance, setAudioInstance] = useState(null);
  const [alarmTimeoutId, setAlarmTimeoutId] = useState(null);

  // Load todos and categories from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    const storedCategories = localStorage.getItem("categories");

    console.log(storedTodos);

    if (storedTodos) setTodos(JSON.parse(storedTodos));
    if (storedCategories) {
      const parsed = JSON.parse(storedCategories);
      if (Array.isArray(parsed)) {
        setCategories(["All", ...new Set(parsed.filter(Boolean))]);
      }
    }
  }, []);

  useEffect(() => {
    console.log("FETCHHHHHHHHH from API");

    axios
      .get(apiurl + "todoapp/getNotes")
      .then((response) => {
        console.log(response.data);
        setTodos(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

      axios
      .get(apiurl + "todoapp/categories")
      .then((response) => {
        console.log(response?.data);
        // setTodos(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const playAlarm = () => {
    const audio = new Audio(Sound);
    audio.play();
    setAudioInstance(audio);

    const timeoutId = setTimeout(() => {
      setIsAlarmActive(false);
      audio.pause();
      audio.currentTime = 0;
      setAudioInstance(null);
    }, 10000);

    setAlarmTimeoutId(timeoutId);
    setIsAlarmActive(true);
  };
  const stopAlarm = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
    }
    if (alarmTimeoutId) {
      clearTimeout(alarmTimeoutId);
      setAlarmTimeoutId(null);
    }
    setIsAlarmActive(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = dayjs().format("HH:mm");
      console.log(currentTime);

      const updatedTodos = todos.map((todo) => {
        if (
          todo.alarmTime === currentTime
          // && !todo.alarmTriggered
        ) {
          // setIsAlarmActive(true);
          playAlarm();
          return { ...todo, alarmTriggered: true };
        }
        return todo;
      });
      setTodos(updatedTodos);
    }, 10000); // Check every minute

    return () => clearInterval(interval);
  }, [todos]);

  // Store todos whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Store categories whenever they change (except "All")
  useEffect(() => {
    const filtered = categories.filter((cat) => cat !== "All");
    localStorage.setItem("categories", JSON.stringify(filtered));
  }, [categories]);

  const handleAdd = () => {
    if (!input.trim()) return;

    const formattedTime = selectedTime ? selectedTime.format("HH:mm") : null;
    const editTodo = {
      text: input,
      category,
      alarmTime: formattedTime,
    };

    if (editId) {
      axios
        .put(apiurl + `todoapp/editNote/${editId}`, editTodo)
        .then((response) => {
          console.log(response.data);
          setTodos(
            todos.map((todo) =>
              todo.id === editId
                ? {
                    ...todo,
                    text: input,
                    category,
                    alarmTime: formattedTime,
                    alarmTriggered: false, // reset alarm when updated
                  }
                : todo
            )
          );
          setEditId(null);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      const newTodo = {
        id: Date.now(),
        text: input,
        category,
        completed: false,
        alarmTime: formattedTime,
        alarmTriggered: false, // prevent immediate triggering
      };
      axios
        .post(apiurl + `todoapp/addNotes`, newTodo)
        .then((response) => {
          console.log(response.data);
          setTodos([...todos, newTodo]);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    setInput("");
    setCategory("Personal");
    setSelectedTime(null); // Clear time after adding
  };

  const handleDelete = (id) => {
    axios
      .delete(apiurl + `todoapp/deleteNote/${id}`)
      .then((response) => {
        console.log(response.data);
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEdit = (todo) => {
    setEditId(todo.id);
    setInput(todo.text);
    setCategory(todo.category);
  };

  const toggleComplete = (id) => {
    const formattedTime = selectedTime ? selectedTime.format("HH:mm") : null;

    const editTodo = {
      text: input,
      category,
      alarmTime: formattedTime,
      completed: !todos.find((todo) => todo.id === id).completed,
    };
    axios
      .put(apiurl + `todoapp/editNote/${id}`, editTodo)
      .then((response) => {
        console.log(response.data);
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const filtered =
    filterCategory === "All"
      ? todos
      : todos.filter((todo) => todo.category === filterCategory);

  const getCategoryStats = () => {
    const stats = {};
    categories
      .filter((c) => c !== "All")
      .forEach((cat) => {
        const all = todos.filter((todo) => todo.category === cat);
        const completed = all.filter((todo) => todo.completed);
        stats[cat] = {
          total: all.length,
          completed: completed.length,
          percentage: all.length
            ? Math.round((completed.length / all.length) * 100)
            : 0,
        };
      });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <Box
      sx={{
        backgroundColor: darkMode
          ? "#121212"
          : "linear-gradient(135deg, #f4f4f9, #ffffff)",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
        py: 4,
        transition: "background-color 0.3s, color 0.3s", // Smooth transition between modes
      }}
    >
      <Container maxWidth="md">
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h4">📝 Todo List</Typography>
            <Box
              onClick={() => setDarkMode(!darkMode)}
              className="d-flex align-items-center"
            >
              <Typography variant="h6" sx={{ cursor: "pointer" }}>
                {darkMode ? "🌙" : "☀️"}
              </Typography>
              <Tooltip title="App created by React.js,Node,mangoDB">
                <IconButton>
                  <InfoIcon style={{ color: darkMode ? "white" : "gray" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TextField
            label="Enter task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              backgroundColor: darkMode ? "#333" : "#fff", // Background color for light/dark mode
              color: darkMode ? "#fff" : "#000", // Text color for light/dark mode
              borderRadius: 2, // Rounded corners for a modern look
              "& .MuiOutlinedInput-root": {
                borderRadius: 2, // Apply rounding to the input field itself
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#ccc", // Border color for light/dark mode
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#1976d2" : "#3f51b5", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: darkMode ? "#1976d2" : "#3f51b5", // Border color on focus
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#fff" : "#000", // Label color for light/dark mode
              },
              "& .MuiInputBase-input": {
                color: darkMode ? "#fff" : "#000", // Text color inside the input box
              },
              "& .MuiFormHelperText-root": {
                color: darkMode ? "#bbb" : "#333", // Color of helper text (if any)
              },
            }}
          />
          <Box display="flex" gap={2}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              sx={{ marginTop: "15px" }}
            >
              <TimePicker
                // sx={{ marginTop: "15px" }}
                sx={{
                  marginTop: "15px",
                  backgroundColor: darkMode ? "#333" : "#fff", // Background color for light/dark mode
                  color: darkMode ? "#fff" : "#000", // Text color for light/dark mode
                  borderRadius: 2, // Rounded corners for a modern look
                  height: "56px",
                  "& .MuiOutlinedInput-root": {
                    color: darkMode ? "#fff" : "#000",
                    borderRadius: 2, // Apply rounding to the input field itself
                    "& fieldset": {
                      borderColor: darkMode ? "#555" : "#ccc", // Border color for light/dark mode
                    },
                    "&:hover fieldset": {
                      borderColor: darkMode ? "#1976d2" : "#3f51b5", // Border color on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: darkMode ? "#1976d2" : "#3f51b5", // Border color on focus
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: darkMode ? "#fff" : "#000", // Label color for light/dark mode
                  },
                  "& .MuiInputBase-input": {
                    color: darkMode ? "#fff" : "#000", // Text color inside the input box
                  },
                  "& .MuiFormHelperText-root": {
                    color: darkMode ? "#bbb" : "#333", // Color of helper text (if any)
                  },
                  "& .MuiPickersSectionList-root": {
                    color: darkMode ? "#fff" : "#000", // Text color inside the input box
                  },
                }}
                // style={{ marginTop: "15px" }}
                label="Alarm Time"
                value={selectedTime}
                onChange={(newValue) => setSelectedTime(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />
                )}
              />
            </LocalizationProvider>

            <Autocomplete
              freeSolo
              fullWidth
              value={category}
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  // User typed and selected "Add 'XYZ'"
                  if (!categories.includes(newValue)) {
                    setCategories([...categories, newValue]);
                  }
                  setCategory(newValue);
                } else if (newValue && newValue.inputValue) {
                  // Clicked the "Add 'XYZ'" option
                  if (!categories.includes(newValue.inputValue)) {
                    setCategories([...categories, newValue.inputValue]);
                  }
                  setCategory(newValue.inputValue);
                } else {
                  setCategory(newValue || "");
                }
              }}
              filterOptions={(options, params) => {
                const filtered = options.filter((opt) => opt !== "All");
                const { inputValue } = params;

                const isExisting = filtered.some(
                  (option) => inputValue.toLowerCase() === option.toLowerCase()
                );

                if (inputValue !== "" && !isExisting) {
                  filtered.push({
                    inputValue,
                    label: `➕ Add "${inputValue}"`,
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={categories.filter((c) => c !== "All")}
              getOptionLabel={(option) => {
                // Handle "Add 'xyz'" structure
                if (typeof option === "string") return option;
                if (option.inputValue) return option.inputValue;
                return option.label || option;
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  {typeof option === "string" ? option : option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  sx={{
                    backgroundColor: darkMode ? "#333" : "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: darkMode ? "#555" : "#ccc",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "#1976d2" : "#3f51b5",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: darkMode ? "#1976d2" : "#3f51b5",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: darkMode ? "#fff" : "#000",
                    },
                    "& .MuiInputBase-input": {
                      color: darkMode ? "#fff" : "#000",
                    },
                  }}
                />
              )}
            />
          </Box>

          <Button
            onClick={handleAdd}
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              backgroundColor: darkMode ? "#1976d2" : "#3f51b5",
              borderRadius: 2,
              fontWeight: "bold",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                backgroundColor: darkMode ? "#1565c0" : "#303f9f", // Darken on hover
                transform: "translateY(-3px)", // Slightly raise on hover
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)", // Add soft shadow
              },
              "&:focus": {
                boxShadow: darkMode ? "0 0 0 2px #1976d2" : "0 0 0 2px #3f51b5", // Focus ring
              },
            }}
          >
            {editId ? "Update Task" : "Add Task"}
          </Button>
        </Box>

        <Box
          display="flex"
          overflow="auto"
          py={2}
          sx={{
            position: "relative", // To position the arrows
            "&::-webkit-scrollbar": { height: "8px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#ccc",
              borderRadius: 4,
            },
          }}
        >
          {/* Left Arrow Button */}
          <IconButton
            onClick={() =>
              (document.getElementById("category-scroll").scrollLeft -= 180)
            }
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              backgroundColor: darkMode ? "#333" : "#fff",
              "&:hover": {
                backgroundColor: darkMode ? "#444" : "#f0f0f0",
              },
            }}
          >
            <ArrowBackIos />
          </IconButton>

          {/* Scrollable Container for Category Cards */}
          <Box
            id="category-scroll"
            display="flex"
            gap={2}
            sx={{
              overflowX: "auto",
              py: 2,
              flexWrap: "nowrap", // Prevent wrapping of items
              "&::-webkit-scrollbar": { height: "8px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: 4,
              },
            }}
          >
            {Object.entries(categoryStats).map(([cat, stats]) => (
              <Box
                key={cat}
                onClick={() => setFilterCategory(cat)}
                sx={{
                  flex: "0 0 auto",
                  bgcolor: darkMode ? "#1e1e1e" : "#fff",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  textAlign: "center",
                  minWidth: "180px",
                  cursor: "pointer",
                  border:
                    filterCategory === cat
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                  transition: "transform 0.2s, box-shadow 0.2s, border 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)", // Slightly scale the card on hover
                    boxShadow: 4, // Add shadow on hover
                  },
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {cat}
                </Typography>
                <Typography variant="body2">Tasks: {stats.total}</Typography>
                <Typography variant="body2">
                  Completed: {stats.completed}
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    stats.percentage === 100 ? "success.main" : "primary.main"
                  }
                >
                  {stats.percentage}% Complete
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Right Arrow Button */}
          <IconButton
            onClick={() =>
              (document.getElementById("category-scroll").scrollLeft += 180)
            }
            sx={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              backgroundColor: darkMode ? "#333" : "#fff",
              "&:hover": {
                backgroundColor: darkMode ? "#444" : "#f0f0f0",
              },
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>

        <List sx={{ mt: 3 }}>
          {filtered.map((todo) => (
            <ListItem
              key={todo.id}
              sx={{
                bgcolor: darkMode ? "#1e1e1e" : "#fff",
                mb: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
              secondaryAction={
                <>
                  <IconButton
                    onClick={() => toggleComplete(todo.id)}
                    sx={{
                      color: todo.completed
                        ? "success.main"
                        : darkMode
                        ? "#ccc"
                        : "#333",
                    }}
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEdit(todo)}
                    sx={{ color: darkMode ? "#f0ad4e" : "#ffa000" }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(todo.id)}
                    sx={{ color: darkMode ? "#f44336" : "#d32f2f" }}
                  >
                    <Delete />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <span
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "green" : "inherit",
                    }}
                  >
                    {todo.text}
                  </span>
                }
                secondary={
                  <span
                    style={{
                      color: darkMode ? "white" : "black",
                    }}
                  >
                    Category: {todo.category}
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>



        <Dialog open={isAlarmActive} onClose={stopAlarm}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AlarmOnIcon color="error" />
            Alarm Triggered
          </DialogTitle>
          <DialogContent>
            <Typography>
              Your alarm is going off. Click the button below to stop it.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={stopAlarm} variant="contained" color="error">
              Stop Alarm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default App;
