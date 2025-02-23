"use client";
import {
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface LovecraftResponse {
  data: {
    id: string;
    sentence: string;
    book: {
      id: string;
      name: string;
      year: string;
    };
  }[];
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>("");

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = async (): Promise<void> => {
    if (newTask.trim() === "") return; // Prevent adding empty tasks
    try {
      const res = await fetch("/api/lovecraft");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: LovecraftResponse = await res.json();
      const sentence = data.data[0].sentence;
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Date.now(), text: sentence, completed: false },
      ]);
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setNewTask("");
    }
  };

  const startEditingTask = (id: number, text: string): void => {
    setEditingTaskId(id);
    setEditedTaskText(text);
  };

  const updateTask = (): void => {
    if (editedTaskText.trim() !== "") {
      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId ? { ...task, text: editedTaskText } : task
        )
      );
      setEditingTaskId(null);
      setEditedTaskText("");
    }
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <section>
      <h1>Todo List</h1>
      {tasks.length > 0 &&
        tasks.map((task) => {
          return (
            <div className="p-2 flex flex-row gap-2" key={task.id}>
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editedTaskText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditedTaskText(e.target.value)
                  }
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      updateTask();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                />
              ) : (
                <span
                  className={`flex-1 text-gray-800 dark:text-gray-200 ${
                    task.completed
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : ""
                  }`}
                >
                  {task.text}
                </span>
              )}
              <div>
                {editingTaskId === task.id ? (
                  <button
                    onClick={updateTask}
                    className="bg-black hover:bg-slate-800 text-white font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEditingTask(task.id, task.text)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Edit
                  </button>
                )}
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      <input
        className="bg-white text-black"
        type="text"
        value={newTask}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setNewTask(e.target.value)
        }
      />
      <button onClick={addTask}>Add Task</button>
    </section>
  );
}
