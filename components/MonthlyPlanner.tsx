'use client';

import { useState } from 'react';
import { Category, MonthTasks, Task } from '@/types/task';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeeklyView from './WeeklyView';
import AddTaskModal from './AddTaskModal';
import {
  createTask,
  addTaskToMonth,
  updateTaskInMonth,
  deleteTaskFromMonth,
  getMonthDays,
  getCurrentWeekDays,
  getWeekDays,
  formatDate,
  getMonthName,
  getWeekDayNames,
} from '@/services/taskService';

/**
 * MonthlyPlanner - Container Component
 * Handles state management and orchestrates data flow for monthly calendar
 */
export default function MonthlyPlanner() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [monthTasks, setMonthTasks] = useState<MonthTasks>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState(today);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const handlePreviousMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      // Previous week
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      // Next week
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
      setCurrentMonth(newWeekStart.getMonth());
      setCurrentYear(newWeekStart.getFullYear());
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setCurrentWeekStart(now);
  };

  const handleViewModeChange = (mode: 'month' | 'week') => {
    setViewMode(mode);
    if (mode === 'week') {
      // Initialize week view with current date
      setCurrentWeekStart(new Date(currentYear, currentMonth, today.getDate()));
    }
  };

  const handleAddEventClick = () => {
    setSelectedDate(new Date(currentYear, currentMonth, today.getDate()));
    setModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSubmitTask = (name: string, category: Category, time?: string) => {
    if (editingTask) {
      // Update existing task
      setMonthTasks(updateTaskInMonth(monthTasks, editingTask.id, { name, category, time }));
      setEditingTask(null);
    } else if (selectedDate) {
      // Create new task
      const dateString = formatDate(selectedDate);
      const newTask = createTask(name, category, dateString, time);
      setMonthTasks(addTaskToMonth(monthTasks, newTask));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // Parse the task's date to create a Date object
    const [year, month, day] = task.date.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    setModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setMonthTasks(deleteTaskFromMonth(monthTasks, taskId));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleCategoryToggle = (category: Category | 'all') => {
    if (category === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  // Filter tasks based on selected categories
  const filterTasks = (tasks: MonthTasks): MonthTasks => {
    if (selectedCategories.length === 0) {
      return tasks;
    }

    const filtered: MonthTasks = {};
    Object.keys(tasks).forEach((date) => {
      const filteredDayTasks = tasks[date].filter((task) =>
        selectedCategories.includes(task.category)
      );
      if (filteredDayTasks.length > 0) {
        filtered[date] = filteredDayTasks;
      }
    });
    return filtered;
  };

  const monthDays = getMonthDays(currentYear, currentMonth);
  const weekDays = getWeekDays(currentYear, currentMonth, currentWeekStart);
  const monthName = getMonthName(currentMonth);
  const weekDayNames = getWeekDayNames();
  const filteredTasks = filterTasks(monthTasks);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthName={monthName}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onAddEvent={handleAddEventClick}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        {viewMode === 'month' ? (
          <CalendarGrid
            days={monthDays}
            currentMonth={currentMonth}
            tasks={filteredTasks}
            weekDayNames={weekDayNames}
            onDayClick={handleDayClick}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        ) : (
          <WeeklyView
            weekDays={weekDays}
            tasks={filteredTasks}
            onDayClick={handleDayClick}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}
      </div>

      <AddTaskModal
        isOpen={modalOpen}
        selectedDate={selectedDate}
        editingTask={editingTask}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
      />
    </div>
  );
}
