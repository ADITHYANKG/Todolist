import { useEffect, useMemo, useState } from 'react';
import './App.css';

const starterTasks = [
  { id: 1, title: 'Plan the week ahead', category: 'Personal', done: false, date: 'Today' },
  { id: 2, title: 'Review project milestones', category: 'Work', done: false, date: 'Today' },
  { id: 3, title: 'Pick up groceries', category: 'Personal', done: false, date: 'Tomorrow' },
  { id: 4, title: 'Read for 20 minutes', category: 'Learning', done: true, date: 'Yesterday' },
];

const navItems = [
  { id: 'all', label: 'All tasks', icon: '▤' },
  { id: 'today', label: 'Today', icon: '◷' },
  { id: 'upcoming', label: 'Upcoming', icon: '▦' },
  { id: 'completed', label: 'Completed', icon: '✓' },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('little-list-tasks');
      return saved ? JSON.parse(saved) : starterTasks;
    } catch {
      return starterTasks;
    }
  });
  const [activeView, setActiveView] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('Personal');

  useEffect(() => localStorage.setItem('little-list-tasks', JSON.stringify(tasks)), [tasks]);

  const categories = useMemo(() => ['All', ...new Set(tasks.map((task) => task.category))], [tasks]);
  const remaining = tasks.filter((task) => !task.done).length;
  const visibleTasks = tasks.filter((task) => {
    const matchesView = activeView === 'all'
      || (activeView === 'today' && task.date === 'Today' && !task.done)
      || (activeView === 'upcoming' && task.date === 'Tomorrow' && !task.done)
      || (activeView === 'completed' && task.done);
    const matchesCategory = activeCategory === 'All' || task.category === activeCategory;
    return matchesView && matchesCategory && task.title.toLowerCase().includes(search.toLowerCase());
  });

  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [{ id: Date.now(), title, category, done: false, date: 'Today' }, ...current]);
    setNewTask('');
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const heading = navItems.find((item) => item.id === activeView)?.label || 'All tasks';

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Little List home">
          <span className="brand-mark"><span /></span><span>little<span className="brand-light">list</span></span>
        </a>
        <div className="sidebar-label">MENU</div>
        <nav className="main-nav" aria-label="Task views">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => setActiveView(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === 'all' && <span className="nav-count">{remaining}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-label categories-label">CATEGORIES <button className="tiny-add" onClick={() => { setActiveCategory('All'); document.querySelector('.task-input')?.focus(); }} aria-label="Add a task">+</button></div>
        <div className="category-nav">
          {categories.filter((item) => item !== 'All').map((item, index) => (
            <button key={item} className={`category-item ${activeCategory === item ? 'selected' : ''}`} onClick={() => setActiveCategory(activeCategory === item ? 'All' : item)}>
              <span className={`category-dot dot-${index % 4}`} />{item}
            </button>
          ))}
          {categories.length === 1 && <span className="category-empty">Your categories will show up here</span>}
        </div>
        <div className="sidebar-bottom"><div className="avatar">A</div><div><strong>Adithya</strong><span>Free plan</span></div><span className="more">···</span></div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">My workspace <span>/</span> <strong>{heading}</strong></div>
          <div className="top-actions"><span className="today-date">Friday, October 30</span><button className="profile-avatar" aria-label="Profile">A</button></div>
        </header>
        <div className="content-wrap">
          <div className="welcome-row"><div><div className="eyebrow">YOUR SPACE, YOUR PACE</div><h1>{activeView === 'today' ? 'Today' : activeView === 'upcoming' ? 'Coming up' : activeView === 'completed' ? 'Nicely done' : 'My tasks'}<span className="wave">✳</span></h1><p className="subtitle">{activeView === 'completed' ? 'Look at everything you’ve accomplished.' : `You have ${remaining} ${remaining === 1 ? 'thing' : 'things'} left on your list. You’ve got this.`}</p></div><div className="progress-card"><div className="progress-copy"><span>DAILY PROGRESS</span><strong>{tasks.length ? Math.round(tasks.filter((task) => task.done).length / tasks.length * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${tasks.length ? tasks.filter((task) => task.done).length / tasks.length * 100 : 0}%` }} /></div><div className="progress-foot">A little progress is still progress 🌱</div></div></div>

          {activeView !== 'completed' && <form className="add-task" onSubmit={addTask}><span className="add-plus">+</span><input className="task-input" value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a task..." aria-label="New task" /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Task category"><option>Personal</option><option>Work</option><option>Learning</option><option>Other</option></select><button className="add-button" type="submit">Add task <span>↵</span></button></form>}

          <div className="list-toolbar"><div className="list-title"><h2>{heading}</h2><span className="task-total">{visibleTasks.length}</span></div><div className="toolbar-actions"><div className="filter-pills">{['All', ...categories.filter((item) => item !== 'All')].map((item) => <button key={item} onClick={() => setActiveCategory(item)} className={activeCategory === item ? 'pill active-pill' : 'pill'}>{item}</button>)}</div><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search tasks" /></label></div></div>

          <div className="task-list">
            {visibleTasks.map((task) => <article className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>{task.done && '✓'}</button><div className="task-details"><span className="task-name">{task.title}</span><span className="task-date">{task.date === 'Today' ? '◷ Today' : task.date === 'Tomorrow' ? '◷ Tomorrow' : '✓ Completed'}</span></div><span className={`task-category cat-${task.category.toLowerCase()}`}>{task.category}</span><button className="delete-task" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button></article>)}
            {visibleTasks.length === 0 && <div className="empty-state"><div className="empty-illustration">✿</div><strong>{search ? 'No tasks found' : 'Nothing on your list'}</strong><span>{search ? 'Try another search.' : 'Enjoy the breathing room, or add a task above.'}</span></div>}
          </div>
          {activeView !== 'completed' && <div className="list-footer"><span>SHOWING {visibleTasks.length} OF {tasks.length} TASKS</span><span>Made for your everyday ✷</span></div>}
        </div>
      </section>
    </main>
  );
}

export default App;
